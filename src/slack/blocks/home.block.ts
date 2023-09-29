import {
  Blocks,
  Elements,
  HomeTab,
  Md,
  setIfTruthy,
} from 'slack-block-builder';
import { PrayerWithoutNone, actions, prayerWithoutNone } from '../../constants';
import { LOCALS } from '../../lib/locals';
import { getReadableName } from '../../lib/utils';

export const homeBlock = ({
  currentDate,
  times,
  nextPrayer,
  language = 'en',
  reminderList,
}: {
  currentDate?: string;
  times?: Record<PrayerWithoutNone, string>;
  reminderList?: prayerWithoutNone[];
  language?: 'en' | 'ar';
  nextPrayer?: {
    name: string;
    remainingTime: string;
  };
}) =>
  HomeTab()
    .blocks(
      // Blocks.Header({ text: "Today's Date" }),
      // Blocks.Section({ text: ` ${currentDate} ` }),
      setIfTruthy(reminderList && reminderList?.length > 0, [
        Blocks.Section({
          text: `${LOCALS.BOT_REMINDER_IN_TIMES[language]}: _${reminderList
            ?.map((r) => getReadableName(r, language))
            ?.join(' ,')}_`,
        }),
      ]),
      Blocks.Actions().elements([
        Elements.Button()
          .text(LOCALS.SETTINGS[language])
          .actionId(actions.appSettingsClick),
      ]),
      Blocks.Divider(),
      setIfTruthy(nextPrayer && nextPrayer?.name !== 'none', [
        Blocks.Header({ text: `🕌 ${LOCALS.NEXT_PRAYER[language]}` }),
        Blocks.Section({
          text: `*${nextPrayer?.remainingTime}* ${LOCALS.LEFT_FOR_PRAYER[language]} *${nextPrayer?.name}*`,
        }),
        Blocks.Divider(),
      ]),
      Blocks.Header({ text: `🕌 ${LOCALS.PRAYER_TIMES_FOR_TODAY[language]}` }),
      times
        ? Object.entries(times).map(([key, value]) =>
            Blocks.Section({
              text: `*${key}*: _${value}_ `,
            }),
          )
        : Blocks.Section({ text: LOCALS.NO_PRAYER_TIME_FOUND[language] }),
      Blocks.Divider(),

      Blocks.Section().text(
        `Developed with ❤️ by ${Md.bold(
          'Nureddin Badawi',
        )}. If you have any feedback, reach out to me on ${Md.link(
          'https://twitter.com/nurdindev',
          'Twitter',
        )}, ${Md.link('mailto:hey@nurdin.dev', 'Email')} or check out ${Md.link(
          'https://nurdin.dev',
          'Nurdin.dev',
        )}.`,
      ),
    )
    .buildToObject();
