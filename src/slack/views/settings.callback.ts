import {
  Middleware,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
} from '@slack/bolt';
import { Coordinates } from 'adhan';
import {
  calculationMethod,
  COLLECTIONS,
  ILanguages,
  prayerWithoutNone,
  settingsView,
} from '../../constants';
import clientPromise from '../../db/mongodb';
import { Adhan } from '../../lib/adhan';
import { getTeamIdViewSubmitAction } from '../../lib/utils';
import { homeBlock } from '../blocks/home.block';
import { MessageScheduler } from '../message-scheduler';

export const settingsViewCallback: Middleware<
  SlackViewMiddlewareArgs<ViewSubmitAction>
> = async ({ ack, view, body, client, logger }) => {
  const userId = body.user.id;
  const teamId = getTeamIdViewSubmitAction(body);

  const mongoClient = await clientPromise;
  const db = mongoClient.db();

  const userCollection = db.collection(COLLECTIONS.users);

  try {
    const {
      [settingsView.fields.latitude]: {
        [settingsView.fields.latitude]: { value: latitude },
      },
      [settingsView.fields.longitude]: {
        [settingsView.fields.longitude]: { value: longitude },
      },
      [settingsView.fields.reminderList]: {
        [settingsView.fields.reminderList]: {
          selected_options: reminderListOptions,
        },
      },
      [settingsView.fields.calculationMethod]: {
        [settingsView.fields.calculationMethod]: {
          selected_option: calculationMethodOption,
        },
      },
      [settingsView.fields.language]: {
        [settingsView.fields.language]: { selected_option: languageOption },
      },
    } = view.state.values;

    const reminderList = reminderListOptions?.map(
      (option) => option.value as prayerWithoutNone,
    );

    if (!latitude || !longitude) {
      await ack({
        response_action: 'errors',
        errors: {
          [settingsView.fields.latitude]: 'latitude is required',
          [settingsView.fields.longitude]: 'longitude is required',
        },
      });
      return;
    }

    if (!calculationMethodOption?.value) {
      await ack({
        response_action: 'errors',
        errors: {
          [settingsView.fields.calculationMethod]:
            'in order to get correct time the calculation method is required',
        },
      });
      return;
    }
    ack();

    const userInfo = await client.users.info({
      user: userId,
      include_locale: true,
    });
    const coordinates = new Coordinates(+latitude, +longitude);

    if (coordinates && calculationMethodOption.value) {
      const adhan = new Adhan(
        new Coordinates(coordinates.latitude, coordinates.longitude),
        calculationMethodOption.value as calculationMethod,
        userInfo.user?.tz,
        (languageOption?.value as ILanguages) || 'en',
      );

      await client.views.publish({
        user_id: userId,
        view: homeBlock({
          currentDate: adhan.currentDate,
          times: adhan.localizedPrayerList,
          language: languageOption?.value as ILanguages,
          reminderList,
          nextPrayer: {
            name: adhan.nextPrayer,
            remainingTime: adhan.remainingTime(
              adhan.prayerTimes.timeForPrayer(adhan.prayerTimes.nextPrayer()),
            ),
          },
        }),
      });

      try {
        await userCollection.updateOne(
          {
            userId,
          },
          {
            $set: {
              userId,
              teamId,
              coordinates,
              calculationMethod: calculationMethodOption.value,
              reminderList,
              tz: userInfo.user?.tz,
              language: languageOption?.value || 'en',
            },
          },
          { upsert: true },
        );
        logger.info('User settings updated');
      } catch (e) {
        logger.error('Error while updating user settings', e);
      }

      const messageScheduler = new MessageScheduler(client, logger);

      // FIXME: prevent rescheduling if the user didn't change the reminder list
      await messageScheduler.reScheduleMessages(userId, teamId, reminderList);
    }
  } catch (error) {
    logger.error(error);
  }
};
