import { Coordinates, Prayer } from 'adhan';

export const callbackIds = {
  settingsSubmitted: 'settings-submitted',
};

export const settingsView = {
  callbackId: callbackIds.settingsSubmitted,
  fields: {
    coordinates: 'coordinates',
    latitude: 'latitude',
    longitude: 'longitude',
    calculationMethod: 'calculationMethod',
    reminderList: 'reminderList',
    language: 'language',
  },
};

export const actions = {
  appSettingsClick: 'appSettingsClick',
  appDatePickerClick: 'appDatePickerClick',
  appTodayClick: 'appTodayClick',
};

export const minutesOffset = 20;
export const COLLECTIONS = {
  installations: 'installations',
  users: 'users',
};

export interface installationSchema {
  teamId: string;
  data: string;
}

export type ILanguages = 'en' | 'ar';

export interface userSchema {
  userId: string;
  teamId: string;
  tz?: string;
  coordinates: Coordinates;
  calculationMethod: calculationMethod;
  reminderList?: prayerWithoutNone[];
  messages?: Record<prayerWithoutNone, string[]>;
  language: ILanguages;
}

export const calculationMethod = {
  MuslimWorldLeague: 'Muslim World League',
  Egyptian: 'Egyptian General Authority of Survey',
  Karachi: 'University of Islamic Sciences, Karachi',
  UmmAlQura: 'Umm al-Qura University, Makkah',
  MoonsightingCommittee:
    'Moonsighting Committee (Recommended for North America and the UK)',
  NorthAmerica: 'Islamic Society of North America (ISNA)',
  Dubai: 'Dubai',
  Kuwait: 'Kuwait',
  Qatar: 'Qatar',
  Singapore: 'Singapore',
  Tehran: 'Tehran',
  Turkey: 'Turkey',
  Other: 'Other',
} as const;

export type calculationMethod = keyof typeof calculationMethod;

export type PrayerWithoutNone = Exclude<keyof typeof Prayer, 'None'>;
export type prayerWithoutNone = Exclude<ValueOf<typeof Prayer>, 'none'>;

export declare type ValueOf<T> = T[keyof T];
