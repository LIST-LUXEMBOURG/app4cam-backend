// © 2022-2024 Luxembourg Institute of Science and Technology
import { Test, TestingModule } from '@nestjs/testing'
import { StorageStatusDto } from './dto/storage-status.dto'
import { StorageUsageDto } from './dto/storage-usage.dto'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'

describe(StorageController.name, () => {
  const STORAGE_STATUS: StorageStatusDto = {
    isAvailable: true,
    message: 'a',
  }

  const STORAGE_USAGE: StorageUsageDto = {
    capacityKb: 1,
    usedPercentage: 2,
  }

  let controller: StorageController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: {
            getStorageStatus: jest.fn().mockResolvedValue(STORAGE_STATUS),
            getStorageUsage: jest.fn().mockReturnValue(STORAGE_USAGE),
          },
        },
      ],
    }).compile()

    controller = module.get<StorageController>(StorageController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getStorage', () => {
    it('gets the details', async () => {
      const response = await controller.getStorage()
      expect(response).toEqual({
        status: STORAGE_STATUS,
        usage: STORAGE_USAGE,
      })
    })
  })

  describe('getStorageStatus', () => {
    it('gets the details', async () => {
      const response = await controller.getStorageStatus()
      expect(response).toEqual(STORAGE_STATUS)
    })
  })

  describe('getStorageUsage', () => {
    it('gets the details', async () => {
      const response = await controller.getStorageUsage()
      expect(response).toEqual(STORAGE_USAGE)
    })
  })
})
