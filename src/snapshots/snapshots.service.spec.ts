// © 2022-2024 Luxembourg Institute of Science and Technology
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FilesService } from '../files/files.service'
import { InitialisationInteractor } from '../initialisation-interactor'
import { MotionClient } from '../motion-client'
import { FileSystemInteractor } from './file-system-interactor'
import { SnapshotsService } from './snapshots.service'

const mockFileService = {
  getStreamableFile: jest.fn(),
}

describe(SnapshotsService.name, () => {
  const MOST_RECENT_FILENAME = 'a'

  let service: SnapshotsService
  let spyGetTargetDir
  let spyGetNameOfMostRecentFile
  let spyTakeSnapshot
  let spyInitializeLights

  beforeAll(() => {
    spyGetTargetDir = jest
      .spyOn(MotionClient, 'getTargetDir')
      .mockResolvedValue('')
    spyGetNameOfMostRecentFile = jest
      .spyOn(FileSystemInteractor, 'getNameOfMostRecentlyModifiedFile')
      .mockResolvedValue(MOST_RECENT_FILENAME)
    spyTakeSnapshot = jest
      .spyOn(MotionClient, 'takeSnapshot')
      .mockResolvedValue()
    spyInitializeLights = jest
      .spyOn(InitialisationInteractor, 'resetLights')
      .mockResolvedValue()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: FilesService,
          useValue: mockFileService,
        },
        SnapshotsService,
      ],
    }).compile()

    service = module.get<SnapshotsService>(SnapshotsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('takeSnapshot', () => {
    it('calls the API and retrieves the snapshot', async () => {
      await service.takeSnapshot()
      expect(spyTakeSnapshot).toHaveBeenCalled()
      expect(mockFileService.getStreamableFile).toHaveBeenCalledWith(
        MOST_RECENT_FILENAME,
      )
    })
  })

  afterAll(() => {
    spyGetTargetDir.mockRestore()
    spyGetNameOfMostRecentFile.mockRestore()
    spyTakeSnapshot.mockRestore()
    spyInitializeLights.mockRestore()
  })
})
