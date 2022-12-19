import { ConsoleLogger } from '@slack/logger';
import { WebClient } from '@slack/web-api';
import { Coordinates } from 'adhan';
import { COLLECTIONS, userSchema } from '../constants';
import clientPromise from '../db/mongodb';
import { Adhan } from '../lib/adhan';
import { getAuthToken } from '../slack/app';
import { MessageScheduler } from '../slack/message-scheduler';

exports.handler = async function rescheduleJob(event: any) {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));

  const client = await clientPromise;
  const db = client.db();
  const userCollection = db.collection<userSchema>(COLLECTIONS.users);
  // scan for user that have time 01:00 AM and re-schedule their messages
  const expr = {
    $expr: {
      $and: [
        { $eq: [{ $hour: { date: new Date(), timezone: '$tz' } }, 1] },
        { $eq: [{ $minute: { date: new Date(), timezone: '$tz' } }, 0] },
      ],
    },
  };
  const users = userCollection.find(expr);
  console.log(`Found ${await userCollection.countDocuments(expr)} users`);
  while (await users.hasNext()) {
    const user = await users.next();
    if (!user) continue;

    console.log('USER: \n' + JSON.stringify(user, null, 2));

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

    try {
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
    } catch (e) {
      console.log(e);
    }
  }
};
