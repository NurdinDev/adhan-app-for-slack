import {
  App,
  ExpressReceiver,
  Installation,
  InstallationQuery,
  Logger,
} from '@slack/bolt';
import { ConsoleLogger } from '@slack/logger';
import { WebClient } from '@slack/web-api';
import { Coordinates } from 'adhan';
import * as env from 'env-var';
import {
  actions,
  callbackIds,
  COLLECTIONS,
  installationSchema,
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
      // logLevel: LogLevel.DEBUG,
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

  async scanAndSchedule() {
    // scan for user that have time 01:00 AM and re-schedule their messages
    const expr = {
      $expr: {
        $and: [
          { $eq: [{ $hour: { date: new Date(), timezone: '$tz' } }, 1] },
          { $eq: [{ $minute: { date: new Date(), timezone: '$tz' } }, 0] },
        ],
      },
    };
    const usersCollection = await this.usersCollection();
    const users = usersCollection.find(expr);
    console.log(`Found ${await usersCollection.countDocuments(expr)} users`);
    while (await users.hasNext()) {
      const user = await users.next();
      if (!user) continue;

      console.log('USER: \n' + JSON.stringify(user, null, 2));

      const {
        userId,
        teamId,
        tz,
        coordinates,
        reminderList,
        calculationMethod,
        language,
      } = user;
      if (!coordinates || !reminderList) return;

      try {
        const adhan = new Adhan(
          new Coordinates(coordinates.latitude, coordinates.longitude),
          calculationMethod,
          tz,
          language,
        );

        if (adhan.nextPrayer === 'none') return;

        const token = await this.getAuthToken(teamId);

        if (!token) return;

        const messageScheduler = new MessageScheduler(
          new WebClient(token),
          new ConsoleLogger(),
        );

        await messageScheduler.reScheduleMessages(userId, teamId, reminderList);
      } catch (e) {
        console.log(e);
      }
    }
  }

  registerEvents() {
    this.app.event('app_home_opened', homeOpenedEvent);
    this.app.event('app_uninstalled', async ({ body }) => {
      if (body.team_id) {
        await this.deleteInstallationFromDB(body.team_id, new ConsoleLogger());
      }
    });
    this.app.event('tokens_revoked', async ({ body }) => {
      if (body.team_id) {
        await this.deleteInstallationFromDB(body.team_id, new ConsoleLogger());
      }
    });
    this.app.view(callbackIds.settingsSubmitted, settingsViewCallback);
    this.app.action(actions.appSettingsClick, settingsAction);
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
    const teamId = getTeamIdForInstallQuery(installQuery);
    await this.deleteInstallationFromDB(teamId, logger);
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

  private async deleteInstallationFromDB(teamId: string, logger?: Logger) {
    try {
      const collection = await this.installationCollection();
      await collection.deleteOne({ teamId });
      const userCollection = await this.usersCollection();
      await userCollection.deleteMany({ teamId });
    } catch (exception) {
      logger?.info('delete team information error:', JSON.stringify(exception));
    }
    return null;
  }

  private async addTeamInformation<AuthVersion extends 'v1' | 'v2'>(
    installation: Installation<AuthVersion, boolean>,
    logger?: Logger,
  ) {
    const teamId = getTeamForInstallation(installation);

    const existInformation = await this.queryInstallationFromDB(teamId, logger);
    if (existInformation) {
      await this.deleteInstallationFromDB(teamId, logger);
    }
    const info = JSON.stringify(installation);
    const encInfo = this.#encrypted.encodeInformation<string>(info);
    try {
      const collection = await this.installationCollection();
      collection.createIndex({ teamId: 1 }, { unique: true });
      await collection.insertOne({ teamId, data: encInfo });
    } catch (exception) {
      logger?.error('add team information error:', JSON.stringify(exception));
    }
  }
}
