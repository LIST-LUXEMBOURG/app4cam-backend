/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
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
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Mock, vi } from 'vitest'
import { FilesService } from '../files/files.service'
import { IFilesService } from '../files/files.service.interface'
import { InitialisationInteractor } from '../initialisation-interactor'
import { MotionClientService } from '../motion-client.service'
import { IMotionClientService } from '../motion-client.service.interface'
import { FileSystemInteractor } from './file-system-interactor'
import { SnapshotsService } from './snapshots.service'

describe(SnapshotsService.name, () => {
  const MOST_RECENT_FILENAME = 'a'

  const spyGetStreamableFile = vi.fn()
  const spyTakeSnapshot = vi.fn()

  class MockFilesService implements Partial<IFilesService> {
    getStreamableFile = spyGetStreamableFile
  }
  class MockMotionClientService implements Partial<IMotionClientService> {
    getTargetDir = async () => ''
    takeSnapshot = spyTakeSnapshot
  }

  let service: SnapshotsService
  let spyGetNameOfMostRecentFile: Mock
  let spyInitializeLights: Mock

  beforeAll(() => {
    spyGetNameOfMostRecentFile = vi
      .spyOn(FileSystemInteractor, 'getNameOfMostRecentlyModifiedFile')
      .mockResolvedValue(MOST_RECENT_FILENAME)
    spyInitializeLights = vi
      .spyOn(InitialisationInteractor, 'resetLights')
      .mockResolvedValue()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: FilesService, useClass: MockFilesService },
        { provide: MotionClientService, useClass: MockMotionClientService },
        SnapshotsService,
      ],
    }).compile()

    service = module.get<SnapshotsService>(SnapshotsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(SnapshotsService.prototype.takeSnapshot.name, () => {
    it('calls the API and retrieves the snapshot', async () => {
      await service.takeSnapshot()
      expect(spyTakeSnapshot).toHaveBeenCalled()
      expect(spyGetStreamableFile).toHaveBeenCalledWith(MOST_RECENT_FILENAME)
    })
  })

  afterAll(() => {
    spyGetNameOfMostRecentFile.mockRestore()
    spyTakeSnapshot.mockRestore()
    spyInitializeLights.mockRestore()
  })
})
