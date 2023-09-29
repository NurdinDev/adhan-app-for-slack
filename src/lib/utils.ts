import {
  Context,
  Installation,
  InstallationQuery,
  ViewSubmitAction,
} from '@slack/bolt';
import { ILanguages } from '../constants';
import { LOCALS } from './locals';

export function isoToAWSCron(isoDate: Date) {
  const date = new Date(isoDate);

  const minutes = date.getUTCMinutes();
  const hours = date.getUTCHours();
  const dayOfMonth = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-indexed
  const year = date.getUTCFullYear();

  return `cron(${minutes} ${hours} ${dayOfMonth} ${month} ? ${year})`;
}

export const getReadableName = (
  prayer: string,
  language: ILanguages,
): string => {
  switch (prayer) {
    case 'fajr':
      return LOCALS.PRAYER_NAMES.Fajr[language];
    case 'sunrise':
      return LOCALS.PRAYER_NAMES.Sunrise[language];
    case 'dhuhr':
      return LOCALS.PRAYER_NAMES.Dhuhr[language];
    case 'asr':
      return LOCALS.PRAYER_NAMES.Asr[language];
    case 'maghrib':
      return LOCALS.PRAYER_NAMES.Maghrib[language];
    case 'isha':
      return LOCALS.PRAYER_NAMES.Isha[language];
    default:
      return 'none';
  }
};

export const languagesOptions = [
  {
    text: 'English',
    value: 'en',
  },
  {
    text: 'العربية',
    value: 'ar',
  },
];

export function getTeamForInstallation(installation: Installation) {
  console.log(JSON.stringify(installation));
  if (
    installation.isEnterpriseInstall &&
    installation.enterprise !== undefined
  ) {
    return installation.enterprise;
  }
  if (installation.team !== undefined) {
    return installation.team;
  }

  throw new Error('Could not find a valid team id in the payload request');
}

export function getTeamIdViewSubmitAction(view: ViewSubmitAction): {
  id: string;
  name: string;
} {
  if (view.is_enterprise_install && view.enterprise !== undefined) {
    return { id: view.enterprise.id, name: view.enterprise.name };
  }
  if (view.team !== null) {
    return {
      id: view.team.id,
      name: view.team.domain,
    };
  }
  throw new Error('Could not find a valid team id in the payload request');
}

export function getTeamIdForInstallQuery(
  installQuery: InstallationQuery<boolean>,
) {
  if (
    installQuery.isEnterpriseInstall &&
    installQuery.enterpriseId !== undefined
  ) {
    return installQuery.enterpriseId;
  }
  if (installQuery.teamId !== undefined) {
    return installQuery.teamId;
  }
  throw new Error('Could not find a valid team id in the payload request');
}

export function getTeamIdFromContext(context: Context) {
  if (context.isEnterpriseInstall) {
    return context.enterpriseId;
  }
  if (context.teamId !== undefined) {
    return context.teamId;
  }
  throw new Error('Could not find a valid team id in the payload request');
}
