import { Test, TestingModule } from '@nestjs/testing'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

describe('SettingsController', () => {
  let controller: SettingsController
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getSiteName: jest.fn().mockReturnValue('a'),
            setSiteName: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<SettingsController>(SettingsController)
    service = module.get<SettingsService>(SettingsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should get the site name', async () => {
    const response = await controller.getSiteName()
    expect(response).toEqual({ siteName: 'a' })
  })

  it('should set the site name', async () => {
    await controller.setSiteName({ siteName: 'b' })
    expect(service.setSiteName).toHaveBeenCalledWith('b')
  })
})
