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
import { chmodSync } from 'fs'
import { mkdir, rm, writeFile } from 'fs/promises'
import { FileSystemInteractor } from './file-system-interactor'

describe(FileSystemInteractor.name, () => {
  describe(FileSystemInteractor.getSubdirectories.name, () => {
    const TEST_FOLDER_PATH = 'src/storage/test-get-subdirectories'

    beforeEach(async () => {
      await mkdir(TEST_FOLDER_PATH)
    })

    describe('when two subdirectories and one file are present', () => {
      it('returns a list with both subdirectory names', async () => {
        await mkdir(TEST_FOLDER_PATH + '/a')
        await mkdir(TEST_FOLDER_PATH + '/b')
        await writeFile(TEST_FOLDER_PATH + '/c.txt', 'a')
        const subdirectories =
          await FileSystemInteractor.getSubdirectories(TEST_FOLDER_PATH)
        expect(subdirectories).toStrictEqual(['a', 'b'])
      })
    })

    describe('when no subdirectories and one file are present', () => {
      it('returns an empty list', async () => {
        await writeFile(TEST_FOLDER_PATH + '/a.txt', 'a')
        const subdirectories =
          await FileSystemInteractor.getSubdirectories(TEST_FOLDER_PATH)
        expect(subdirectories).toStrictEqual([])
      })
    })

    afterEach(async () => {
      await rm(TEST_FOLDER_PATH, { recursive: true, force: true })
    })
  })

  describe(FileSystemInteractor.getUnixFilePermissions.name, () => {
    const TEST_FOLDER_PATH = 'src/storage/test-get-unix-file-permissions'

    beforeAll(async () => {
      await mkdir(TEST_FOLDER_PATH)
    })

    describe('when a file has read and write permission for everybody', () => {
      it('returns the permissions', async () => {
        const filePath = TEST_FOLDER_PATH + '/a.txt'
        await writeFile(filePath, 'a')
        chmodSync(filePath, 0o666)
        const permissions =
          await FileSystemInteractor.getUnixFilePermissions(filePath)
        expect(permissions).toBe('0666')
      })
    })

    afterAll(async () => {
      await rm(TEST_FOLDER_PATH, { recursive: true, force: true })
    })
  })
})
