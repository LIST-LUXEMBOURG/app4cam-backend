import { Test, TestingModule } from '@nestjs/testing'
import { DiskSpaceUsageDto } from './disk-space-usage.dto'
import { StorageController } from './storage.controller'
import { StorageService } from './storage.service'

const DISK_USAGE: DiskSpaceUsageDto = {
  capacityKb: 1,
  usedPercentage: 2,
}

describe(StorageController.name, () => {
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
