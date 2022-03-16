import { Test, TestingModule } from '@nestjs/testing'
import { DiskSpaceUsage } from './disk-space-usage-interactor'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'

const DISK_USAGE: DiskSpaceUsage = {
  capacityKb: 1,
  usedPercentage: '2',
}

describe('StorageController', () => {
  let controller: StorageController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: {
            getStorage: jest.fn().mockReturnValue(DISK_USAGE),
          },
        },
      ],
    }).compile()

    controller = module.get<StorageController>(StorageController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('gets the details', async () => {
    const response = await controller.getStorage()
    expect(response).toEqual(DISK_USAGE)
  })
})
