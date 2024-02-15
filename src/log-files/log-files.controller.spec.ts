// © 2023-2024 Luxembourg Institute of Science and Technology
import { PassThrough } from 'stream'
import { Test, TestingModule } from '@nestjs/testing'
import { LogFilesController } from './log-files.controller'
import { LogFilesService } from './log-files.service'

describe(LogFilesController.name, () => {
  let controller: LogFilesController
  let service: LogFilesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogFilesController],
      providers: [
        {
          provide: LogFilesService,
          useValue: {
            getAppLogFileStream: jest.fn(() => new PassThrough()),
            getMotionLogFileStream: jest.fn(() => new PassThrough()),
          },
        },
      ],
    }).compile()

    controller = module.get<LogFilesController>(LogFilesController)
    service = module.get<LogFilesService>(LogFilesService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('downloadAppLogFile', () => {
    it('asks for the streamable file and sets the response', async () => {
      const mockResponse = {
        set: jest.fn(),
      }
      await controller.downloadAppLogFile(mockResponse)
      expect(service.getAppLogFileStream).toHaveBeenCalled()
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })

  describe('downloadMotionLogFile', () => {
    it('asks for the streamable file and sets the response', async () => {
      const mockResponse = {
        set: jest.fn(),
      }
      await controller.downloadMotionLogFile(mockResponse)
      expect(service.getMotionLogFileStream).toHaveBeenCalled()
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })
})
