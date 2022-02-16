import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { SettingsService } from '../settings/settings.service'
import { PassThrough } from 'stream'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

describe('FilesController', () => {
  let controller: FilesController
  let service: FilesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        ConfigService,
        {
          provide: FilesService,
          useValue: {
            findAll: jest.fn(),
            getStreamableFile: jest.fn(() => ({
              contentType: 'c',
              stream: new PassThrough(),
            })),
            getStreamableFiles: jest.fn(() => ({
              contentType: 'c',
              filename: 'f',
              stream: new PassThrough(),
            })),
          },
        },
        SettingsService,
      ],
    }).compile()

    controller = module.get<FilesController>(FilesController)
    service = module.get<FilesService>(FilesService)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('asks for all files', () => {
      controller.findAll()
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('downloadFile', () => {
    it('asks for the streamable file and sets the response', () => {
      const filename = 'a'
      const mockResponse = {
        set: jest.fn(),
      }
      controller.downloadFile(filename, mockResponse)
      expect(service.getStreamableFile).toHaveBeenCalledWith(filename)
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })

  describe('downloadFiles', () => {
    it('asks for the streamable file and sets the response', async () => {
      const filenames = ['a']
      const mockResponse = {
        set: jest.fn(),
      }
      await controller.downloadFiles({ filenames: filenames }, mockResponse)
      expect(service.getStreamableFiles).toHaveBeenCalledWith(filenames)
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })
})
