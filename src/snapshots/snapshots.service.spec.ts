import { Test, TestingModule } from '@nestjs/testing'
import { MotionClient } from '../motion-client'
import { FilesService } from '../files/files.service'
import { SnapshotsService } from './snapshots.service'

const mockFileService = {
  getStreamableFile: jest.fn(),
}

describe(SnapshotsService.name, () => {
  let service: SnapshotsService
  let spyTakeSnapshot

  beforeAll(() => {
    spyTakeSnapshot = jest
      .spyOn(MotionClient, 'takeSnapshot')
      .mockImplementation(() => {
        return Promise.resolve()
      })
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
        'lastsnap.jpg',
      )
    })
  })

  afterAll(() => {
    spyTakeSnapshot.mockRestore()
  })
})
