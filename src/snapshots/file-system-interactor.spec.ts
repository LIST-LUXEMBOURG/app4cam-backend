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
import { mkdir, rm, writeFile } from 'fs/promises'
import { FileSystemInteractor } from './file-system-interactor'

describe(FileSystemInteractor.name, () => {
  describe(FileSystemInteractor.getNameOfMostRecentlyModifiedFile.name, () => {
    const TEST_FOLDER_PATH =
      'src/snapshots/test-' +
      FileSystemInteractor.getNameOfMostRecentlyModifiedFile.name

    beforeAll(async () => {
      await mkdir(TEST_FOLDER_PATH)
    })

    describe('when three files are created in sequence', () => {
      it('returns the most recently created filename', async () => {
        await writeFile(TEST_FOLDER_PATH + '/a.txt', 'a')
        await new Promise((r) => setTimeout(r, 10))
        await writeFile(TEST_FOLDER_PATH + '/c.txt', 'c')
        await new Promise((r) => setTimeout(r, 10))
        await writeFile(TEST_FOLDER_PATH + '/b.txt', 'b')
        const filename =
          await FileSystemInteractor.getNameOfMostRecentlyModifiedFile(
            TEST_FOLDER_PATH,
          )
        expect(filename).toBe('b.txt')
      })
    })

    afterAll(async () => {
      await rm(TEST_FOLDER_PATH, { recursive: true, force: true })
    })
  })
})
