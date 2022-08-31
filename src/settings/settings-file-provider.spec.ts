import { mkdir, rm } from 'fs/promises'
import { SettingsFromJsonFile } from './settings'
import { SettingsFileProvider } from './settings-file-provider'

const FIXTURE_FOLDER_PATH = 'src/settings/fixtures'
const TEST_FOLDER_PATH = 'src/settings/test'

describe('SettingsFileProvider', () => {
  describe('readSettingsFile', () => {
    it('returns an empty object', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        FIXTURE_FOLDER_PATH + '/empty-settings.json',
      )
      expect(settings).toEqual({})
    })

    it('returns an object with one element', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        FIXTURE_FOLDER_PATH + '/one-element-settings.json',
      )
      expect(settings).toEqual({ a: 1 })
    })

    it('returns an object with three elements', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        FIXTURE_FOLDER_PATH + '/three-elements-settings.json',
      )
      expect(settings).toEqual({ a: 1, b: 'c', d: false })
    })

    it('returns an object with empty properties if file does not exist', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        FIXTURE_FOLDER_PATH + '/a',
      )
      const expected: SettingsFromJsonFile = {
        deviceName: '',
        siteName: '',
        timeZone: '',
      }
      expect(settings).toEqual(expected)
    })
  })

  describe('writeSettingsToFile', () => {
    const TEMPORARY_FILE_NAME = 'write-settings.json'
    const TEMPORARY_FILE_PATH = TEST_FOLDER_PATH + '/' + TEMPORARY_FILE_NAME

    beforeAll(() => {
      mkdir(TEST_FOLDER_PATH)
    })

    it('writes settings object', async () => {
      const SETTINGS = {
        deviceName: 'd',
        siteName: 's',
        timeZone: 't',
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
