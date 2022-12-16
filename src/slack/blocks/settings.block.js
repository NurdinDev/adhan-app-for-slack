"use strict";
exports.__esModule = true;
exports.settingsBlock = void 0;
var adhan_1 = require("adhan");
var slack_block_builder_1 = require("slack-block-builder");
var constants_1 = require("../../constants");
var utils_1 = require("../../lib/utils");
var settingsBlock = function (coordinates, method, reminderList, language) {
    var _a;
    if (language === void 0) { language = 'en'; }
    return (0, slack_block_builder_1.Modal)({
        title: 'Config Prayer Time',
        close: 'Cancel',
        submit: 'Save Changes',
        callbackId: constants_1.settingsView.callbackId
    })
        .blocks(slack_block_builder_1.Blocks.Section({
        text: 'To get correct pryer time, you need to set your location and calculation method, to get the longitude and latitude of your location check this <https://www.latlong.net|link>.'
    }), slack_block_builder_1.Blocks.Input({
        label: 'Latitude',
        blockId: constants_1.settingsView.fields.latitude,
        hint: 'e.g. 37.4224764'
    }).element(slack_block_builder_1.Elements.NumberInput()
        .isDecimalAllowed(true)
        .placeholder('Put your latitude here')
        .maxValue(90)
        .minValue(-90)
        .actionId(constants_1.settingsView.fields.latitude)
        .initialValue(coordinates === null || coordinates === void 0 ? void 0 : coordinates.latitude)), slack_block_builder_1.Blocks.Input({
        label: 'Longitude',
        blockId: constants_1.settingsView.fields.longitude,
        hint: 'e.g. -122.0842499'
    }).element(slack_block_builder_1.Elements.NumberInput()
        .isDecimalAllowed(true)
        .placeholder('Put your longitude here')
        .maxValue(180)
        .minValue(-180)
        .actionId(constants_1.settingsView.fields.longitude)
        .initialValue(coordinates === null || coordinates === void 0 ? void 0 : coordinates.longitude)), slack_block_builder_1.Blocks.Divider(), slack_block_builder_1.Blocks.Input({
        label: 'Calculation Method',
        hint: 'To get best results select the nearest method to your country',
        blockId: constants_1.settingsView.fields.calculationMethod
    }).element(slack_block_builder_1.Elements.StaticSelect()
        .placeholder('Select calculation method...')
        .actionId(constants_1.settingsView.fields.calculationMethod)
        .options(Object.entries(constants_1.calculationMethod).map(function (_a) {
        var key = _a[0], value = _a[1];
        return slack_block_builder_1.Bits.Option({ text: value, value: key });
    }))
        .initialOption(method
        ? slack_block_builder_1.Bits.Option({
            text: method,
            value: constants_1.calculationMethod[method]
        })
        : undefined)), slack_block_builder_1.Blocks.Divider(), slack_block_builder_1.Blocks.Input({
        label: 'Reminder Configs',
        hint: "Select which prayer time you want to be notified, the bot will send you a reminder before ".concat(constants_1.minutesOffset, " minutes of the Adhan."),
        blockId: constants_1.settingsView.fields.reminderList
    })
        .optional(true)
        .element(slack_block_builder_1.Elements.StaticMultiSelect()
        .placeholder('Select which prayer time...')
        .actionId(constants_1.settingsView.fields.reminderList)
        .options(Object.entries(adhan_1.Prayer).map(function (_a) {
        var key = _a[0], value = _a[1];
        if (key !== 'None') {
            return slack_block_builder_1.Bits.Option({
                text: (0, utils_1.getReadableName)(value, language),
                value: value
            });
        }
    }))
        .maxSelectedItems(6)
        .initialOptions(reminderList !== undefined
        ? reminderList === null || reminderList === void 0 ? void 0 : reminderList.map(function (item) {
            return slack_block_builder_1.Bits.Option({
                value: item,
                text: (0, utils_1.getReadableName)(item, language)
            });
        })
        : [
            slack_block_builder_1.Bits.Option({
                value: adhan_1.Prayer.Dhuhr,
                text: (0, utils_1.getReadableName)(adhan_1.Prayer.Dhuhr, language)
            }),
            slack_block_builder_1.Bits.Option({
                value: adhan_1.Prayer.Asr,
                text: (0, utils_1.getReadableName)(adhan_1.Prayer.Asr, language)
            }),
            slack_block_builder_1.Bits.Option({
                value: adhan_1.Prayer.Maghrib,
                text: (0, utils_1.getReadableName)(adhan_1.Prayer.Maghrib, language)
            }),
        ])), slack_block_builder_1.Blocks.Input({
        label: 'Preferred Language',
        hint: 'Select your preferred language for messages and prayer time names',
        blockId: constants_1.settingsView.fields.language
    }).element(slack_block_builder_1.Elements.StaticSelect()
        .placeholder('Select language...')
        .actionId(constants_1.settingsView.fields.language)
        .options(utils_1.languagesOptions.map(function (item) { return slack_block_builder_1.Bits.Option(item); }))
        .initialOption(language
        ? slack_block_builder_1.Bits.Option({
            text: (_a = utils_1.languagesOptions.find(function (lang) { return lang.value === language; })) === null || _a === void 0 ? void 0 : _a.text,
            value: language
        })
        : slack_block_builder_1.Bits.Option({
            text: 'English',
            value: 'en'
        }))))
        .buildToObject();
};
exports.settingsBlock = settingsBlock;
