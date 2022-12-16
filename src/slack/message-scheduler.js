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
exports.MessageScheduler = void 0;
var adhan_1 = require("adhan");
var moment_timezone_1 = require("moment-timezone");
var slack_block_builder_1 = require("slack-block-builder");
var constants_1 = require("../constants");
var mongodb_1 = require("../db/mongodb");
var adhan_2 = require("../lib/adhan");
var locals_1 = require("../lib/locals");
var utils_1 = require("../lib/utils");
var MessageScheduler = /** @class */ (function () {
    function MessageScheduler(client, logger) {
        this.client = client;
        this.logger = logger;
    }
    /**
     * handle sending sequence of messages, first message is the reminder before 10 minutes
     * second message is the time of the prayer when actual time is reached
     * @param prayerName prayer name
     * @param date prayer time
     */
    MessageScheduler.prototype.handleScheduleMessages = function (userId, teamId, prayerName, date, timezone, language) {
        if (language === void 0) { language = 'en'; }
        return __awaiter(this, void 0, void 0, function () {
            var reminderTime, actualTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reminderTime = new Date(date);
                        actualTime = new Date(date);
                        reminderTime.setMinutes(reminderTime.getMinutes() - constants_1.minutesOffset);
                        return [4 /*yield*/, Promise.all([
                                this.scheduleMessage(token, userId, teamId, prayerName, reminderTime, "\uD83D\uDD4C ".concat(locals_1.LOCALS.REMINDER.FIRST[language], ", ").concat((0, utils_1.getReadableName)(prayerName, language), " ").concat(locals_1.LOCALS.REMINDER.IN[language], " ").concat(constants_1.minutesOffset, " ").concat(locals_1.LOCALS.REMINDER.MINUTES[language]), (0, slack_block_builder_1.BlockCollection)(slack_block_builder_1.Blocks.Section().text("*".concat(locals_1.LOCALS.REMINDER.FIRST[language], "*\n ").concat((0, utils_1.getReadableName)(prayerName, language), " ").concat(locals_1.LOCALS.REMINDER.IN[language], " ").concat(constants_1.minutesOffset, " ").concat(locals_1.LOCALS.REMINDER.MINUTES[language])))),
                                this.scheduleMessage(token, userId, teamId, prayerName, actualTime, "\uD83D\uDD4C ".concat(locals_1.LOCALS.REMINDER.SECOND[language], ", ").concat((0, utils_1.getReadableName)(prayerName, language), " ").concat(locals_1.LOCALS.REMINDER.AT[language], " ").concat(this.formatDateToTime(date, timezone)), (0, slack_block_builder_1.BlockCollection)(slack_block_builder_1.Blocks.Section().text("*".concat(locals_1.LOCALS.REMINDER.SECOND[language], "*\n ").concat((0, utils_1.getReadableName)(prayerName, language), " ").concat(locals_1.LOCALS.REMINDER.AT[language], " ").concat(this.formatDateToTime(date, timezone))))),
                            ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MessageScheduler.prototype.reScheduleMessages = function (userId, teamId, nextPrayersList) {
        return __awaiter(this, void 0, void 0, function () {
            var user, messages, coordinates, tz, calculationMethod, language, adhan, messagesMap, _i, nextPrayersList_1, prayerName, timeForPrayer, ids;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserFromDb(userId, teamId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/];
                        messages = user.messages, coordinates = user.coordinates, tz = user.tz, calculationMethod = user.calculationMethod, language = user.language;
                        if (!coordinates || !calculationMethod)
                            return [2 /*return*/];
                        adhan = new adhan_2.Adhan(new adhan_1.Coordinates(coordinates.latitude, coordinates.longitude), calculationMethod, tz, language);
                        if (adhan.nextPrayer === 'none')
                            return [2 /*return*/];
                        if (!messages) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.all(Object.values(messages)
                                .filter(function (v) { return v !== null; })
                                .reduce(function (acc, value) {
                                acc.push.apply(acc, value);
                                return acc;
                            }, [])
                                .map(function (messageId) { return _this.deleteScheduledMessage(userId, messageId); }))["catch"](function (error) {
                                _this.logger.error(error);
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        messagesMap = new Map();
                        if (!(nextPrayersList === null || nextPrayersList === void 0 ? void 0 : nextPrayersList.length)) return [3 /*break*/, 7];
                        _i = 0, nextPrayersList_1 = nextPrayersList;
                        _a.label = 4;
                    case 4:
                        if (!(_i < nextPrayersList_1.length)) return [3 /*break*/, 7];
                        prayerName = nextPrayersList_1[_i];
                        timeForPrayer = adhan.prayerTimes.timeForPrayer(prayerName);
                        // if the time in the past, skip it
                        if ((0, moment_timezone_1["default"])(timeForPrayer).isBefore((0, moment_timezone_1["default"])())) {
                            return [3 /*break*/, 6];
                        }
                        if (!(timeForPrayer instanceof Date)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.handleScheduleMessages(userId, teamId, prayerName, timeForPrayer, tz, language)["catch"](function (error) {
                                _this.logger.error(error);
                            })];
                    case 5:
                        ids = _a.sent();
                        messagesMap.set(prayerName, ids);
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [4 /*yield*/, this.updateUser(userId, teamId, messagesMap)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MessageScheduler.prototype.updateUser = function (userId, teamId, messagesMap) {
        return __awaiter(this, void 0, void 0, function () {
            var mongoClient, db, userCollection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongodb_1["default"]];
                    case 1:
                        mongoClient = _a.sent();
                        db = mongoClient.db();
                        userCollection = db.collection(constants_1.COLLECTIONS.users);
                        return [4 /*yield*/, userCollection.updateOne({ teamId: teamId, userId: userId }, {
                                $set: {
                                    'messages.fajr': messagesMap.get('fajr'),
                                    'messages.sunrise': messagesMap.get('sunrise'),
                                    'messages.dhuhr': messagesMap.get('dhuhr'),
                                    'messages.asr': messagesMap.get('asr'),
                                    'messages.maghrib': messagesMap.get('maghrib'),
                                    'messages.isha': messagesMap.get('isha')
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MessageScheduler.prototype.getUserFromDb = function (userId, teamId) {
        return __awaiter(this, void 0, void 0, function () {
            var mongoClient, db, userCollection, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mongodb_1["default"]];
                    case 1:
                        mongoClient = _a.sent();
                        db = mongoClient.db();
                        userCollection = db.collection(constants_1.COLLECTIONS.users);
                        return [4 /*yield*/, userCollection.findOne({ userId: userId, teamId: teamId })];
                    case 2:
                        user = _a.sent();
                        return [2 /*return*/, user];
                }
            });
        });
    };
    MessageScheduler.prototype.formatDateToTime = function (date, timezone) {
        if (timezone) {
            return (0, moment_timezone_1["default"])(date).tz(timezone).format('HH:mm');
        }
        return (0, moment_timezone_1["default"])(date).format('HH:mm');
    };
    MessageScheduler.prototype.convertUnixTimestamp = function (date) {
        return Math.floor(date.getTime() / 1000);
    };
    MessageScheduler.prototype.deleteScheduledMessage = function (userId, messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteMessage, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!messageId)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.chat.deleteScheduledMessage({
                                channel: userId,
                                scheduled_message_id: messageId
                            })];
                    case 2:
                        deleteMessage = _a.sent();
                        if (deleteMessage.ok) {
                            this.logger.info("Deleted scheduled message ".concat(messageId));
                        }
                        if (deleteMessage.error) {
                            this.logger.error("Error deleting scheduled message ".concat(messageId));
                        }
                        return [2 /*return*/, deleteMessage];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * this function will send client.chat.scheduleMessage to slack
     * and it will check if there is an offset, the time will be subtracted by the offset
     * @param prayerName prayer name
     * @param time time for the prayer
     * @param minutes offset in minutes
     */
    MessageScheduler.prototype.scheduleMessage = function (token, userId, teamId, prayerName, time, text, blocks) {
        return __awaiter(this, void 0, void 0, function () {
            var scheduleMessage, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.chat.scheduleMessage({
                                token: token,
                                channel: userId,
                                team_id: teamId,
                                post_at: this.convertUnixTimestamp(time),
                                blocks: blocks,
                                text: text
                            })];
                    case 1:
                        scheduleMessage = _a.sent();
                        if (scheduleMessage.ok) {
                            this.logger.info("Reminder for ".concat(prayerName, " scheduled at ").concat(time.toISOString()));
                            return [2 /*return*/, scheduleMessage.scheduled_message_id];
                        }
                        if (scheduleMessage.error) {
                            this.logger.error(scheduleMessage.error);
                        }
                        return [2 /*return*/, ''];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error(error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return MessageScheduler;
}());
exports.MessageScheduler = MessageScheduler;
