import { ConsoleLogger } from '@slack/logger';
import { WebClient } from '@slack/web-api';
import { Coordinates } from 'adhan';
import { COLLECTIONS, userSchema } from '../constants';
import clientPromise from '../db/mongodb';
import { Adhan } from '../lib/adhan';
import { getAuthToken } from '../slack/app';
import { MessageScheduler } from '../slack/message-scheduler';

async function rescheduleJob() {
  const client = await clientPromise;
  const db = client.db();
  const userCollection = db.collection<userSchema>(COLLECTIONS.users);
  // scan for user that have time 01:00 AM and re-schedule their messages
  const users = userCollection.find({
    $expr: {
      $and: [
        { $eq: [{ $hour: { date: new Date(), timezone: '$tz' } }, 1] },
        { $eq: [{ $minute: { date: new Date(), timezone: '$tz' } }, 0] },
      ],
    },
  });
  console.log({ users });
  while (await users.hasNext()) {
    const user = await users.next();
    if (!user) continue;

    const {
      userId,
      teamId,
      tz,
      coordinates,
      reminderList,
      calculationMethod,
      language,
    } = user;
    if (!coordinates || !reminderList) return;

    const adhan = new Adhan(
      new Coordinates(coordinates.latitude, coordinates.longitude),
      calculationMethod,
      tz,
      language,
    );

    if (adhan.nextPrayer === 'none') return;

    const token = await getAuthToken(teamId);

    if (!token) return;

    const messageScheduler = new MessageScheduler(
      new WebClient(token),
      new ConsoleLogger(),
    );

    await messageScheduler.reScheduleMessages(userId, teamId, reminderList);
  }
}
exports.slackCron = rescheduleJob();
