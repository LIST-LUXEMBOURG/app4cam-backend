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
import { cp, mkdir, readdir, rm } from 'fs/promises'
import path = require('path')
import { Test, TestingModule } from '@nestjs/testing'
import { MotionClient } from '../motion-client'
import { UpgradesService } from './upgrades.service'

describe(UpgradesService.name, () => {
  const DATA_FOLDER = 'src/upgrades/test-upgrade-service-data'
  const EXTRACTION_FOLDER = 'temp/upgrade'
  const FIXTURES_FOLDER = 'src/upgrades/fixtures'

  const itIfNotWindows = () => (process.platform !== 'win32' ? it : it.skip)

  let service: UpgradesService
  let spyGetTargetDir

  beforeAll(async () => {
    spyGetTargetDir = jest
      .spyOn(MotionClient, 'getTargetDir')
      .mockImplementation(() => {
        return Promise.resolve(DATA_FOLDER)
      })
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpgradesService],
    }).compile()

    service = module.get<UpgradesService>(UpgradesService)
  })

  beforeEach(async () => {
    await mkdir(DATA_FOLDER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getUpgradeFileCheckResult', () => {
    describe('when the upgrade archive does not exist', () => {
      it('returns an error message', async () => {
        const result = await service.verifyUpgradeFile()
        expect(result).toEqual({
          isOkay: false,
          message: 'The upgrade archive does not exist.',
        })
      })

      it('empties the temporary folder', async () => {
        await service.verifyUpgradeFile()
        const folderContents = await readdir(EXTRACTION_FOLDER)
        expect(
          folderContents.filter((name) => name !== '.gitkeep'),
        ).toHaveLength(0)
      })
    })

    describe('when the upgrade archive cannot be extracted', () => {
      itIfNotWindows()('returns an error message', async () => {
        const originalFilePath = path.join(FIXTURES_FOLDER, 'a.txt')
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        const result = await service.verifyUpgradeFile() // not supported by Windows
        expect(result).toEqual({
          isOkay: false,
          message: 'The upgrade archive could not be extracted.',
        })
      })

      itIfNotWindows()('empties the temporary folder', async () => {
        const originalFilePath = path.join(FIXTURES_FOLDER, 'a.txt')
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        await service.verifyUpgradeFile() // not supported by Windows
        const folderContents = await readdir(EXTRACTION_FOLDER)
        expect(
          folderContents.filter((name) => name !== '.gitkeep'),
        ).toHaveLength(0)
      })
    })

    describe('when the upgrade script does not exist', () => {
      itIfNotWindows()('returns an error message', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-text-file.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        const result = await service.verifyUpgradeFile() // not supported by Windows
        expect(result).toEqual({
          isOkay: false,
          message: 'The upgrade script does not exist.',
        })
      })

      itIfNotWindows()('empties the temporary folder', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-text-file.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        await service.verifyUpgradeFile() // not supported by Windows
        const folderContents = await readdir(EXTRACTION_FOLDER)
        expect(
          folderContents.filter((name) => name !== '.gitkeep'),
        ).toHaveLength(0)
      })
    })

    describe('when the checksum file does not exist', () => {
      itIfNotWindows()('returns an error message', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-script.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        const result = await service.verifyUpgradeFile() // not supported by Windows
        expect(result).toEqual({
          isOkay: false,
          message: 'The checksum file does not exist.',
        })
      })

      itIfNotWindows()('empties the temporary folder', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-script.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        await service.verifyUpgradeFile() // not supported by Windows
        const folderContents = await readdir(EXTRACTION_FOLDER)
        expect(
          folderContents.filter((name) => name !== '.gitkeep'),
        ).toHaveLength(0)
      })
    })

    describe('when not all checksums are valid', () => {
      itIfNotWindows()('returns an error message', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-script-and-invalid-checksums.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        const result = await service.verifyUpgradeFile() // not supported by Windows
        expect(result).toEqual({
          isOkay: false,
          message: 'Not all checksums are valid.',
        })
      })

      itIfNotWindows()('empties the temporary folder', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-script-and-invalid-checksums.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        await service.verifyUpgradeFile() // not supported by Windows
        const folderContents = await readdir(EXTRACTION_FOLDER)
        expect(
          folderContents.filter((name) => name !== '.gitkeep'),
        ).toHaveLength(0)
      })
    })

    describe('when everything is fine', () => {
      itIfNotWindows()('return a success message', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-script-and-valid-checksums.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        const result = await service.verifyUpgradeFile() // not supported by Windows
        expect(result).toEqual({
          isOkay: true,
          message: '',
        })
      })

      itIfNotWindows()('empties the temporary folder', async () => {
        const originalFilePath = path.join(
          FIXTURES_FOLDER,
          'archive-with-script-and-valid-checksums.zip',
        )
        const archiveFilePath = path.join(DATA_FOLDER, 'App4Cam-upgrade.zip')
        await cp(originalFilePath, archiveFilePath)
        await service.verifyUpgradeFile() // not supported by Windows
        const folderContents = await readdir(EXTRACTION_FOLDER)
        expect(
          folderContents.filter((name) => name !== '.gitkeep'),
        ).toHaveLength(0)
      })
    })
  })

  afterEach(async () => {
    await rm(DATA_FOLDER, { recursive: true, force: true })
  })

  afterAll(async () => {
    spyGetTargetDir.mockRestore()
  })
})
