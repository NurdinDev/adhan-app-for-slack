import { SlackApp } from '../slack/app';

const slackApp = new SlackApp();
const handler = async function scanAndSchedule(event: any) {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  const time = event['scheduleTime'] ?? { h: 1, m: 0 };
  await slackApp.scanAndSchedule(time);
};

exports.handler = handler;
