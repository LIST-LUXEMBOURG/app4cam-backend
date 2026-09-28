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
import { Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Mock, vi } from 'vitest'
import { IMotionClientService } from '../motion-client.service.interface.js'
import { MotionClientService } from '../motion-client.service.js'
import { StorageUsageDto } from './dto/storage-usage.dto.js'
import { FileSystemInteractor } from './interactors/file-system-interactor.js'
import { StorageUsageInteractor } from './interactors/storage-usage-interactor.js'
import { StorageService } from './storage.service.js'

const FILES_FOLDER_PATH = 'src/files/fixtures/'

describe(StorageService.name, () => {
  const STORAGE_USAGE: StorageUsageDto = {
    capacityKb: 1,
    usedPercentage: 2,
  }

  class MockMotionClientService implements Partial<IMotionClientService> {
    getTargetDir = () => Promise.resolve(FILES_FOLDER_PATH)
  }

  let service: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MotionClientService, useClass: MockMotionClientService },
        StorageService,
      ],
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(StorageService.prototype.getStorageStatus.name, () => {
    let spyGetSubdirectories: Mock
    let spyGetUnixFilePermissions: Mock
    let spyLoggerError: Mock

    beforeAll(() => {
      spyGetSubdirectories = vi
        .spyOn(FileSystemInteractor, 'getSubdirectories')
        .mockResolvedValue([])
      spyLoggerError = vi
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined)
    })

    describe('when the path is accessible and writable', () => {
      beforeAll(() => {
        spyGetUnixFilePermissions = vi
          .spyOn(FileSystemInteractor, 'getUnixFilePermissions')
          .mockResolvedValue('0777') // 3rd digit is relevant.
      })

      it('says so', async () => {
        const response = await service.getStorageStatus()
        expect(response).toEqual({
          isAvailable: true,
          message: `The path ${FILES_FOLDER_PATH} is accessible and writable.`,
        })
      })
    })

    describe('when the path is accessible and not writable', () => {
      beforeAll(() => {
        spyGetUnixFilePermissions = vi
          .spyOn(FileSystemInteractor, 'getUnixFilePermissions')
          .mockResolvedValue('0757') // 3rd digit is relevant.
      })

      it('says so', async () => {
        spyGetSubdirectories = vi
          .spyOn(FileSystemInteractor, 'getSubdirectories')
          .mockResolvedValue([])

        const response = await service.getStorageStatus()
        expect(response).toEqual({
          isAvailable: false,
          message: `The path ${FILES_FOLDER_PATH} is not writable for the user group.`,
        })
      })
    })

    describe('when the path access produces an unknown error', () => {
      beforeAll(() => {
        spyGetUnixFilePermissions = vi
          .spyOn(FileSystemInteractor, 'getUnixFilePermissions')
          .mockImplementation(() => {
            throw new Error('a')
          })
      })

      it('says so', async () => {
        spyGetSubdirectories = vi
          .spyOn(FileSystemInteractor, 'getSubdirectories')
          .mockResolvedValue([])

        const response = await service.getStorageStatus()
        expect(response).toEqual({
          isAvailable: false,
          message: `Accessing the path ${FILES_FOLDER_PATH} resulted in the following error: a`,
        })
      })
    })

    afterEach(() => {
      spyGetUnixFilePermissions.mockRestore()
    })

    afterAll(() => {
      spyGetSubdirectories.mockRestore()
      spyLoggerError.mockRestore()
    })
  })

  describe(StorageService.prototype.getStorageUsage.name, () => {
    it('gets the details', async () => {
      const spyGetStorageUsage = vi
        .spyOn(StorageUsageInteractor, 'getStorageUsage')
        .mockImplementation(() => {
          return Promise.resolve(STORAGE_USAGE)
        })
      const response = await service.getStorageUsage()
      expect(response).toEqual(STORAGE_USAGE)
      spyGetStorageUsage.mockRestore()
    })
  })

  describe(StorageService.prototype.isDiskSpaceUsageAboveThreshold.name, () => {
    it('returns true when above threshold', async () => {
      const spyGetStorageUsage = vi
        .spyOn(StorageUsageInteractor, 'getStorageUsage')
        .mockImplementation(() => {
          return Promise.resolve({
            capacityKb: 1,
            usedPercentage: 96,
          })
        })
      const flag = await service.isDiskSpaceUsageAboveThreshold()
      expect(flag).toBeTruthy()
      spyGetStorageUsage.mockRestore()
    })

    it('returns false when below threshold', async () => {
      const spyGetStorageUsage = vi
        .spyOn(StorageUsageInteractor, 'getStorageUsage')
        .mockImplementation(() => {
          return Promise.resolve({
            capacityKb: 1,
            usedPercentage: 94,
          })
        })
      const flag = await service.isDiskSpaceUsageAboveThreshold()
      expect(flag).toBeFalsy()
      spyGetStorageUsage.mockRestore()
    })
  })
})
