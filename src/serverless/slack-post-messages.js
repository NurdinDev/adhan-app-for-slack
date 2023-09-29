import {
  CloudWatchEventsClient,
  DeleteRuleCommand,
  RemoveTargetsCommand,
} from '@aws-sdk/client-cloudwatch-events';
import { LambdaClient, RemovePermissionCommand } from '@aws-sdk/client-lambda';
import { isAfter, parseISO } from 'date-fns';
import { BlockCollection, Blocks } from 'slack-block-builder';
import { minutesOffset } from '../constants';
import { LOCALS } from '../lib/locals';
import { getReadableName } from '../lib/utils';
import { SlackApp } from '../slack/app';

const slackApp = new SlackApp();

async function checkUserPresenceJob(slackClient, userId) {
  try {
    const result = await slackClient.users.getPresence({ user: userId });
    console.log(result);
    return result.presence;
  } catch (error) {
    console.error(error);
    return 'unknown';
  }
}

async function sendMessageJob(event) {
  const { userId, teamId, prayerName, language = 'en' } = event;

  console.log('Running job...');

  const slackClient = await slackApp.getClient(teamId);
  const userPresence = await checkUserPresenceJob(slackClient, userId);

  if (userPresence !== 'active') {
    console.log('User is not active', userPresence);
    return;
  }

  const text = `🕌 ${LOCALS.REMINDER.FIRST[language]}, ${getReadableName(
    prayerName,
    language,
  )} ${LOCALS.REMINDER.IN[language]} ${minutesOffset} ${
    LOCALS.REMINDER.MINUTES[language]
  }`;

  const blocks = BlockCollection(
    Blocks.Section().text(
      `*${LOCALS.REMINDER.FIRST[language]}*\n ${getReadableName(
        prayerName,
        language,
      )} ${LOCALS.REMINDER.IN[language]} ${minutesOffset} ${
        LOCALS.REMINDER.MINUTES[language]
      }`,
    ),
  );

  const postMessage = await slackClient.chat.postMessage({
    channel: userId,
    text,
    blocks,
    username: LOCALS.BOT_USERNAME[language],
  });

  if (postMessage.ok) {
    console.log(`Reminder for ${prayerName} with message ${text}`);
  }

  if (postMessage.error) {
    console.error(postMessage.error);
  }
}

async function cleanupCloudWatchEvent(lambdaFunctionName, ruleName) {
  const eventBridgeClient = new CloudWatchEventsClient();
  const lambdaClient = new LambdaClient();

  try {
    // 1. Remove the target from the rule
    const removeTargetsCommand = new RemoveTargetsCommand({
      Rule: ruleName,
      Ids: ['1'],
    });
    await eventBridgeClient.send(removeTargetsCommand);
  } catch (error) {
    console.error(error);
  }
  try {
    // 2. Delete the rule
    const deleteRuleCommand = new DeleteRuleCommand({
      Name: ruleName,
    });
    await eventBridgeClient.send(deleteRuleCommand);
  } catch (error) {
    console.error(error);
  }

  try {
    // 3. Remove the permission from the Lambda function
    const statementId = `${ruleName}-SID`;
    const removePermissionCommand = new RemovePermissionCommand({
      FunctionName: lambdaFunctionName,
      StatementId: statementId,
    });

    await lambdaClient.send(removePermissionCommand);
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param {
 * userId: string;
 * teamId: string;
 * prayerName: string;
 * language: string;
 * tz: string;
 * ruleName: string;
 * } event
 * @returns
 */
const handler = async (event) => {
  try {
    if (isAfter(new Date(), parseISO(event.timeForPrayer))) {
      console.log(new Date(), event.timeForPrayer);
      console.log('Prayer time is not yet');
      return;
    }
    await sendMessageJob({
      userId: event.userId,
      teamId: event.teamId,
      prayerName: event.prayerName,
      language: event.language,
      token: event.token,
    });
  } catch (error) {
    console.error(error);
  }

  try {
    await cleanupCloudWatchEvent(
      `adhan-slack-app-${process.env.STAGE}-slack-post-messages`,
      event.ruleName,
    );
  } catch (error) {
    console.error(error);
  }
};

exports.handler = handler;

// {
//     "userId": "U045WMNSU4A",
//     "teamId": "T045TNYLAQM",
//     "prayerName": "maghrib",
//     "timeForPrayer": "2023-09-27T16:02:00.000Z",
//     "language": "en",
//     "tz": "Asia/Istanbul",
//     "ruleName": "T045TNYLAQM-U045WMNSU4A-maghrib"
//   }
