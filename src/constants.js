"use strict";
exports.__esModule = true;
exports.calculationMethod = exports.COLLECTIONS = exports.minutesOffset = exports.actions = exports.settingsView = exports.callbackIds = void 0;
exports.callbackIds = {
    settingsSubmitted: 'settings-submitted'
};
exports.settingsView = {
    callbackId: exports.callbackIds.settingsSubmitted,
    fields: {
        coordinates: 'coordinates',
        latitude: 'latitude',
        longitude: 'longitude',
        calculationMethod: 'calculationMethod',
        reminderList: 'reminderList',
        language: 'language'
    }
};
exports.actions = {
    appSettingsClick: 'appSettingsClick',
    appDatePickerClick: 'appDatePickerClick',
    appTodayClick: 'appTodayClick'
};
exports.minutesOffset = 20;
exports.COLLECTIONS = {
    installations: 'installations',
    users: 'users'
};
exports.calculationMethod = {
    MuslimWorldLeague: 'Muslim World League',
    Egyptian: 'Egyptian General Authority of Survey',
    Karachi: 'University of Islamic Sciences, Karachi',
    UmmAlQura: 'Umm al-Qura University, Makkah',
    MoonsightingCommittee: 'Moonsighting Committee (Recommended for North America and the UK)',
    NorthAmerica: 'Islamic Society of North America (ISNA)',
    Dubai: 'Dubai',
    Kuwait: 'Kuwait',
    Qatar: 'Qatar',
    Singapore: 'Singapore',
    Tehran: 'Tehran',
    Turkey: 'Turkey',
    Other: 'Other'
};
