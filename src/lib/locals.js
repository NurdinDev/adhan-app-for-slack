"use strict";
exports.__esModule = true;
exports.LOCALS = void 0;
var slack_block_builder_1 = require("slack-block-builder");
exports.LOCALS = {
    PRAYER_NAMES: {
        Fajr: {
            en: 'Fajr',
            ar: 'الفجر'
        },
        Sunrise: {
            en: 'Sunrise',
            ar: 'الشروق'
        },
        Dhuhr: {
            en: 'Dhuhr',
            ar: 'الظهر'
        },
        Asr: {
            en: 'Asr',
            ar: 'العصر'
        },
        Maghrib: {
            en: 'Maghrib',
            ar: 'المغرب'
        },
        Isha: {
            en: 'Isha',
            ar: 'العشاء'
        }
    },
    NO_COORDINATES_SETTINGS: {
        en: "No coordinates set, please set your coordinates in ".concat(slack_block_builder_1.Md.italic('ٍSettings')),
        ar: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u060C \u064A\u0631\u062C\u0649 \u062A\u0639\u064A\u064A\u0646 \u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A\u0643 \u0645\u0646 ".concat(slack_block_builder_1.Md.italic('الإعدادات'))
    },
    NEXT_PRAYER: {
        en: 'Next Prayer',
        ar: 'الصلاة التالية'
    },
    LEFT_FOR_PRAYER: {
        en: 'left for',
        ar: 'الوقت المتبقي لرفع أذان'
    },
    PRAYER_TIMES_FOR_TODAY: {
        en: 'Prayer Times for Today',
        ar: 'مواعيد الصلاة اليوم'
    },
    NO_PRAYER_TIME_FOUND: {
        en: 'No prayer time found',
        ar: 'لم يتم العثور على أوقات الصلاة'
    },
    SETTINGS: {
        en: 'Settings',
        ar: 'الإعدادات'
    },
    BOT_REMINDER_IN_TIMES: {
        en: 'The bot will send you a reminder for the following prayers',
        ar: 'سيرسل لك التطبيق تذكيرًا للصلوات التالية'
    },
    REMINDER: {
        FIRST: {
            en: 'Time Sensitive',
            ar: 'موعد الأذان اقترب'
        },
        SECOND: {
            en: 'Time Sensitive',
            ar: 'موعد الأذان اقترب'
        },
        MINUTES: {
            en: 'minutes',
            ar: 'دقيقة'
        },
        AT: {
            en: 'at',
            ar: 'في'
        },
        IN: {
            en: 'in',
            ar: 'بعد'
        }
    }
};
