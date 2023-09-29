import { SlackApp } from '../slack/app';

const slackApp = new SlackApp();
const handler = async function scanAndSchedule(event) {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  const time = event['scheduleTime'] ?? { h: 1, m: 0 };
  await slackApp.scanAndSchedule(time);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Scan and schedule completed successfully!',
      input: event,
    }),
  };
};

exports.handler = handler;
