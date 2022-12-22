import * as env from 'env-var';
import schedule from 'node-schedule';
import { SlackApp } from './slack/app';

(async () => {
  const slackApp = new SlackApp();
  slackApp.registerEvents();
  await slackApp.app.start(env.get('PORT').default(3000).asPortNumber());
  console.log('⚡️ Bolt app is running!');

  schedule.scheduleJob('0,30 * * * *', async function () {
    console.log('> Scheduled job: scanAndSchedule');
    const time = {
      h: 1,
      m: 0,
    };
    await slackApp.scanAndSchedule(time);
  });
})();
