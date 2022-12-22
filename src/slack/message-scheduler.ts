import { Block, KnownBlock } from '@slack/bolt';
import { Logger, WebClient } from '@slack/web-api';
import { Coordinates } from 'adhan';
import moment from 'moment-timezone';
import { BlockCollection, Blocks } from 'slack-block-builder';
import {
  COLLECTIONS,
  ILanguages,
  minutesOffset,
  prayerWithoutNone,
  userSchema,
} from '../constants';
import clientPromise from '../db/mongodb';
import { Adhan } from '../lib/adhan';
import { LOCALS } from '../lib/locals';
import { getReadableName } from '../lib/utils';

export class MessageScheduler {
  constructor(private client: WebClient, private logger: Logger) {}

  /**
   * handle sending sequence of messages, first message is the reminder before 10 minutes
   * second message is the time of the prayer when actual time is reached
   * @param prayerName prayer name
   * @param date prayer time
   */
  private async handleScheduleMessages(
    userId: string,
    teamId: string,
    prayerName: prayerWithoutNone,
    date: Date,
    timezone?: string,
    language: ILanguages = 'en',
  ): Promise<string[]> {
    const reminderTime = new Date(date);
    const actualTime = new Date(date);
    reminderTime.setMinutes(reminderTime.getMinutes() - minutesOffset);

    return await Promise.all([
      this.scheduleMessage(
        userId,
        teamId,
        prayerName,
        reminderTime,
        `🕌 ${LOCALS.REMINDER.FIRST[language]}, ${getReadableName(
          prayerName,
          language,
        )} ${LOCALS.REMINDER.IN[language]} ${minutesOffset} ${
          LOCALS.REMINDER.MINUTES[language]
        }`,
        BlockCollection(
          Blocks.Section().text(
            `*${LOCALS.REMINDER.FIRST[language]}*\n ${getReadableName(
              prayerName,
              language,
            )} ${LOCALS.REMINDER.IN[language]} ${minutesOffset} ${
              LOCALS.REMINDER.MINUTES[language]
            }`,
          ),
        ),
      ),
      this.scheduleMessage(
        userId,
        teamId,
        prayerName,
        actualTime,
        `🕌 ${LOCALS.REMINDER.SECOND[language]}, ${getReadableName(
          prayerName,
          language,
        )} ${LOCALS.REMINDER.AT[language]} ${this.formatDateToTime(
          date,
          timezone,
        )}`,
        BlockCollection(
          Blocks.Section().text(
            `*${LOCALS.REMINDER.SECOND[language]}*\n ${getReadableName(
              prayerName,
              language,
            )} ${LOCALS.REMINDER.AT[language]} ${this.formatDateToTime(
              date,
              timezone,
            )}`,
          ),
        ),
      ),
    ]);
  }

  async reScheduleMessages(
    userId: string,
    teamId: string,
    nextPrayersList?: prayerWithoutNone[],
  ) {
    const user = await this.getUserFromDb(userId, teamId);
    if (!user) return;
    const { messages, coordinates, tz, calculationMethod, language } = user;
    if (!coordinates || !calculationMethod) return;
    const adhan = new Adhan(
      new Coordinates(coordinates.latitude, coordinates.longitude),
      calculationMethod,
      tz,
      language,
    );
    if (adhan.nextPrayer === 'none') return;

    if (messages) {
      await Promise.all(
        Object.values(messages)
          .filter((v) => v !== null)
          .reduce((acc, value) => {
            acc.push(...value);
            return acc;
          }, [])
          .map((messageId) => this.deleteScheduledMessage(userId, messageId)),
      ).catch((error) => {
        this.logger.error(error);
      });
    }

    const messagesMap = new Map();
    if (nextPrayersList?.length) {
      for (const prayerName of nextPrayersList) {
        const timeForPrayer = adhan.prayerTimes.timeForPrayer(prayerName);
        // if the time in the past, skip it
        if (
          moment(timeForPrayer).isBefore(moment().subtract(minutesOffset, 'm'))
        ) {
          continue;
        }
        if (timeForPrayer instanceof Date) {
          const ids = await this.handleScheduleMessages(
            userId,
            teamId,
            prayerName,
            timeForPrayer,
            tz,
            language,
          ).catch((error) => {
            this.logger.error(error);
          });
          messagesMap.set(prayerName, ids);
        }
      }
    }

    await this.updateUserMessages(userId, teamId, messagesMap);
  }

  private async updateUserMessages(
    userId: string,
    teamId: string,
    messagesMap: Map<prayerWithoutNone, string>,
  ) {
    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    // update the user with the scheduled messages ids
    const userCollection = db.collection<userSchema>(COLLECTIONS.users);
    await userCollection.updateOne(
      { teamId, userId },
      {
        $set: {
          'messages.fajr': messagesMap.get('fajr'),
          'messages.sunrise': messagesMap.get('sunrise'),
          'messages.dhuhr': messagesMap.get('dhuhr'),
          'messages.asr': messagesMap.get('asr'),
          'messages.maghrib': messagesMap.get('maghrib'),
          'messages.isha': messagesMap.get('isha'),
        },
      },
    );
  }

  private async getUserFromDb(userId: string, teamId?: string) {
    // get user from db
    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    const userCollection = db.collection<userSchema>(COLLECTIONS.users);
    const user = await userCollection.findOne({ userId, teamId });
    return user;
  }

  private formatDateToTime(date: Date, timezone?: string) {
    if (timezone) {
      return moment(date).tz(timezone).format('HH:mm');
    }
    return moment(date).format('HH:mm');
  }

  private convertUnixTimestamp(date: Date) {
    return Math.floor(date.getTime() / 1000);
  }

  private async deleteScheduledMessage(userId: string, messageId?: string) {
    if (!messageId) return;
    try {
      const deleteMessage = await this.client.chat.deleteScheduledMessage({
        channel: userId,
        scheduled_message_id: messageId,
      });
      if (deleteMessage.ok) {
        this.logger.info(`Deleted scheduled message ${messageId}`);
      }
      if (deleteMessage.error) {
        this.logger.error(`Error deleting scheduled message ${messageId}`);
      }

      return deleteMessage;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * this function will send client.chat.scheduleMessage to slack
   * and it will check if there is an offset, the time will be subtracted by the offset
   * @param prayerName prayer name
   * @param time time for the prayer
   * @param minutes offset in minutes
   */
  private async scheduleMessage(
    userId: string,
    teamId: string,
    prayerName: string,
    time: Date,
    text: string,
    blocks: (KnownBlock | Block)[],
  ): Promise<string> {
    try {
      const scheduleMessage = await this.client.chat.scheduleMessage({
        channel: userId,
        team_id: teamId,
        post_at: this.convertUnixTimestamp(time),
        blocks,
        text,
      });

      if (scheduleMessage.ok) {
        this.logger.info(`Reminder for ${prayerName} with message ${text}`);
        return scheduleMessage.scheduled_message_id as string;
      }
      if (scheduleMessage.error) {
        this.logger.error(scheduleMessage.error);
      }
      return '';
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
