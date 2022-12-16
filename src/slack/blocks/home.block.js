"use strict";
exports.__esModule = true;
exports.homeBlock = void 0;
var slack_block_builder_1 = require("slack-block-builder");
var constants_1 = require("../../constants");
var locals_1 = require("../../lib/locals");
var utils_1 = require("../../lib/utils");
var homeBlock = function (_a) {
    var _b;
    var currentDate = _a.currentDate, times = _a.times, nextPrayer = _a.nextPrayer, _c = _a.language, language = _c === void 0 ? 'en' : _c, reminderList = _a.reminderList;
    return (0, slack_block_builder_1.HomeTab)()
        .blocks(
    // Blocks.Header({ text: "Today's Date" }),
    // Blocks.Section({ text: ` ${currentDate} ` }),
    // Blocks.Divider(),
    (0, slack_block_builder_1.setIfTruthy)(nextPrayer && (nextPrayer === null || nextPrayer === void 0 ? void 0 : nextPrayer.name) !== 'none', [
        slack_block_builder_1.Blocks.Header({ text: "\uD83D\uDD4C ".concat(locals_1.LOCALS.NEXT_PRAYER[language]) }),
        slack_block_builder_1.Blocks.Section({
            text: "*".concat(nextPrayer === null || nextPrayer === void 0 ? void 0 : nextPrayer.remainingTime, "* ").concat(locals_1.LOCALS.LEFT_FOR_PRAYER[language], " *").concat(nextPrayer === null || nextPrayer === void 0 ? void 0 : nextPrayer.name, "*")
        }),
        slack_block_builder_1.Blocks.Divider(),
    ]), slack_block_builder_1.Blocks.Header({ text: "\uD83D\uDD4C ".concat(locals_1.LOCALS.PRAYER_TIMES_FOR_TODAY[language]) }), times
        ? Object.entries(times).map(function (_a) {
            var key = _a[0], value = _a[1];
            return slack_block_builder_1.Blocks.Section({
                text: "*".concat(key, "*: _").concat(value, "_ ")
            });
        })
        : slack_block_builder_1.Blocks.Section({ text: locals_1.LOCALS.NO_PRAYER_TIME_FOUND[language] }), slack_block_builder_1.Blocks.Divider(), (0, slack_block_builder_1.setIfTruthy)(reminderList && (reminderList === null || reminderList === void 0 ? void 0 : reminderList.length) > 0, [
        slack_block_builder_1.Blocks.Section({
            text: "".concat(locals_1.LOCALS.BOT_REMINDER_IN_TIMES[language], ": _").concat((_b = reminderList === null || reminderList === void 0 ? void 0 : reminderList.map(function (r) { return (0, utils_1.getReadableName)(r, language); })) === null || _b === void 0 ? void 0 : _b.join(' ,'), "_")
        }),
    ]), slack_block_builder_1.Blocks.Actions().elements([
        slack_block_builder_1.Elements.Button()
            .text(locals_1.LOCALS.SETTINGS[language])
            .actionId(constants_1.actions.appSettingsClick),
    ]))
        .buildToObject();
};
exports.homeBlock = homeBlock;
