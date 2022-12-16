"use strict";
exports.__esModule = true;
exports.getTeamIdFromContext = exports.getTeamIdForInstallQuery = exports.getTeamIdViewSubmitAction = exports.getTeamForInstallation = exports.languagesOptions = exports.getReadableName = void 0;
var locals_1 = require("./locals");
var getReadableName = function (prayer, language) {
    switch (prayer) {
        case 'fajr':
            return locals_1.LOCALS.PRAYER_NAMES.Fajr[language];
        case 'sunrise':
            return locals_1.LOCALS.PRAYER_NAMES.Sunrise[language];
        case 'dhuhr':
            return locals_1.LOCALS.PRAYER_NAMES.Dhuhr[language];
        case 'asr':
            return locals_1.LOCALS.PRAYER_NAMES.Asr[language];
        case 'maghrib':
            return locals_1.LOCALS.PRAYER_NAMES.Maghrib[language];
        case 'isha':
            return locals_1.LOCALS.PRAYER_NAMES.Isha[language];
        default:
            return 'none';
    }
};
exports.getReadableName = getReadableName;
exports.languagesOptions = [
    {
        text: 'English',
        value: 'en'
    },
    {
        text: 'العربية',
        value: 'ar'
    },
];
function getTeamForInstallation(installation) {
    if (installation.isEnterpriseInstall &&
        installation.enterprise !== undefined) {
        return installation.enterprise.id;
    }
    if (installation.team !== undefined) {
        return installation.team.id;
    }
    throw new Error('Could not find a valid team id in the payload request');
}
exports.getTeamForInstallation = getTeamForInstallation;
function getTeamIdViewSubmitAction(view) {
    if (view.is_enterprise_install && view.enterprise !== undefined) {
        return view.enterprise.id;
    }
    if (view.team !== null) {
        return view.team.id;
    }
    throw new Error('Could not find a valid team id in the payload request');
}
exports.getTeamIdViewSubmitAction = getTeamIdViewSubmitAction;
function getTeamIdForInstallQuery(installQuery) {
    if (installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined) {
        return installQuery.enterpriseId;
    }
    if (installQuery.teamId !== undefined) {
        return installQuery.teamId;
    }
    throw new Error('Could not find a valid team id in the payload request');
}
exports.getTeamIdForInstallQuery = getTeamIdForInstallQuery;
function getTeamIdFromContext(context) {
    if (context.isEnterpriseInstall) {
        return context.enterpriseId;
    }
    if (context.teamId !== undefined) {
        return context.teamId;
    }
    throw new Error('Could not find a valid team id in the payload request');
}
exports.getTeamIdFromContext = getTeamIdFromContext;
