import { Coordinates, Prayer } from 'adhan';
import { Bits, Blocks, Elements, Modal } from 'slack-block-builder';
import {
  ILanguages,
  calculationMethod,
  minutesOffset,
  prayerWithoutNone,
  settingsView,
} from '../../constants';
import { getReadableName, languagesOptions } from '../../lib/utils';

export const settingsBlock = (
  coordinates?: Coordinates,
  method?: string,
  reminderList?: prayerWithoutNone[],
  language: ILanguages = 'en',
) =>
  Modal({
    title: 'Config Prayer Time',
    close: 'Cancel',
    submit: 'Save Changes',
    callbackId: settingsView.callbackId,
  })
    .blocks(
      Blocks.Section({
        text: 'To get correct pryer time, you need to set your location and calculation method, to get the longitude and latitude of your location check this <https://www.latlong.net|link>.',
      }),
      Blocks.Input({
        label: 'Latitude',
        blockId: settingsView.fields.latitude,
        hint: 'e.g. 37.4224764',
      }).element(
        Elements.NumberInput()
          .isDecimalAllowed(true)
          .placeholder('Put your latitude here')
          .maxValue(90)
          .minValue(-90)
          .actionId(settingsView.fields.latitude)
          .initialValue(coordinates?.latitude),
      ),
      Blocks.Input({
        label: 'Longitude',
        blockId: settingsView.fields.longitude,
        hint: 'e.g. -122.0842499',
      }).element(
        Elements.NumberInput()
          .isDecimalAllowed(true)
          .placeholder('Put your longitude here')
          .maxValue(180)
          .minValue(-180)
          .actionId(settingsView.fields.longitude)
          .initialValue(coordinates?.longitude),
      ),

      Blocks.Divider(),
      Blocks.Input({
        label: 'Calculation Method',
        hint: 'To get best results select the nearest method to your country',
        blockId: settingsView.fields.calculationMethod,
      }).element(
        Elements.StaticSelect()
          .placeholder('Select calculation method...')
          .actionId(settingsView.fields.calculationMethod)
          .options(
            Object.entries(calculationMethod).map(([key, value]) =>
              Bits.Option({ text: value, value: key }),
            ),
          )
          .initialOption(
            method
              ? Bits.Option({
                  value: method,
                  text: calculationMethod[
                    method as keyof typeof calculationMethod
                  ],
                })
              : undefined,
          ),
      ),
      Blocks.Divider(),
      Blocks.Input({
        label: 'Reminder Configs',
        hint: `Select which prayer time you want to be notified, the bot will send you a reminder before ${minutesOffset} minutes of the Adhan.`,
        blockId: settingsView.fields.reminderList,
      })
        .optional(true)
        .element(
          Elements.StaticMultiSelect()
            .placeholder('Select which prayer time...')
            .actionId(settingsView.fields.reminderList)
            .options(
              Object.entries(Prayer).map(([key, value]) => {
                if (key !== 'None') {
                  return Bits.Option({
                    text: getReadableName(value, language),
                    value: value,
                  });
                }
              }),
            )
            .maxSelectedItems(6)
            .initialOptions(
              reminderList !== undefined
                ? reminderList?.map((item) =>
                    Bits.Option({
                      value: item,
                      text: getReadableName(item, language),
                    }),
                  )
                : [
                    Bits.Option({
                      value: Prayer.Dhuhr,
                      text: getReadableName(Prayer.Dhuhr, language),
                    }),
                    Bits.Option({
                      value: Prayer.Asr,
                      text: getReadableName(Prayer.Asr, language),
                    }),
                    Bits.Option({
                      value: Prayer.Maghrib,
                      text: getReadableName(Prayer.Maghrib, language),
                    }),
                  ],
            ),
        ),

      Blocks.Input({
        label: 'Preferred Language',
        hint: 'Select your preferred language for messages and prayer time names',
        blockId: settingsView.fields.language,
      }).element(
        Elements.StaticSelect()
          .placeholder('Select language...')
          .actionId(settingsView.fields.language)
          .options(languagesOptions.map((item) => Bits.Option(item)))
          .initialOption(
            language
              ? Bits.Option({
                  text: languagesOptions.find((lang) => lang.value === language)
                    ?.text,
                  value: language,
                })
              : Bits.Option({
                  text: 'English',
                  value: 'en',
                }),
          ),
      ),
    )
    .buildToObject();
