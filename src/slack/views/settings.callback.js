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
exports.settingsViewCallback = void 0;
var adhan_1 = require("adhan");
var constants_1 = require("../../constants");
var mongodb_1 = require("../../db/mongodb");
var adhan_2 = require("../../lib/adhan");
var utils_1 = require("../../lib/utils");
var home_block_1 = require("../blocks/home.block");
var message_scheduler_1 = require("../message-scheduler");
var settingsViewCallback = function (_a) {
    var ack = _a.ack, view = _a.view, body = _a.body, client = _a.client, logger = _a.logger;
    return __awaiter(void 0, void 0, void 0, function () {
        var userId, teamId, mongoClient, db, userCollection, _b, _c, _d, latitude, _e, _f, longitude, _g, _h, reminderListOptions, _j, _k, calculationMethodOption, _l, _m, languageOption, reminderList, userInfo, coordinates, adhan, e_1, messageScheduler, error_1;
        var _o, _p;
        var _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0:
                    userId = body.user.id;
                    teamId = (0, utils_1.getTeamIdViewSubmitAction)(body);
                    return [4 /*yield*/, mongodb_1["default"]];
                case 1:
                    mongoClient = _s.sent();
                    db = mongoClient.db();
                    userCollection = db.collection(constants_1.COLLECTIONS.users);
                    _s.label = 2;
                case 2:
                    _s.trys.push([2, 15, , 16]);
                    _b = view.state.values, _c = constants_1.settingsView.fields.latitude, _d = constants_1.settingsView.fields.latitude, latitude = _b[_c][_d].value, _e = constants_1.settingsView.fields.longitude, _f = constants_1.settingsView.fields.longitude, longitude = _b[_e][_f].value, _g = constants_1.settingsView.fields.reminderList, _h = constants_1.settingsView.fields.reminderList, reminderListOptions = _b[_g][_h].selected_options, _j = constants_1.settingsView.fields.calculationMethod, _k = constants_1.settingsView.fields.calculationMethod, calculationMethodOption = _b[_j][_k].selected_option, _l = constants_1.settingsView.fields.language, _m = constants_1.settingsView.fields.language, languageOption = _b[_l][_m].selected_option;
                    reminderList = reminderListOptions === null || reminderListOptions === void 0 ? void 0 : reminderListOptions.map(function (option) { return option.value; });
                    if (!(!latitude || !longitude)) return [3 /*break*/, 4];
                    return [4 /*yield*/, ack({
                            response_action: 'errors',
                            errors: (_o = {},
                                _o[constants_1.settingsView.fields.latitude] = 'latitude is required',
                                _o[constants_1.settingsView.fields.longitude] = 'longitude is required',
                                _o)
                        })];
                case 3:
                    _s.sent();
                    return [2 /*return*/];
                case 4:
                    if (!!(calculationMethodOption === null || calculationMethodOption === void 0 ? void 0 : calculationMethodOption.value)) return [3 /*break*/, 6];
                    return [4 /*yield*/, ack({
                            response_action: 'errors',
                            errors: (_p = {},
                                _p[constants_1.settingsView.fields.calculationMethod] = 'in order to get correct time the calculation method is required',
                                _p)
                        })];
                case 5:
                    _s.sent();
                    return [2 /*return*/];
                case 6:
                    ack();
                    return [4 /*yield*/, client.users.info({
                            user: userId,
                            include_locale: true
                        })];
                case 7:
                    userInfo = _s.sent();
                    coordinates = new adhan_1.Coordinates(+latitude, +longitude);
                    if (!(coordinates && calculationMethodOption.value)) return [3 /*break*/, 14];
                    adhan = new adhan_2.Adhan(new adhan_1.Coordinates(coordinates.latitude, coordinates.longitude), calculationMethodOption.value, (_q = userInfo.user) === null || _q === void 0 ? void 0 : _q.tz, (languageOption === null || languageOption === void 0 ? void 0 : languageOption.value) || 'en');
                    // add prayer name as a key and time as a value
                    // const reminderList = reminderListOptions
                    //   ?.map((option) => option.value as prayersName)
                    //   ?.reduce((acc, prayerName) => {
                    //     const date = adhan.prayerTimes.timeForPrayer(prayerName);
                    //     if (!date) return acc;
                    //     return {
                    //       ...acc,
                    //       [prayerName]: date,
                    //     };
                    //   }, {} as Record<prayersName, Date>);
                    return [4 /*yield*/, client.views.publish({
                            user_id: userId,
                            view: (0, home_block_1.homeBlock)({
                                currentDate: adhan.currentDate,
                                times: adhan.localizedPrayerList,
                                language: languageOption === null || languageOption === void 0 ? void 0 : languageOption.value,
                                reminderList: reminderList,
                                nextPrayer: {
                                    name: adhan.nextPrayer,
                                    remainingTime: adhan.remainingTime(adhan.prayerTimes.timeForPrayer(adhan.prayerTimes.nextPrayer()))
                                }
                            })
                        })];
                case 8:
                    // add prayer name as a key and time as a value
                    // const reminderList = reminderListOptions
                    //   ?.map((option) => option.value as prayersName)
                    //   ?.reduce((acc, prayerName) => {
                    //     const date = adhan.prayerTimes.timeForPrayer(prayerName);
                    //     if (!date) return acc;
                    //     return {
                    //       ...acc,
                    //       [prayerName]: date,
                    //     };
                    //   }, {} as Record<prayersName, Date>);
                    _s.sent();
                    _s.label = 9;
                case 9:
                    _s.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, userCollection.updateOne({
                            userId: userId
                        }, {
                            $set: {
                                userId: userId,
                                teamId: teamId,
                                coordinates: coordinates,
                                calculationMethod: calculationMethodOption.value,
                                reminderList: reminderList,
                                tz: (_r = userInfo.user) === null || _r === void 0 ? void 0 : _r.tz,
                                language: (languageOption === null || languageOption === void 0 ? void 0 : languageOption.value) || 'en'
                            }
                        }, { upsert: true })];
                case 10:
                    _s.sent();
                    logger.info('User settings updated');
                    return [3 /*break*/, 12];
                case 11:
                    e_1 = _s.sent();
                    logger.error('Error while updating user settings', e_1);
                    return [3 /*break*/, 12];
                case 12:
                    messageScheduler = new message_scheduler_1.MessageScheduler(client, logger);
                    // FIXME: prevent rescheduling if the user didn't change the reminder list
                    return [4 /*yield*/, messageScheduler.reScheduleMessages(userId, teamId, reminderList)];
                case 13:
                    // FIXME: prevent rescheduling if the user didn't change the reminder list
                    _s.sent();
                    _s.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_1 = _s.sent();
                    logger.error(error_1);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
};
exports.settingsViewCallback = settingsViewCallback;
