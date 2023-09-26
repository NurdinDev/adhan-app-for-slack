import {
  CloudWatchEventsClient,
  DeleteRuleCommand,
  PutRuleCommand,
  PutRuleCommandInput,
  PutTargetsCommand,
  RemoveTargetsCommand,
} from '@aws-sdk/client-cloudwatch-events';
import {
  AddPermissionCommand,
  LambdaClient,
  RemovePermissionCommand,
} from '@aws-sdk/client-lambda';
import { Logger } from '@slack/web-api';
import { Coordinates } from 'adhan';
import { isBefore, sub, subMinutes } from 'date-fns';
import {
  AWS_ACCOUNT_ID,
  AWS_REGION,
  COLLECTIONS,
  ILanguages,
  minutesOffset,
  prayerNames,
  prayerWithoutNone,
  userSchema,
} from '../constants';
import clientPromise from '../db/mongodb';
import { Adhan } from '../lib/adhan';
import { isoToAWSCron } from '../lib/utils';

export class MessageScheduler {
  constructor(private token: string, private logger: Logger) {}

  /**
   * This function will prepare the next prayer time and schedule it
   * @param userId the user id
   * @param teamId the team id
   * @param nextPrayersList the list of the prayer that will be scheduled
   * @returns
   */
  async scheduleMessages(
    userId: string,
    teamId: string,
    teamName: string,
    nextPrayersList?: prayerWithoutNone[],
  ) {
    if (!nextPrayersList?.length) {
      this.logger.info(`No prayers to schedule for user ${userId}`);
      // TODO: unschedule jobs if there is
      return;
    }
    const user = await this.getUserFromDb(userId, teamId);
    if (!user) return;
    const { coordinates, tz, calculationMethod, language = 'en' } = user;
    if (!coordinates || !calculationMethod) return;

    // get the next prayer time
    const adhan = new Adhan(
      new Coordinates(coordinates.latitude, coordinates.longitude),
      calculationMethod,
      tz,
      language,
    );

    // clean up if all scheduled messages
    await Promise.allSettled(
      prayerNames.map(async (name) => {
        const ruleName = `${teamId}-${userId}-${name}`;
        this.cleanupCloudWatchEvent(
          `adhan-slack-app-${process.env.STAGE}-slack-post-messages`,
          ruleName,
        );
      }),
    );
    // if there is no prayer time for today, skip it
    if (adhan.nextPrayer === 'none') {
      return;
    }

    this.logger.info(`Scheduling messages for user ${userId}`);
    for (const prayerName of nextPrayersList) {
      this.logger.info(`Checking prayer ${prayerName} for user ${userId}`);
      const timeForPrayer = adhan.prayerTimes.timeForPrayer(prayerName);

      if (!timeForPrayer) {
        this.logger.error(
          `Error getting time for prayer ${prayerName} for user ${userId}`,
        );
        continue;
      }
      // if the time in the past, skip it
      if (
        timeForPrayer &&
        isBefore(
          timeForPrayer,
          sub(new Date(), {
            minutes: minutesOffset,
          }),
        )
      ) {
        this.logger.info(
          `Prayer ${prayerName} is in the past for user ${userId}`,
        );
        continue;
      }

      try {
        await this.scheduleMessage(
          userId,
          teamId,
          teamName,
          prayerName,
          timeForPrayer,
          language,
          user.tz,
        );
      } catch (error) {
        this.logger.error(error);
        continue;
      }
    }
  }

  private async getUserFromDb(userId: string, teamId?: string) {
    // get user from db
    try {
      const mongoClient = await clientPromise;
      const db = mongoClient.db();
      const userCollection = db.collection<userSchema>(COLLECTIONS.users);
      const user = await userCollection.findOne({ userId, teamId });
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async cleanupCloudWatchEvent(
    lambdaFunctionName: string,
    ruleName: string,
  ) {
    this.logger.info(`Cleaning up CloudWatchEvent for rule ${ruleName}`);
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
      // if failed to remove the target, log the error and continue.
      this.logger.error(error);
    }

    try {
      // 2. Delete the rule
      const deleteRuleCommand = new DeleteRuleCommand({
        Name: ruleName,
      });
      await eventBridgeClient.send(deleteRuleCommand);
    } catch (error) {
      // if failed to delete the rule, log the error and continue.
      this.logger.error(error);
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
      this.logger.error(error);
    }
  }

  private async createCloudWatchEvent(
    lambdaFunctionName: string,
    ruleName: string,
    scheduleAt: Date,
    body: {
      userId: string;
      teamId: string;
      teamName: string;
      prayerName: string;
      timeForPrayer: Date;
      language: ILanguages;
      tz?: string;
    },
  ) {
    // send to cloud watch a scheduled message
    const eventBridgeClient = new CloudWatchEventsClient();

    const lambdaFnMeta = {
      name: lambdaFunctionName,
      arn: `arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:${lambdaFunctionName}`,
    };
    const input = {
      // PutRuleRequest
      Name: ruleName,
      ScheduleExpression: isoToAWSCron(scheduleAt),
      State: 'ENABLED',
      Description: `Scheduled message for ${ruleName} in ${scheduleAt}`,
      Tags: [
        {
          Key: 'user',
          Value: body.userId,
        },
        {
          Key: 'teamId',
          Value: body.teamId,
        },
        {
          Key: 'teamName',
          Value: body.teamName,
        },
      ],
    } as PutRuleCommandInput;

    const command = new PutRuleCommand(input);
    const { RuleArn } = await eventBridgeClient.send(command);

    // Add Permission to the Lambda function
    const lambdaClient = new LambdaClient();

    const functionName = lambdaFnMeta.name;
    const statementId = `${ruleName}-SID`;
    const principal = 'events.amazonaws.com';

    try {
      // Grant permissions for the rule to trigger the lambda
      const permissionCommand = new AddPermissionCommand({
        Action: 'lambda:InvokeFunction',
        FunctionName: functionName,
        Principal: principal,
        StatementId: statementId,
        SourceArn: RuleArn,
      });
      await lambdaClient.send(permissionCommand);
    } catch (error) {
      this.logger.error(error);
    }

    // Attach the rule to the lambda
    const targetsCommand = new PutTargetsCommand({
      Rule: ruleName,
      Targets: [
        {
          Id: '1',
          Arn: lambdaFnMeta.arn,
          Input: JSON.stringify({ ...body, ruleName }),
        },
      ],
    });
    await eventBridgeClient.send(targetsCommand);
  }

  /**
   * this function will send client.chat.scheduleMessage to slack
   * and it will check if there is an offset, the time will be subtracted by the offset
   * @param prayerName prayer name
   * @param timeForPrayer time for the prayer in UNIX time
   *
   */
  private async scheduleMessage(
    userId: string,
    teamId: string,
    teamName: string,
    prayerName: string,
    timeForPrayer: Date,
    language: ILanguages,
    tz?: string,
  ) {
    this.logger.info(`Scheduling prayer ${prayerName} for user ${userId}`);
    try {
      const body = {
        userId,
        teamId,
        prayerName,
        timeForPrayer,
        language,
        tz,
        teamName,
      };
      const scheduleAt = subMinutes(timeForPrayer, minutesOffset);
      const ruleName = `${teamId}-${userId}-${prayerName}`;

      const functionName = `adhan-slack-app-${process.env.STAGE}-slack-post-messages`;

      await this.createCloudWatchEvent(
        functionName,
        ruleName,
        scheduleAt,
        body,
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
