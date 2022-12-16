import serverlessExpress from '@vendia/serverless-express';
import { expressReceiver, registerEvents } from '../slack/app';

registerEvents();
exports.slackHandler = serverlessExpress({ app: expressReceiver.app });
