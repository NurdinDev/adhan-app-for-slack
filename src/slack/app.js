"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getAuthToken = exports.registerEvents = exports.app = exports.expressReceiver = void 0;
var bolt_1 = require("@slack/bolt");
var env = require("env-var");
var constants_1 = require("../constants");
var mongodb_1 = require("../db/mongodb");
var encrypt_1 = require("../lib/encrypt");
var utils_1 = require("../lib/utils");
var settings_action_1 = require("./actions/settings.action");
var home_open_event_1 = require("./events/home-open.event");
var settings_callback_1 = require("./views/settings.callback");
var encrypted = new encrypt_1.Encrypted();
exports.expressReceiver = new bolt_1.ExpressReceiver({
    signingSecret: env.get('SLACK_SIGNING_SECRET').required().asString(),
    clientId: env.get('SLACK_CLIENT_ID').required().asString(),
    clientSecret: env.get('SLACK_CLIENT_SECRET').required().asString(),
    stateSecret: env.get('SLACK_STATE_SECRET').required().asString(),
    processBeforeResponse: true,
    // logLevel: LogLevel.DEBUG,
    scopes: ['users:read', 'chat:write'],
    installerOptions: {
        directInstall: true
    },
    installationStore: {
        storeInstallation: function (installation, logger) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                addTeamInformation(installation, logger);
                return [2 /*return*/];
            });
        }); },
        fetchInstallation: function (installQuery, logger) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fetchInstallation(installQuery, logger)];
            });
        }); },
        deleteInstallation: function (installQuery, logger) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                deleteInstallation(installQuery, logger);
                return [2 /*return*/];
            });
        }); }
    }
});
exports.app = new bolt_1.App({
    receiver: exports.expressReceiver
});
function registerEvents() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            exports.app.event('app_home_opened', home_open_event_1.homeOpenedEvent);
            exports.app.view(constants_1.callbackIds.settingsSubmitted, settings_callback_1.settingsViewCallback);
            exports.app.action(constants_1.actions.appSettingsClick, settings_action_1["default"]);
            return [2 /*return*/];
        });
    });
}
exports.registerEvents = registerEvents;
function fetchInstallation(installQuery, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var teamId, info, exception_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teamId = (0, utils_1.getTeamIdForInstallQuery)(installQuery);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, queryInstallationFromDB(teamId, logger)];
                case 2:
                    info = _a.sent();
                    if (!info) {
                        throw new Error('no installation');
                    }
                    return [2 /*return*/, info];
                case 3:
                    exception_1 = _a.sent();
                    logger === null || logger === void 0 ? void 0 : logger.error('get team information error:', JSON.stringify(exception_1));
                    throw new Error('Failed fetching installation');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function deleteInstallation(installQuery, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var teamId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teamId = (0, utils_1.getTeamIdForInstallQuery)(installQuery);
                    return [4 /*yield*/, deleteInstallationFromDB(teamId, logger)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getAuthToken(teamId) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var installation;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, queryInstallationFromDB(teamId)];
                case 1:
                    installation = _b.sent();
                    if (!installation) {
                        return [2 /*return*/, null];
                    }
                    if (installation.tokenType === 'bot') {
                        return [2 /*return*/, ((_a = installation.bot) === null || _a === void 0 ? void 0 : _a.token) || null];
                    }
                    else if (installation.tokenType === 'user') {
                        return [2 /*return*/, installation.user.token || null];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
exports.getAuthToken = getAuthToken;
function installationCollection() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, installationCollection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mongodb_1["default"]];
                case 1:
                    client = _a.sent();
                    db = client.db();
                    installationCollection = db.collection(constants_1.COLLECTIONS.installations);
                    return [2 /*return*/, installationCollection];
            }
        });
    });
}
function queryInstallationFromDB(teamId, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var collection, res, encInfo, info, exception_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, installationCollection()];
                case 1:
                    collection = _a.sent();
                    return [4 /*yield*/, collection.findOne({ teamId: teamId })];
                case 2:
                    res = _a.sent();
                    if (!res) {
                        logger === null || logger === void 0 ? void 0 : logger.error('no record!!');
                        return [2 /*return*/, null];
                    }
                    encInfo = encrypted.decodeInformation(res.data);
                    if (!encInfo) {
                        logger === null || logger === void 0 ? void 0 : logger.error('decryption failed');
                        return [2 /*return*/, null];
                    }
                    info = JSON.parse(encInfo);
                    return [2 /*return*/, info];
                case 3:
                    exception_2 = _a.sent();
                    logger === null || logger === void 0 ? void 0 : logger.error('get team information error:', JSON.stringify(exception_2));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function deleteInstallationFromDB(teamId, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var collection, exception_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, installationCollection()];
                case 1:
                    collection = _a.sent();
                    return [4 /*yield*/, collection.deleteOne({ teamId: teamId })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    exception_3 = _a.sent();
                    logger === null || logger === void 0 ? void 0 : logger.info('delete team information error:', JSON.stringify(exception_3));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
function addTeamInformation(installation, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var teamId, existInformation, info, encInfo, collection, exception_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teamId = (0, utils_1.getTeamForInstallation)(installation);
                    return [4 /*yield*/, queryInstallationFromDB(teamId, logger)];
                case 1:
                    existInformation = _a.sent();
                    if (!existInformation) return [3 /*break*/, 3];
                    return [4 /*yield*/, deleteInstallationFromDB(teamId, logger)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    info = JSON.stringify(installation);
                    encInfo = encrypted.encodeInformation(info);
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, installationCollection()];
                case 5:
                    collection = _a.sent();
                    collection.createIndex({ teamId: 1 }, { unique: true });
                    return [4 /*yield*/, collection.insertOne({ teamId: teamId, data: encInfo })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    exception_4 = _a.sent();
                    logger === null || logger === void 0 ? void 0 : logger.error('add team information error:', JSON.stringify(exception_4));
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
