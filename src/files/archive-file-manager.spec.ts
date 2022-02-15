import { ArchiveFileManager } from './archive-file-manager'
import { existsSync } from 'fs'
import { writeFile, mkdir, rm } from 'fs/promises'
import AdmZip = require('adm-zip')

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'

describe('ArchiveFileCreator', () => {
  describe('sortAndConcatStrings', () => {
    it('returns correct concatenation of three strings', () => {
      expect(ArchiveFileManager.sortAndConcatStrings(['b', 'a', 'c'])).toBe(
        'abc',
      )
    })
  })

  describe('createUniqueFilename', () => {
    it('returns hash', () => {
      expect(ArchiveFileManager.createUniqueFilename(['a', 'b'])).toHaveLength(
        32,
      )
    })
  })

  describe('createArchive', () => {
    const testFolderPath = 'src/files/test-archive-file-creation'

    it('creates an archive with two files', async () => {
      await mkdir(testFolderPath)
      const filenames = ['a.txt', 'b.txt']
      const filePaths = filenames.map(
        (filename) => FIXTURE_FOLDER_PATH + '/' + filename,
      )
      const archiveFilePath = testFolderPath + '/c.zip'
      ArchiveFileManager.createArchive(archiveFilePath, filePaths)
      expect(existsSync(archiveFilePath)).toBeTruthy()
      const zip = new AdmZip(archiveFilePath)
      expect(zip.getEntries().map((entry) => entry.name)).toEqual(filenames)
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
