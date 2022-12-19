import {
  App,
  ExpressReceiver,
  Installation,
  InstallationQuery,
  Logger,
} from '@slack/bolt';
import { ConsoleLogger } from '@slack/logger';
import * as env from 'env-var';
import {
  actions,
  callbackIds,
  COLLECTIONS,
  installationSchema,
} from '../constants';
import clientPromise from '../db/mongodb';
import { Encrypted } from '../lib/encrypt';
import { getTeamForInstallation, getTeamIdForInstallQuery } from '../lib/utils';
import settingsAction from './actions/settings.action';
import { homeOpenedEvent } from './events/home-open.event';
import { settingsViewCallback } from './views/settings.callback';

const encrypted = new Encrypted();
export const expressReceiver = new ExpressReceiver({
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
      addTeamInformation(installation, logger);
      return;
    },
    fetchInstallation: async (
      installQuery: InstallationQuery<boolean>,
      logger,
    ) => {
      return fetchInstallation(installQuery, logger);
    },
    deleteInstallation: async (
      installQuery: InstallationQuery<boolean>,
      logger,
    ) => {
      deleteInstallation(installQuery, logger);
      return;
    },
  },
});

export const app = new App({
  receiver: expressReceiver,
});

export async function registerEvents() {
  app.event('app_home_opened', homeOpenedEvent);
  app.event('app_uninstalled', async ({ body }) => {
    if (body.team_id) {
      await deleteInstallationFromDB(body.team_id, new ConsoleLogger());
    }
  });
  app.event('tokens_revoked', async ({ body }) => {
    if (body.team_id) {
      await deleteInstallationFromDB(body.team_id, new ConsoleLogger());
    }
  });
  app.view(callbackIds.settingsSubmitted, settingsViewCallback);
  app.action(actions.appSettingsClick, settingsAction);
}
async function fetchInstallation(
  installQuery: InstallationQuery<boolean>,
  logger?: Logger,
) {
  const teamId = getTeamIdForInstallQuery(installQuery);
  try {
    const info = await queryInstallationFromDB(teamId, logger);
    if (!info) {
      throw new Error('no installation');
    }
    return info;
  } catch (exception) {
    logger?.error('get team information error:', JSON.stringify(exception));
    throw new Error('Failed fetching installation');
  }
}

async function deleteInstallation(
  installQuery: InstallationQuery<boolean>,
  logger?: Logger,
) {
  const teamId = getTeamIdForInstallQuery(installQuery);
  await deleteInstallationFromDB(teamId, logger);
  return;
}

export async function getAuthToken(teamId: string) {
  const installation = await queryInstallationFromDB(teamId);
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

async function installationCollection() {
  const client = await clientPromise;
  const db = client.db();
  const installationCollection = db.collection<installationSchema>(
    COLLECTIONS.installations,
  );
  return installationCollection;
}

async function usersCollection() {
  const client = await clientPromise;
  const db = client.db();
  const usersCollection = db.collection<installationSchema>(COLLECTIONS.users);
  return usersCollection;
}

async function queryInstallationFromDB(teamId: string, logger?: Logger) {
  try {
    const collection = await installationCollection();

    const res = await collection.findOne({ teamId: teamId });

    if (!res) {
      logger?.error('no record!!');
      return null;
    }

    const encInfo = encrypted.decodeInformation<string>(res.data);
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

async function deleteInstallationFromDB(teamId: string, logger?: Logger) {
  try {
    const collection = await installationCollection();
    await collection.deleteOne({ teamId });
    const userCollection = await usersCollection();
    await userCollection.deleteMany({ teamId });
  } catch (exception) {
    logger?.info('delete team information error:', JSON.stringify(exception));
  }
  return null;
}

async function addTeamInformation<AuthVersion extends 'v1' | 'v2'>(
  installation: Installation<AuthVersion, boolean>,
  logger?: Logger,
) {
  const teamId = getTeamForInstallation(installation);

  const existInformation = await queryInstallationFromDB(teamId, logger);
  if (existInformation) {
    await deleteInstallationFromDB(teamId, logger);
  }
  const info = JSON.stringify(installation);
  const encInfo = encrypted.encodeInformation<string>(info);
  try {
    const collection = await installationCollection();
    collection.createIndex({ teamId: 1 }, { unique: true });
    await collection.insertOne({ teamId, data: encInfo });
  } catch (exception) {
    logger?.error('add team information error:', JSON.stringify(exception));
  }
}
