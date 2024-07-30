/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
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
import { existsSync } from 'fs'
import { mkdir, rm } from 'fs/promises'
import { LoggerService } from '@nestjs/common'
import { ArchiveFileManager } from './archive-file-manager'

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'

describe(ArchiveFileManager.name, () => {
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
})
