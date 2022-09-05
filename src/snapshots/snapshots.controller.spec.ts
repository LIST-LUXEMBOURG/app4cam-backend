import { PassThrough } from 'stream'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FilesService } from '../files/files.service'
import { SettingsService } from '../settings/settings.service'
import { SnapshotsController } from './snapshots.controller'
import { SnapshotsService } from './snapshots.service'

describe(SnapshotsController.name, () => {
  const mockSnapshotContentType = 'a'
  let controller: SnapshotsController
  let service: SnapshotsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnapshotsController],
      providers: [
        ConfigService,
        FilesService,
        SettingsService,
        {
          provide: SnapshotsService,
          useValue: {
            takeSnapshot: jest.fn(() => ({
              contentType: mockSnapshotContentType,
              stream: new PassThrough(),
            })),
          },
        },
      ],
    }).compile()

    controller = module.get<SnapshotsController>(SnapshotsController)
    service = module.get<SnapshotsService>(SnapshotsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('takeSnapshot', () => {
    it('asks for taking a snapshot and sets the response', async () => {
      const mockResponse = {
        set: jest.fn(),
      }
      await controller.takeSnapshot(mockResponse)
      expect(service.takeSnapshot).toHaveBeenCalledWith()
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': mockSnapshotContentType,
        'Content-Disposition': 'attachment; filename="latest_snapshot.jpg"',
      })
    })
  })
})
