import { Test, TestingModule } from '@nestjs/testing'
import {
  DiskSpaceUsage,
  DiskSpaceUsageInteractor,
} from './disk-space-usage-interactor'
import { StorageService } from './storage.service'

const DISK_USAGE: DiskSpaceUsage = {
  capacityKb: 1,
  usedPercentage: '2',
}

describe('StorageService', () => {
  let service: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('gets the details', async () => {
    const spyGetDiskSpaceUsage = jest
      .spyOn(DiskSpaceUsageInteractor, 'getDiskSpaceUsage')
      .mockImplementation(() => {
        return Promise.resolve(DISK_USAGE)
      })
    const response = await service.getStorage()
    expect(response).toEqual(DISK_USAGE)
    spyGetDiskSpaceUsage.mockRestore()
  })
})
