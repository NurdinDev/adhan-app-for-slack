import serverlessExpress from '@vendia/serverless-express';
import { expressReceiver, registerEvents } from '../slack/app';

registerEvents();
exports.handler = serverlessExpress({ app: expressReceiver.app });
