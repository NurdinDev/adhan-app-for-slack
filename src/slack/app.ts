import {
  App,
  ExpressReceiver,
  Installation,
  InstallationQuery,
  Logger,
} from '@slack/bolt';
import { ConsoleLogger, LogLevel } from '@slack/logger';
import { WebClient } from '@slack/web-api';
import { Coordinates } from 'adhan';
import * as env from 'env-var';
import {
  COLLECTIONS,
  actions,
  installationSchema,
  settingsView,
  userSchema,
} from '../constants';
import clientPromise from '../db/mongodb';
import { Adhan } from '../lib/adhan';
import { Encrypted } from '../lib/encrypt';
import { getTeamForInstallation, getTeamIdForInstallQuery } from '../lib/utils';
import settingsAction from './actions/settings.action';
import { homeOpenedEvent } from './events/home-open.event';
import { MessageScheduler } from './message-scheduler';
import { settingsViewCallback } from './views/settings.callback';

export class SlackApp {
  #encrypted: Encrypted;
  app: App;
  expressReceiver: ExpressReceiver;

  constructor() {
    this.#encrypted = new Encrypted();
    this.expressReceiver = new ExpressReceiver({
      signingSecret: env.get('SLACK_SIGNING_SECRET').required().asString(),
      clientId: env.get('SLACK_CLIENT_ID').required().asString(),
      clientSecret: env.get('SLACK_CLIENT_SECRET').required().asString(),
      stateSecret: env.get('SLACK_STATE_SECRET').required().asString(),
      processBeforeResponse: true,
      logLevel: LogLevel.DEBUG,
      scopes: ['users:read', 'chat:write'],
      installerOptions: {
        directInstall: true,
      },
      installationStore: {
        storeInstallation: async (installation, logger) => {
          this.addTeamInformation(installation, logger);
          return;
        },
        fetchInstallation: async (
          installQuery: InstallationQuery<boolean>,
          logger,
        ) => {
          return this.fetchInstallation(installQuery, logger);
        },
        deleteInstallation: async (
          installQuery: InstallationQuery<boolean>,
          logger,
        ) => {
          this.deleteInstallation(installQuery, logger);
          return;
        },
      },
    });
    this.app = new App({
      receiver: this.expressReceiver,
    });
  }

  /**
   * This function takes a time like 01:00 AM and search for users in the same timezone and re-schedule their messages
   * @param time pass the time and minutes to search for users in the same timezone and re-schedule their messages
   * @returns void
   */
  async scanAndSchedule(time: { h: number; m: number }) {
    // scan for user that have time 01:00 AM and re-schedule their messages
    const expr = {
      $expr: {
        $and: [
          { $eq: [{ $hour: { date: new Date(), timezone: '$tz' } }, time.h] },
          { $eq: [{ $minute: { date: new Date(), timezone: '$tz' } }, time.m] },
        ],
      },
    };
    const usersCollection = await this.usersCollection();
    const users = usersCollection.find(expr);
    const usersCount = await usersCollection.countDocuments(expr);
    console.log(`Found ${usersCount} users`);
    if (usersCount === 0) return;

    while (await users.hasNext()) {
      try {
        const user = await users.next();
        if (!user) {
          console.log('No user found');
          continue;
        }

        const {
          userId,
          teamId,
          teamName,
          tz,
          coordinates,
          reminderList,
          calculationMethod,
          language,
        } = user;
        if (!coordinates || !reminderList) continue;

        console.log('User: ' + user.userId);

        const adhan = new Adhan(
          new Coordinates(coordinates.latitude, coordinates.longitude),
          calculationMethod,
          tz,
          language,
        );

        if (adhan.nextPrayer === 'none') {
          console.log('No prayer time for today');
          continue;
        }

        const token = await this.getAuthToken(teamId);

        if (!token) {
          console.log('No token found for team: ' + teamId);
          continue;
        }

        const messageScheduler = new MessageScheduler(
          token,
          new ConsoleLogger(),
        );

        await messageScheduler.scheduleMessages(
          userId,
          teamId,
          teamName,
          reminderList,
        );
      } catch (e) {
        console.log(e);
        continue;
      }
    }
  }

  registerEvents() {
    const logger = new ConsoleLogger();
    this.app.event('app_home_opened', homeOpenedEvent);
    this.app.event('app_uninstalled', async ({ body }) => {
      logger.info('app_uninstalled');
      if (body.team_id) {
        await this.deleteInstallationAndUsersFromDB(body.team_id, logger);
      }
    });
    this.app.event('tokens_revoked', async ({ body }) => {
      logger.info('tokens_revoke');
      if (body.team_id) {
        await this.deleteInstallationFromDB(body.team_id, logger);
      }
    });
    this.app.view(settingsView.callbackId, settingsViewCallback);
    this.app.action(actions.appSettingsClick, settingsAction);
  }

  async getClient(teamId: string) {
    const token = await this.getAuthToken(teamId);

    if (!token) {
      console.log('No token found for team: ' + teamId);
      return;
    }

    return new WebClient(token);
  }

  private async fetchInstallation(
    installQuery: InstallationQuery<boolean>,
    logger?: Logger,
  ) {
    const teamId = getTeamIdForInstallQuery(installQuery);
    try {
      const info = await this.queryInstallationFromDB(teamId, logger);
      if (!info) {
        throw new Error('no installation');
      }
      return info;
    } catch (exception) {
      logger?.error('get team information error:', JSON.stringify(exception));
      throw new Error('Failed fetching installation');
    }
  }

  private async deleteInstallation(
    installQuery: InstallationQuery<boolean>,
    logger?: Logger,
  ) {
    logger?.info('deleting installation and users from db', installQuery);
    const teamId = getTeamIdForInstallQuery(installQuery);
    await this.deleteInstallationAndUsersFromDB(teamId, logger);
    return;
  }

  private async getAuthToken(teamId: string) {
    const installation = await this.queryInstallationFromDB(teamId);
    if (!installation) {
      return null;
    }
    if (installation.tokenType === 'bot') {
      return installation.bot?.token || null;
    } else if (installation.tokenType === 'user') {
      return installation.user.token || null;
    }
    return null;
  }

  private async installationCollection() {
    const client = await clientPromise;
    const db = client.db();
    const installationCollection = db.collection<installationSchema>(
      COLLECTIONS.installations,
    );
    return installationCollection;
  }

  private async usersCollection() {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<userSchema>(COLLECTIONS.users);
    return usersCollection;
  }

  private async queryInstallationFromDB(teamId: string, logger?: Logger) {
    try {
      const collection = await this.installationCollection();

      const res = await collection.findOne({ teamId: teamId });

      if (!res) {
        logger?.error('no record!!');
        return null;
      }

      const encInfo = this.#encrypted.decodeInformation<string>(res.data);
      if (!encInfo) {
        logger?.error('decryption failed');
        return null;
      }
      const info = JSON.parse(encInfo);
      return info as Installation;
    } catch (exception) {
      logger?.error('get team information error:', JSON.stringify(exception));
      return null;
    }
  }

  private async deleteInstallationAndUsersFromDB(
    teamId: string,
    logger?: Logger,
  ) {
    try {
      const collection = await this.installationCollection();
      await collection.deleteOne({ teamId });
      const userCollection = await this.usersCollection();
      await userCollection.deleteMany({ teamId });
      logger?.info(`delete team ${teamId} and users success`);
    } catch (exception) {
      logger?.info('delete team information error:', JSON.stringify(exception));
    }
    return null;
  }
  private async deleteInstallationFromDB(teamId: string, logger?: Logger) {
    try {
      const collection = await this.installationCollection();
      await collection.deleteOne({ teamId });
      logger?.info(`delete team ${teamId} information success`);
    } catch (exception) {
      logger?.info('delete team information error:', JSON.stringify(exception));
    }
    return null;
  }

  private async addTeamInformation<AuthVersion extends 'v1' | 'v2'>(
    installation: Installation<AuthVersion, boolean>,
    logger?: Logger,
  ) {
    const team = getTeamForInstallation(installation);

    const existInformation = await this.queryInstallationFromDB(
      team.id,
      logger,
    );
    if (existInformation) {
      await this.deleteInstallationFromDB(team.id, logger);
    }
    const info = JSON.stringify(installation);
    const encInfo = this.#encrypted.encodeInformation<string>(info);
    try {
      const collection = await this.installationCollection();
      collection.createIndex({ teamId: 1 }, { unique: true });
      await collection.insertOne({
        teamId: team.id,
        name: team?.name || '',
        data: encInfo,
      });
    } catch (exception) {
      logger?.error('add team information error:', JSON.stringify(exception));
    }
  }
}
