/**
 * Copyright (C) 2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import {
  access,
  constants,
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'fs/promises'
import path = require('path')
import { FileSystemInteractor } from './file-system-interactor'

describe(FileSystemInteractor.name, () => {
  const FIXTURES_FOLDER = 'src/upgrades/fixtures'
  const TEST_FOLDER = 'src/upgrades/test-file-handler'

  const itIfNotWindows = () => (process.platform !== 'win32' ? it : it.skip)

  beforeEach(async () => {
    await mkdir(TEST_FOLDER)
  })

  describe('checkWhetherFileExists', () => {
    describe('when the file does not exist', () => {
      it('throws an exception', async () => {
        const filename = 'a.txt'
        const filePath = path.join(TEST_FOLDER, filename)
        await expect(
          FileSystemInteractor.checkWhetherFileExists(filePath),
        ).rejects.toThrow()
      })
    })

    describe('when the file exists', () => {
      it('does not throw an exception', async () => {
        const filename = 'a.txt'
        const originalFilePath = path.join(FIXTURES_FOLDER, filename)
        const destinationFilePath = path.join(TEST_FOLDER, filename)
        await cp(originalFilePath, destinationFilePath)
        await expect(
          FileSystemInteractor.checkWhetherFileExists(destinationFilePath),
        ).resolves.not.toThrow()
      })
    })
  })

  describe('checkWhetherFileIsReadable', () => {
    describe('when the file is not readable', () => {
      it('throws an exception', async () => {
        const filename = 'a.txt'
        const filePath = path.join(TEST_FOLDER, filename)
        await expect(
          FileSystemInteractor.checkWhetherFileExists(filePath),
        ).rejects.toThrow()
      })
    })

    describe('when the file is readable', () => {
      it('does not throw an exception', async () => {
        const filename = 'a.txt'
        const originalFilePath = path.join(FIXTURES_FOLDER, filename)
        const destinationFilePath = path.join(TEST_FOLDER, filename)
        await cp(originalFilePath, destinationFilePath)
        await expect(
          FileSystemInteractor.checkWhetherFileIsReadable(destinationFilePath),
        ).resolves.not.toThrow()
      })
    })
  })

  describe('emptyFolder', () => {
    describe('when the folder contains one text file', () => {
      it('deletes it', async () => {
        const filename = 'a.txt'
        const originalFilePath = path.join(FIXTURES_FOLDER, filename)
        const destinationFilePath = path.join(TEST_FOLDER, filename)
        await cp(originalFilePath, destinationFilePath)
        await FileSystemInteractor.emptyFolder(TEST_FOLDER)
        const filenames = await readdir(TEST_FOLDER)
        expect(filenames).toHaveLength(0)
      })
    })

    describe('when the folder contains one folder', () => {
      it('deletes it', async () => {
        const folderPath = path.join(TEST_FOLDER, 'a')
        await mkdir(folderPath)
        await FileSystemInteractor.emptyFolder(TEST_FOLDER)
        const filenames = await readdir(TEST_FOLDER)
        expect(filenames).toHaveLength(0)
      })
    })

    describe('when the folder contains a .gitkeep file', () => {
      it('does not delete this file', async () => {
        const nameOfFileToKeep = '.gitkeep'
        const originalFilePath = path.join(FIXTURES_FOLDER, 'a.txt')
        const destinationFilePath = path.join(TEST_FOLDER, nameOfFileToKeep)
        await cp(originalFilePath, destinationFilePath)
        await FileSystemInteractor.emptyFolder(TEST_FOLDER)
        const filenames = await readdir(TEST_FOLDER)
        expect(filenames).toHaveLength(1)
        expect(filenames[0]).toBe(nameOfFileToKeep)
      })
    })
  })

  describe('extractZipArchive', () => {
    describe('when an archive is given', () => {
      itIfNotWindows()('unpacks it', async () => {
        const archiveFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-text-file.zip',
        )
        await FileSystemInteractor.extractZipArchive(
          archiveFilePath,
          TEST_FOLDER,
        )
        const filenames = await readdir(TEST_FOLDER)
        expect(filenames).toContain('a.txt')
      })
    })
  })

  describe('deleteFile', () => {
    describe('when a file exists', () => {
      it('deletes this file', async () => {
        const filePath = path.join(TEST_FOLDER, 'a')
        await writeFile(filePath, 'aa')
        const folderContentsBefore = await readdir(TEST_FOLDER)
        expect(folderContentsBefore).toHaveLength(1)
        await FileSystemInteractor.deleteFile(filePath)
        const folderContentsAfter = await readdir(TEST_FOLDER)
        expect(folderContentsAfter).toHaveLength(0)
      })
    })
  })

  describe('verifyChecksums', () => {
    describe('when the checksums are invalid', () => {
      itIfNotWindows()('throws an exception', async () => {
        const destinationChecksumsFilename = 'checksums.sha256'
        const originalChecksumsFilePath = path.join(
          FIXTURES_FOLDER,
          'checksums-invalid.sha256',
        )
        const destinationChecksumsFilePath = path.join(
          TEST_FOLDER,
          destinationChecksumsFilename,
        )
        await cp(originalChecksumsFilePath, destinationChecksumsFilePath)
        const scriptFilename = 'upgrade.sh'
        const originalScriptFilePath = path.join(
          FIXTURES_FOLDER,
          scriptFilename,
        )
        const destinationScriptFilePath = path.join(TEST_FOLDER, scriptFilename)
        await cp(originalScriptFilePath, destinationScriptFilePath)
        await expect(
          FileSystemInteractor.verifyChecksums(
            destinationChecksumsFilename,
            TEST_FOLDER,
          ),
        ).rejects.toThrow()
      })
    })

    describe('when the checksums are valid', () => {
      itIfNotWindows()('does not throw an exception', async () => {
        const checksumsFilename = 'checksums.sha256'
        const originalChecksumsFilePath = path.join(
          FIXTURES_FOLDER,
          checksumsFilename,
        )
        const destinationChecksumsFilePath = path.join(
          TEST_FOLDER,
          checksumsFilename,
        )
        await cp(originalChecksumsFilePath, destinationChecksumsFilePath)
        const scriptFilename = 'upgrade.sh'
        const originalScriptFilePath = path.join(
          FIXTURES_FOLDER,
          scriptFilename,
        )
        const destinationScriptFilePath = path.join(TEST_FOLDER, scriptFilename)
        await cp(originalScriptFilePath, destinationScriptFilePath)
        await expect(
          FileSystemInteractor.verifyChecksums(checksumsFilename, TEST_FOLDER),
        ).resolves.not.toThrow()
      })
    })
  })

  describe('writeFile', () => {
    describe('when a file is written', () => {
      it('create a file with the given name and content', async () => {
        const filePath = path.join(TEST_FOLDER, 'a')
        const originalFileContent = 'aa'
        await FileSystemInteractor.writeFile(filePath, originalFileContent)
        await expect(access(filePath, constants.F_OK)).resolves.not.toThrow()
        const loadedFileContent = await readFile(filePath, 'utf8')
        expect(loadedFileContent).toBe(originalFileContent)
      })
    })
  })

  afterEach(async () => {
    await rm(TEST_FOLDER, { recursive: true, force: true })
  })
})
