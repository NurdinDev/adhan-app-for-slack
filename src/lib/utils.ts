import {
  Context,
  Installation,
  InstallationQuery,
  ViewSubmitAction,
} from '@slack/bolt';
import { ILanguages } from '../constants';
import { LOCALS } from './locals';

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
  if (
    installation.isEnterpriseInstall &&
    installation.enterprise !== undefined
  ) {
    return installation.enterprise.id;
  }
  if (installation.team !== undefined) {
    return installation.team.id;
  }

  throw new Error('Could not find a valid team id in the payload request');
}

export function getTeamIdViewSubmitAction(view: ViewSubmitAction) {
  if (view.is_enterprise_install && view.enterprise !== undefined) {
    return view.enterprise.id;
  }
  if (view.team !== null) {
    return view.team.id;
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
