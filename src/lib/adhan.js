"use strict";
exports.__esModule = true;
exports.Adhan = void 0;
var adhan_1 = require("adhan");
var moment_timezone_1 = require("moment-timezone");
var locals_1 = require("./locals");
var utils_1 = require("./utils");
var Adhan = /** @class */ (function () {
    function Adhan(coordinates, calculationParameters, timeZone, language) {
        if (timeZone === void 0) { timeZone = 'Asia/Dubai'; }
        this.language = 'en';
        this.timeZone = timeZone;
        this.language = language;
        var date = (0, moment_timezone_1["default"])().tz(timeZone).toDate();
        this.prayerTimes = new adhan_1.PrayerTimes(coordinates, date, this.getMethod(calculationParameters));
    }
    Adhan.prototype.formatTime = function (time) {
        return (0, moment_timezone_1["default"])(time).tz(this.timeZone).format('h:mm A');
    };
    Adhan.prototype.getAllPrayerTimes = function () {
        return this.prayerTimes;
    };
    Object.defineProperty(Adhan.prototype, "currentDate", {
        get: function () {
            return (0, moment_timezone_1["default"])(this.prayerTimes.date)
                .tz(this.timeZone)
                .format('MMMM DD, YYYY');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "getCurrentPrayer", {
        get: function () {
            return this.prayerTimes.currentPrayer();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "getFajr", {
        get: function () {
            return this.formatTime(this.prayerTimes.fajr);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "getSunrise", {
        get: function () {
            return this.formatTime(this.prayerTimes.sunrise);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "getDhuhr", {
        get: function () {
            return this.formatTime(this.prayerTimes.dhuhr);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "getAsr", {
        get: function () {
            return this.formatTime(this.prayerTimes.asr);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "getMaghrib", {
        get: function () {
            return this.formatTime(this.prayerTimes.maghrib);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "getIsha", {
        get: function () {
            return this.formatTime(this.prayerTimes.isha);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "nextPayerTimeAndRemaining", {
        get: function () {
            var _a;
            if (this.prayerTimes.nextPrayer() === 'none') {
                return null;
            }
            // calculate the next prayer time
            var nextPrayerTime = this.prayerTimes.timeForPrayer(this.prayerTimes.nextPrayer());
            if (!nextPrayerTime) {
                return null;
            }
            return _a = {},
                _a[this.prayerTimes.nextPrayer()] = this.remainingTime(nextPrayerTime),
                _a;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "localizedPrayerList", {
        get: function () {
            var _a;
            return _a = {},
                _a[locals_1.LOCALS.PRAYER_NAMES.Fajr[this.language]] = this.getFajr,
                _a[locals_1.LOCALS.PRAYER_NAMES.Sunrise[this.language]] = this.getSunrise,
                _a[locals_1.LOCALS.PRAYER_NAMES.Dhuhr[this.language]] = this.getDhuhr,
                _a[locals_1.LOCALS.PRAYER_NAMES.Asr[this.language]] = this.getAsr,
                _a[locals_1.LOCALS.PRAYER_NAMES.Maghrib[this.language]] = this.getMaghrib,
                _a[locals_1.LOCALS.PRAYER_NAMES.Isha[this.language]] = this.getIsha,
                _a;
        },
        enumerable: false,
        configurable: true
    });
    Adhan.prototype.getMethod = function (calculationMethod) {
        switch (calculationMethod) {
            case 'MuslimWorldLeague':
                return adhan_1.CalculationMethod.MuslimWorldLeague();
            case 'Egyptian':
                return adhan_1.CalculationMethod.Egyptian();
            case 'Karachi':
                return adhan_1.CalculationMethod.Karachi();
            case 'UmmAlQura':
                return adhan_1.CalculationMethod.UmmAlQura();
            case 'Dubai':
                return adhan_1.CalculationMethod.Dubai();
            case 'MoonsightingCommittee':
                return adhan_1.CalculationMethod.MoonsightingCommittee();
            case 'NorthAmerica':
                return adhan_1.CalculationMethod.NorthAmerica();
            case 'Kuwait':
                return adhan_1.CalculationMethod.Kuwait();
            case 'Qatar':
                return adhan_1.CalculationMethod.Qatar();
            case 'Singapore':
                return adhan_1.CalculationMethod.Singapore();
            case 'Turkey':
                return adhan_1.CalculationMethod.Turkey();
            case 'Tehran':
                return adhan_1.CalculationMethod.Tehran();
            default:
                return adhan_1.CalculationMethod.Other();
        }
    };
    Object.defineProperty(Adhan.prototype, "nextPrayer", {
        get: function () {
            var next = this.prayerTimes.nextPrayer();
            return (0, utils_1.getReadableName)(next, this.language);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Adhan.prototype, "currentPrayer", {
        get: function () {
            var current = this.prayerTimes.currentPrayer();
            return (0, utils_1.getReadableName)(current, this.language);
        },
        enumerable: false,
        configurable: true
    });
    Adhan.prototype.timeForPrayer = function (prayer) {
        return this.prayerTimes.timeForPrayer(prayer);
    };
    Adhan.prototype.remainingTime = function (prayerTime) {
        if (!prayerTime) {
            return '';
        }
        var remainingMinutes = (0, moment_timezone_1["default"])(prayerTime).diff((0, moment_timezone_1["default"])(), 'minutes');
        var hours = Math.floor(remainingMinutes / 60);
        var minutes = remainingMinutes % 60;
        return "".concat(hours ? "".concat(hours.toString().padStart(2, '0')) : '00', ":").concat(minutes
            .toString()
            .padStart(2, '0'));
    };
    return Adhan;
}());
exports.Adhan = Adhan;
