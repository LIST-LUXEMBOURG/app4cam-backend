import { Test, TestingModule } from '@nestjs/testing'
import { Settings } from './settings'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

describe('SettingsController', () => {
  const SETTINGS: Settings = {
    deviceId: 'd',
    siteName: 's',
    systemTime: '2022-01-18T14:48:37+01:00',
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
            getSystemTime: jest.fn().mockReturnValue(SETTINGS.systemTime),
            setSystemTime: jest.fn(),
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
    expect(response).toEqual({ siteName: SETTINGS.siteName })
  })

  it('should set the site name', async () => {
    await controller.setSiteName({ siteName: 'b' })
    expect(service.setSiteName).toHaveBeenCalledWith('b')
  })

  it('should get the device ID', async () => {
    const response = await controller.getDeviceId()
    expect(response).toEqual({ deviceId: SETTINGS.deviceId })
  })

  it('should set the device ID', async () => {
    await controller.setDeviceId({ deviceId: 'c' })
    expect(service.setDeviceId).toHaveBeenCalledWith('c')
  })

  it('should get the system time', async () => {
    const response = await controller.getSystemTime()
    expect(response).toEqual({ systemTime: SETTINGS.systemTime })
  })

  it('should set the system time', async () => {
    await controller.setSystemTime({ systemTime: 'd' })
    expect(service.setSystemTime).toHaveBeenCalledWith('d')
  })
})
