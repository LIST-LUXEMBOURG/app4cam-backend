import { Test, TestingModule } from '@nestjs/testing'
import { StorageUsageDto } from './dto/storage-usage.dto'
import { FileSystemInteractor } from './file-system-interactor'
import { StorageUsageInteractor } from './storage-usage-interactor'
import { StorageService } from './storage.service'

const FILES_FOLDER_PATH = 'src/files/fixtures/'

jest.mock('../motion-client', () => ({
  MotionClient: {
    getTargetDir: () => FILES_FOLDER_PATH,
  },
}))

describe(StorageService.name, () => {
  const STORAGE_USAGE: StorageUsageDto = {
    capacityKb: 1,
    usedPercentage: 2,
  }

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

  describe('getStorageStatus', () => {
    let spyGetSubdirectories
    let spyGetUnixFilePermissions

    beforeAll(() => {
      spyGetSubdirectories = jest
        .spyOn(FileSystemInteractor, 'getSubdirectories')
        .mockResolvedValue([])
    })

    describe('when the path is accessible and writable', () => {
      beforeAll(() => {
        spyGetUnixFilePermissions = jest
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
        spyGetUnixFilePermissions = jest
          .spyOn(FileSystemInteractor, 'getUnixFilePermissions')
          .mockResolvedValue('0757') // 3rd digit is relevant.
      })

      it('says so', async () => {
        spyGetSubdirectories = jest
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
        spyGetUnixFilePermissions = jest
          .spyOn(FileSystemInteractor, 'getUnixFilePermissions')
          .mockImplementation(() => {
            throw new Error('a')
          })
      })

      it('says so', async () => {
        spyGetSubdirectories = jest
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
    })
  })

  describe('getStorageUsage', () => {
    it('gets the details', async () => {
      const spyGetStorageUsage = jest
        .spyOn(StorageUsageInteractor, 'getStorageUsage')
        .mockImplementation(() => {
          return Promise.resolve(STORAGE_USAGE)
        })
      const response = await service.getStorageUsage()
      expect(response).toEqual(STORAGE_USAGE)
      spyGetStorageUsage.mockRestore()
    })
  })
})
