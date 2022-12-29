import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Prayer,
  PrayerTimes,
} from 'adhan';
import { utcToZonedTime } from 'date-fns-tz';
import moment from 'moment-timezone';
import {
  calculationMethod,
  ILanguages,
  prayerWithoutNone,
  ValueOf,
} from '../constants';
import { LOCALS } from './locals';
import { getReadableName } from './utils';

export class Adhan {
  prayerTimes: PrayerTimes;
  timeZone: string;
  language: ILanguages = 'en';
  constructor(
    coordinates: Coordinates,
    calculationParameters: calculationMethod,
    timeZone = 'Asia/Dubai',
    language: ILanguages,
  ) {
    this.timeZone = timeZone;

    this.language = language;

    this.prayerTimes = new PrayerTimes(
      coordinates,
      utcToZonedTime(new Date(), timeZone),
      this.getMethod(calculationParameters),
    );
  }

  private formatTime(time: Date): string {
    return moment(time).tz(this.timeZone).format('h:mm A');
  }

  getAllPrayerTimes(): PrayerTimes {
    return this.prayerTimes;
  }

  get currentDate(): string {
    return moment(this.prayerTimes.date)
      .tz(this.timeZone)
      .format('MMMM DD, YYYY');
  }

  get getCurrentPrayer() {
    return this.prayerTimes.currentPrayer();
  }

  get getFajr(): string {
    return this.formatTime(this.prayerTimes.fajr);
  }

  get getSunrise(): string {
    return this.formatTime(this.prayerTimes.sunrise);
  }

  get getDhuhr(): string {
    return this.formatTime(this.prayerTimes.dhuhr);
  }

  get getAsr(): string {
    return this.formatTime(this.prayerTimes.asr);
  }

  get getMaghrib(): string {
    return this.formatTime(this.prayerTimes.maghrib);
  }

  get getIsha(): string {
    return this.formatTime(this.prayerTimes.isha);
  }

  get nextPayerTimeAndRemaining(): Record<string, string> | null {
    if (this.prayerTimes.nextPrayer() === 'none') {
      return null;
    }
    // calculate the next prayer time
    const nextPrayerTime = this.prayerTimes.timeForPrayer(
      this.prayerTimes.nextPrayer(),
    );
    if (!nextPrayerTime) {
      return null;
    }

    return {
      [this.prayerTimes.nextPrayer()]: this.remainingTime(nextPrayerTime),
    };
  }

  get localizedPrayerList(): Record<string, string> {
    return {
      [LOCALS.PRAYER_NAMES.Fajr[this.language]]: this.getFajr,
      [LOCALS.PRAYER_NAMES.Sunrise[this.language]]: this.getSunrise,
      [LOCALS.PRAYER_NAMES.Dhuhr[this.language]]: this.getDhuhr,
      [LOCALS.PRAYER_NAMES.Asr[this.language]]: this.getAsr,
      [LOCALS.PRAYER_NAMES.Maghrib[this.language]]: this.getMaghrib,
      [LOCALS.PRAYER_NAMES.Isha[this.language]]: this.getIsha,
    };
  }

  private getMethod(
    calculationMethod: calculationMethod,
  ): CalculationParameters {
    switch (calculationMethod) {
      case 'MuslimWorldLeague':
        return CalculationMethod.MuslimWorldLeague();
      case 'Egyptian':
        return CalculationMethod.Egyptian();
      case 'Karachi':
        return CalculationMethod.Karachi();
      case 'UmmAlQura':
        return CalculationMethod.UmmAlQura();
      case 'Dubai':
        return CalculationMethod.Dubai();
      case 'MoonsightingCommittee':
        return CalculationMethod.MoonsightingCommittee();
      case 'NorthAmerica':
        return CalculationMethod.NorthAmerica();
      case 'Kuwait':
        return CalculationMethod.Kuwait();
      case 'Qatar':
        return CalculationMethod.Qatar();
      case 'Singapore':
        return CalculationMethod.Singapore();
      case 'Turkey':
        return CalculationMethod.Turkey();
      case 'Tehran':
        return CalculationMethod.Tehran();
      default:
        return CalculationMethod.Other();
    }
  }

  get nextPrayer(): string {
    const next = this.prayerTimes.nextPrayer() as prayerWithoutNone;

    return getReadableName(next, this.language);
  }

  get currentPrayer(): string {
    const current = this.prayerTimes.currentPrayer() as prayerWithoutNone;
    return getReadableName(current, this.language);
  }

  timeForPrayer(prayer: ValueOf<typeof Prayer>): Date | null {
    return this.prayerTimes.timeForPrayer(prayer);
  }

  remainingTime(prayerTime: Date | null): string {
    if (!prayerTime) {
      return '';
    }
    const remainingMinutes = moment(prayerTime).diff(moment(), 'minutes');
    const hours = Math.floor(remainingMinutes / 60);

    const minutes = remainingMinutes % 60;
    return `${hours ? `${hours.toString().padStart(2, '0')}` : '00'}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
}
