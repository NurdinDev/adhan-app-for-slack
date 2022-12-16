import * as env from 'env-var';
import { app, registerEvents } from './slack/app';

(async () => {
  registerEvents();
  await app.start(env.get('PORT').default(3000).asPortNumber());
  console.log('⚡️ Bolt app is running!');
})();
