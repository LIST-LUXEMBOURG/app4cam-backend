import { mkdir, rm } from 'fs/promises'
import { SettingsFromJsonFile } from './settings'
import {
  JSON_SETTINGS_WITH_NONE_SET,
  SettingsFileProvider,
} from './settings-file-provider'

const FIXTURE_FOLDER_PATH = 'src/settings/fixtures'
const TEST_FOLDER_PATH = 'src/settings/test'

describe(SettingsFileProvider.name, () => {
  describe(SettingsFileProvider.readSettingsFile.name, () => {
    describe('when an empty JSON file is present', () => {
      it('returns an object with empty settings', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/empty-settings.json',
        )
        expect(settings).toEqual(JSON_SETTINGS_WITH_NONE_SET)
      })
    })

    describe('when a JSON file with an empty object is present', () => {
      it('returns an object with empty settings', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/empty-object-settings.json',
        )
        expect(settings).toEqual(JSON_SETTINGS_WITH_NONE_SET)
      })
    })

    describe('when a JSON file with one setting is present', () => {
      it('returns an object with the setting set and all the others being empty', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/one-setting-settings.json',
        )
        expect(settings).toEqual({
          ...JSON_SETTINGS_WITH_NONE_SET,
          ...{
            general: {
              deviceName: 'a',
            },
          },
        })
      })
    })

    describe('when the file does not exist', () => {
      it('returns an object with empty properties', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/a',
        )
        const expected: SettingsFromJsonFile = {
          general: {
            deviceName: '',
            siteName: '',
          },
          triggering: {
            sleepingTime: '',
            wakingUpTime: '',
            light: 'infrared',
          },
        }
        expect(settings).toEqual(expected)
      })
    })
  })

  describe(SettingsFileProvider.writeSettingsToFile.name, () => {
    const TEMPORARY_FILE_NAME = 'write-settings.json'
    const TEMPORARY_FILE_PATH = TEST_FOLDER_PATH + '/' + TEMPORARY_FILE_NAME

    beforeAll(() => {
      mkdir(TEST_FOLDER_PATH)
    })

    it('writes settings object', async () => {
      const SETTINGS = {
        general: {
          deviceName: 'd',
          siteName: 's',
        },
        triggering: {
          sleepingTime: 's',
          wakingUpTime: 'w',
          light: 'infrared' as const,
        },
      }
      await SettingsFileProvider.writeSettingsToFile(
        SETTINGS,
        TEMPORARY_FILE_PATH,
      )
      const settingsRetrieved = await SettingsFileProvider.readSettingsFile(
        TEMPORARY_FILE_PATH,
      )
      expect(settingsRetrieved).toEqual(SETTINGS)
    })

    afterAll(async () => {
      rm(TEST_FOLDER_PATH, { recursive: true, force: true })
    })
  })
})
