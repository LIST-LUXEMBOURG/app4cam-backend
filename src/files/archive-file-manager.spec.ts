import { existsSync } from 'fs'
import { writeFile, mkdir, rm } from 'fs/promises'
import { LoggerService } from '@nestjs/common'
import { ArchiveFileManager } from './archive-file-manager'

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'
const SYSTEM_TIME_ISO = '2022-01-18T13:48:37.000Z'
const SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS = '20220118T134837000Z'

describe('ArchiveFileCreator', () => {
  describe('stripHyphensColonsDots', () => {
    it('removes all characters', async () => {
      expect(ArchiveFileManager.stripHyphensColonsDots(SYSTEM_TIME_ISO)).toBe(
        SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS,
      )
    })
  })

  describe('createArchiveFilename', () => {
    it('returns hash', () => {
      const dateTime = new Date(SYSTEM_TIME_ISO)
      expect(ArchiveFileManager.createArchiveFilename(dateTime, 'd', 's')).toBe(
        's_d_' + SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS + '.zip',
      )
    })
  })

  describe('createArchive', () => {
    const testFolderPath = 'src/files/test-archive-file-creation'

    class MockupLogger implements LoggerService {
      error() {
        // Do nothing.
      }
      log() {
        // Do nothing.
      }
      warn() {
        // Do nothing.
      }
    }

    it('creates an archive with two files', async () => {
      await mkdir(testFolderPath)
      const filenames = ['a.txt', 'b.txt']
      const filePaths = filenames.map(
        (filename) => FIXTURE_FOLDER_PATH + '/' + filename,
      )
      const archiveFilePath = testFolderPath + '/c.zip'
      const logger = new MockupLogger()
      await ArchiveFileManager.createArchive(archiveFilePath, filePaths, logger)
      expect(existsSync(archiveFilePath)).toBeTruthy()
      await rm(testFolderPath, { recursive: true, force: true })
    })
  })

  describe('removeOldFiles', () => {
    const testFolderPath = 'src/files/test-archive-file-deletion'

    beforeAll(async () => {
      await mkdir(testFolderPath)
    })

    it('deletes an old archive', async () => {
      const testFilePath = testFolderPath + '/a.txt'
      await writeFile(testFilePath, 'aa')
      await new Promise((r) => setTimeout(r, 100))
      await ArchiveFileManager.removeOldFiles(testFolderPath, 50)
      expect(existsSync(testFilePath)).toBeFalsy()
    })

    it('ignores a young archive', async () => {
      const testFilePath = testFolderPath + '/b.txt'
      await writeFile(testFilePath, 'bb')
      await new Promise((r) => setTimeout(r, 100))
      await ArchiveFileManager.removeOldFiles(testFolderPath, 200)
      expect(existsSync(testFilePath)).toBeTruthy()
    })

    afterAll(async () => {
      await rm(testFolderPath, { recursive: true, force: true })
    })
  })

  describe('isUnixHiddenPath', () => {
    it('returns true on hidden file', () => {
      expect(ArchiveFileManager.isUnixHiddenPath('.a')).toBeTruthy()
    })

    it('returns false on non-hidden file', () => {
      expect(ArchiveFileManager.isUnixHiddenPath('a')).toBeFalsy()
    })
  })
})
