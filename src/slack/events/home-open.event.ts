import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { Coordinates } from 'adhan';
import { Md } from 'slack-block-builder';
import { COLLECTIONS, userSchema } from '../../constants';
import clientPromise from '../../db/mongodb';
import { Adhan } from '../../lib/adhan';
import { LOCALS } from '../../lib/locals';
import { getTeamIdFromContext } from '../../lib/utils';
import { homeBlock } from '../blocks/home.block';

export const homeOpenedEvent: Middleware<
  SlackEventMiddlewareArgs<'app_home_opened'>
> = async ({ client, event, context }) => {
  const mongoClient = await clientPromise;
  const db = mongoClient.db();
  const userCollection = db.collection<userSchema>(COLLECTIONS.users);
  const teamId = getTeamIdFromContext(context);

  const user = await userCollection.findOne({
    userId: event.user,
    teamId,
  });
  if (!user) {
    await client.views.publish({
      user_id: event.user,
      view: homeBlock({
        currentDate: `Please set your location by clicking on ${Md.italic(
          'Prayer Configs',
        )}`,
      }),
    });
    return;
  }

  const { calculationMethod, coordinates, reminderList, language } = user;

  if (!coordinates) {
    await client.views.publish({
      user_id: event.user,
      view: homeBlock({
        currentDate: LOCALS.NO_COORDINATES_SETTINGS[language],
      }),
    });
  } else {
    const userInfo = await client.users.info({
      user: event.user,
    });

    const adhan = new Adhan(
      new Coordinates(coordinates.latitude, coordinates.longitude),
      calculationMethod,
      userInfo.user?.tz,
      language,
    );

    await client.views.publish({
      user_id: event.user,
      view: homeBlock({
        currentDate: adhan.currentDate,
        times: adhan.localizedPrayerList,
        reminderList,
        language,
        nextPrayer: {
          name: adhan.nextPrayer,
          remainingTime: adhan.remainingTime(
            adhan.prayerTimes.timeForPrayer(adhan.prayerTimes.nextPrayer()),
          ),
        },
      }),
    });
  }
};
