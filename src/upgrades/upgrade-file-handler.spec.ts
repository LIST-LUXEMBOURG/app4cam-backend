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
import { mkdir, readdir, readFile, rm } from 'fs/promises'
import path = require('path')
import { FileSystemInteractor } from './interactors/file-system-interactor'
import { UpgradeFileFlagHandler } from './upgrade-file-handler'

describe(FileSystemInteractor.name, () => {
  const TEST_FOLDER = 'src/upgrades/test-upgrade-file-handler'

  beforeEach(async () => {
    await mkdir(TEST_FOLDER)
  })

  describe('when the flag is set', () => {
    it('creates a file with the expected name and content', async () => {
      const flagHandler = new UpgradeFileFlagHandler(TEST_FOLDER)
      await flagHandler.setFlag()
      const folderContents = await readdir(TEST_FOLDER)
      const filename = 'upgrading'
      expect(folderContents[0]).toBe(filename)
      const fileContent = await readFile(
        path.join(TEST_FOLDER, filename),
        'utf8',
      )
      expect(fileContent).toBe('true')
    })

    it('returns true on the check', async () => {
      const flagHandler = new UpgradeFileFlagHandler(TEST_FOLDER)
      await flagHandler.setFlag()
      const result = await flagHandler.isFlagSet()
      expect(result).toBeTruthy()
    })
  })

  afterEach(async () => {
    await rm(TEST_FOLDER, { recursive: true, force: true })
  })
})
