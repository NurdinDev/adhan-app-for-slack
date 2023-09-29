import serverlessExpress from '@vendia/serverless-express';
import { SlackApp } from '../slack/app';

let serverlessExpressInstance;

async function setup(event, context) {
  const slackApp = new SlackApp();
  slackApp.registerEvents();

  serverlessExpressInstance = serverlessExpress({
    app: slackApp.expressReceiver.app,
  });
  return serverlessExpressInstance(event, context);
}

function handler(event, context) {
  if (serverlessExpressInstance)
    return serverlessExpressInstance(event, context);

  return setup(event, context);
}

exports.handler = handler;
