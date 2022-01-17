import { Test, TestingModule } from '@nestjs/testing'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

describe('SettingsController', () => {
  const SETTINGS = {
    deviceId: 'd',
    siteName: 's',
  }
  let controller: SettingsController
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getAllSettings: jest.fn().mockReturnValue(SETTINGS),
            updateSettings: jest.fn(),
            getSiteName: jest.fn().mockReturnValue(SETTINGS.siteName),
            setSiteName: jest.fn(),
            getDeviceId: jest.fn().mockReturnValue(SETTINGS.deviceId),
            setDeviceId: jest.fn(),
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

  it('should get all settings', async () => {
    const response = await controller.getAllSettings()
    expect(response).toEqual(SETTINGS)
  })

  it('should set settings', async () => {
    const settings = { deviceId: 'd', siteName: 's' }
    await controller.updateSettings(settings)
    expect(service.updateSettings).toHaveBeenCalledWith(settings)
  })

  it('should get the site name', async () => {
    const response = await controller.getSiteName()
    expect(response).toEqual({ siteName: 's' })
  })

  it('should set the site name', async () => {
    await controller.setSiteName({ siteName: 'b' })
    expect(service.setSiteName).toHaveBeenCalledWith('b')
  })

  it('should get the device ID', async () => {
    const response = await controller.getDeviceId()
    expect(response).toEqual({ deviceId: 'd' })
  })

  it('should set the device ID', async () => {
    await controller.setDeviceId({ deviceId: 'c' })
    expect(service.setDeviceId).toHaveBeenCalledWith('c')
  })
})
