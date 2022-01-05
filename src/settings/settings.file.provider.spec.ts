import { unlink } from 'fs/promises'
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

    it('should throw an exception if file does not exist', () => {
      expect(
        SettingsFileProvider.readSettingsFile(TEST_FOLDER_PATH + '/a'),
      ).rejects.toThrow()
    })
  })

  describe('writeSettingsToFile', () => {
    const TEMPORARY_FILE_NAME = 'write-settings.json'
    const TEMPORARY_FILE_PATH = TEST_FOLDER_PATH + '/' + TEMPORARY_FILE_NAME

    it('should write settings object', async () => {
      await SettingsFileProvider.writeSettingsToFile(
        { siteName: 'a' },
        TEMPORARY_FILE_PATH,
      )
      const settings = await SettingsFileProvider.readSettingsFile(
        TEMPORARY_FILE_PATH,
      )
      expect(settings).toEqual({ siteName: 'a' })
    })

    afterEach(async () => {
      await unlink(TEMPORARY_FILE_PATH)
    })
  })
})
