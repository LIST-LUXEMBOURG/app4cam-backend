import { unlink } from 'fs/promises'
import { SettingsFromJsonFile } from './settings'
import { SettingsFileProvider } from './settings.file.provider'

const TEST_FOLDER_PATH = 'src/settings/fixtures'

describe('SettingsFileProvider', () => {
  describe('readSettingsFile', () => {
    it('should return an empty object', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        TEST_FOLDER_PATH + '/empty-settings.json',
      )
      expect(settings).toEqual({})
    })

    it('should return an object with one element', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        TEST_FOLDER_PATH + '/one-element-settings.json',
      )
      expect(settings).toEqual({ a: 1 })
    })

    it('should return an object with three elements', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        TEST_FOLDER_PATH + '/three-elements-settings.json',
      )
      expect(settings).toEqual({ a: 1, b: 'c', d: false })
    })

    it('should return an object with empty properties if file does not exist', async () => {
      const settings = await SettingsFileProvider.readSettingsFile(
        TEST_FOLDER_PATH + '/a',
      )
      const expected: SettingsFromJsonFile = {
        deviceId: '',
        siteName: '',
      }
      expect(settings).toEqual(expected)
    })
  })

  describe('writeSettingsToFile', () => {
    const TEMPORARY_FILE_NAME = 'write-settings.json'
    const TEMPORARY_FILE_PATH = TEST_FOLDER_PATH + '/' + TEMPORARY_FILE_NAME

    it('should write settings object', async () => {
      const SETTINGS = {
        deviceId: 'd',
        siteName: 's',
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

    afterEach(async () => {
      await unlink(TEMPORARY_FILE_PATH)
    })
  })
})
