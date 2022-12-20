import serverlessExpress from '@vendia/serverless-express';
import { SlackApp } from '../slack/app';

const slackApp = new SlackApp();
slackApp.registerEvents();
exports.handler = serverlessExpress({ app: slackApp.expressReceiver.app });
