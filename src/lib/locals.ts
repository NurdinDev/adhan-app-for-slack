import { Md } from 'slack-block-builder';

export const LOCALS = {
  PRAYER_NAMES: {
    Fajr: {
      en: 'Fajr',
      ar: 'الفجر',
    },
    Sunrise: {
      en: 'Sunrise',
      ar: 'الشروق',
    },
    Dhuhr: {
      en: 'Dhuhr',
      ar: 'الظهر',
    },
    Asr: {
      en: 'Asr',
      ar: 'العصر',
    },
    Maghrib: {
      en: 'Maghrib',
      ar: 'المغرب',
    },
    Isha: {
      en: 'Isha',
      ar: 'العشاء',
    },
  },
  NO_COORDINATES_SETTINGS: {
    en: `No coordinates set, please set your coordinates in ${Md.italic(
      'ٍSettings',
    )}`,
    ar: `لم يتم تعيين الإحداثيات ، يرجى تعيين إحداثياتك من ${Md.italic(
      'الإعدادات',
    )}`,
  },
  NEXT_PRAYER: {
    en: 'Next Prayer',
    ar: 'الصلاة التالية',
  },
  LEFT_FOR_PRAYER: {
    en: 'left for',
    ar: ' لرفع أذان',
  },
  PRAYER_TIMES_FOR_TODAY: {
    en: 'Prayer Times for Today',
    ar: 'مواعيد الصلاة اليوم',
  },
  NO_PRAYER_TIME_FOUND: {
    en: 'No prayer time found',
    ar: 'لم يتم العثور على أوقات الصلاة',
  },
  SETTINGS: {
    en: 'Settings',
    ar: 'الإعدادات',
  },
  BOT_REMINDER_IN_TIMES: {
    en: 'The bot will send you a reminder for the following prayers',
    ar: 'سيرسل لك التطبيق تذكيرًا للصلوات التالية',
  },
  REMINDER: {
    FIRST: {
      en: 'Time Sensitive',
      ar: 'موعد الأذان اقترب',
    },

    MINUTES: {
      en: 'minutes',
      ar: 'دقيقة',
    },

    AT: {
      en: 'at',
      ar: 'في',
    },

    IN: {
      en: 'in',
      ar: 'بعد',
    },
  },
};
