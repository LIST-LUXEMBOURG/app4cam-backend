import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
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
          },
        },
      ],
    }).compile()

    controller = module.get<FilesController>(FilesController)
    service = module.get<FilesService>(FilesService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should ask for all files', () => {
    controller.findAll()
    expect(service.findAll).toHaveBeenCalled()
  })
})
