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
exports.homeOpenedEvent = void 0;
var adhan_1 = require("adhan");
var slack_block_builder_1 = require("slack-block-builder");
var constants_1 = require("../../constants");
var mongodb_1 = require("../../db/mongodb");
var adhan_2 = require("../../lib/adhan");
var locals_1 = require("../../lib/locals");
var utils_1 = require("../../lib/utils");
var home_block_1 = require("../blocks/home.block");
var homeOpenedEvent = function (_a) {
    var client = _a.client, event = _a.event, context = _a.context;
    return __awaiter(void 0, void 0, void 0, function () {
        var mongoClient, db, userCollection, teamId, user, calculationMethod, coordinates, reminderList, language, userInfo, adhan;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, mongodb_1["default"]];
                case 1:
                    mongoClient = _c.sent();
                    db = mongoClient.db();
                    userCollection = db.collection(constants_1.COLLECTIONS.users);
                    teamId = (0, utils_1.getTeamIdFromContext)(context);
                    return [4 /*yield*/, userCollection.findOne({
                            userId: event.user,
                            teamId: teamId
                        })];
                case 2:
                    user = _c.sent();
                    console.log({ user: user });
                    if (!!user) return [3 /*break*/, 4];
                    return [4 /*yield*/, client.views.publish({
                            user_id: event.user,
                            view: (0, home_block_1.homeBlock)({
                                currentDate: "Please set your location by clicking on ".concat(slack_block_builder_1.Md.italic('Prayer Configs'))
                            })
                        })];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
                case 4:
                    calculationMethod = user.calculationMethod, coordinates = user.coordinates, reminderList = user.reminderList, language = user.language;
                    if (!!coordinates) return [3 /*break*/, 6];
                    return [4 /*yield*/, client.views.publish({
                            user_id: event.user,
                            view: (0, home_block_1.homeBlock)({
                                currentDate: locals_1.LOCALS.NO_COORDINATES_SETTINGS[language]
                            })
                        })];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 9];
                case 6: return [4 /*yield*/, client.users.info({
                        user: event.user
                    })];
                case 7:
                    userInfo = _c.sent();
                    adhan = new adhan_2.Adhan(new adhan_1.Coordinates(coordinates.latitude, coordinates.longitude), calculationMethod, (_b = userInfo.user) === null || _b === void 0 ? void 0 : _b.tz, language);
                    return [4 /*yield*/, client.views.publish({
                            user_id: event.user,
                            view: (0, home_block_1.homeBlock)({
                                currentDate: adhan.currentDate,
                                times: adhan.localizedPrayerList,
                                reminderList: reminderList,
                                language: language,
                                nextPrayer: {
                                    name: adhan.nextPrayer,
                                    remainingTime: adhan.remainingTime(adhan.prayerTimes.timeForPrayer(adhan.prayerTimes.nextPrayer()))
                                }
                            })
                        })];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
};
exports.homeOpenedEvent = homeOpenedEvent;
