import {
  BlockAction,
  Middleware,
  SlackActionMiddlewareArgs,
} from '@slack/bolt';
import { COLLECTIONS, userSchema } from '../../constants';
import clientPromise from '../../db/mongodb';
import { settingsBlock } from '../blocks/settings.block';

const settingsAction: Middleware<
  SlackActionMiddlewareArgs<BlockAction>
> = async ({ ack, body, client, logger }) => {
  await ack();
  const userId = body.user.id;
  const mongoClient = await clientPromise;
  const db = mongoClient.db();
  const userCollection = db.collection<userSchema>(COLLECTIONS.users);

  try {
    const user = await userCollection.findOne({
      userId,
    });
    if (!user) {
      logger.error('user not found');
      // return;
      await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: body.trigger_id,
        // View payload
        view: settingsBlock(),
      });
      return;
    }
    const { calculationMethod, coordinates, reminderList, language } = user;
    // Call views.open with the built-in client
    await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: settingsBlock(
        coordinates,
        calculationMethod,
        reminderList,
        language,
      ),
    });
  } catch (error) {
    logger.error(error);
  }
};

export default settingsAction;
