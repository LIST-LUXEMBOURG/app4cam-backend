import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Settings } from './settings'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

describe('SettingsController', () => {
  const AVAILABLE_TIMEZONES = ['a', 'b']
  const SETTINGS: Settings = {
    camera: {
      pictureQuality: 90,
      shotTypes: ['pictures', 'videos'],
      videoQuality: 60,
    },
    general: {
      deviceName: 'd',
      siteName: 's',
      systemTime: '2022-01-18T14:48:37+01:00',
      timeZone: 't',
    },
    triggering: {
      sensitivity: 1,
    },
  }
  let controller: SettingsController
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        ConfigService,
        {
          provide: SettingsService,
          useValue: {
            getAllSettings: jest.fn().mockReturnValue(SETTINGS),
            updateSettings: jest.fn(),
            updateAllSettings: jest.fn(),
            getSiteName: jest.fn().mockReturnValue(SETTINGS.general.siteName),
            setSiteName: jest.fn(),
            getDeviceName: jest
              .fn()
              .mockReturnValue(SETTINGS.general.deviceName),
            setDeviceName: jest.fn(),
            getSystemTime: jest
              .fn()
              .mockReturnValue(SETTINGS.general.systemTime),
            setSystemTime: jest.fn(),
            getAvailableTimeZones: jest
              .fn()
              .mockReturnValue(AVAILABLE_TIMEZONES),
            getTimeZone: jest.fn().mockReturnValue(SETTINGS.general.timeZone),
            setTimeZone: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<SettingsController>(SettingsController)
    service = module.get<SettingsService>(SettingsService)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
  })

  it('gets all settings', async () => {
    const response = await controller.getAllSettings()
    expect(response).toEqual(SETTINGS)
  })

  it('sets settings', async () => {
    const settings = { general: { deviceName: 'd', siteName: 's' } }
    await controller.updateSettings(settings)
    expect(service.updateSettings).toHaveBeenCalledWith(settings)
  })

  it('sets all settings', async () => {
    const settings = {
      camera: {
        pictureQuality: 40,
        shotTypes: ['pictures' as const, 'videos' as const],
        videoQuality: 40,
      },
      general: {
        deviceName: 'd',
        siteName: 's',
        systemTime: new Date().toISOString(),
        timeZone: 't',
      },
      triggering: {
        sensitivity: 1,
      },
    }
    await controller.updateAllSettings(settings)
    expect(service.updateAllSettings).toHaveBeenCalledWith(settings)
  })

  it('gets the site name', async () => {
    const response = await controller.getSiteName()
    expect(response).toEqual({ siteName: SETTINGS.general.siteName })
  })

  it('sets the site name', async () => {
    await controller.setSiteName({ siteName: 'b' })
    expect(service.setSiteName).toHaveBeenCalledWith('b')
  })

  it('gets the device name', async () => {
    const response = await controller.getDeviceName()
    expect(response).toEqual({ deviceName: SETTINGS.general.deviceName })
  })

  it('sets the device name', async () => {
    await controller.setDeviceName({ deviceName: 'c' })
    expect(service.setDeviceName).toHaveBeenCalledWith('c')
  })

  it('gets the system time', async () => {
    const response = await controller.getSystemTime()
    expect(response).toEqual({ systemTime: SETTINGS.general.systemTime })
  })

  it('sets the system time', async () => {
    await controller.setSystemTime({ systemTime: 'd' })
    expect(service.setSystemTime).toHaveBeenCalledWith('d')
  })

  it('gets the available time zones', async () => {
    const response = await controller.getAvailableTimeZones()
    expect(response).toEqual({ timeZones: AVAILABLE_TIMEZONES })
  })

  it('gets the time zone', async () => {
    const response = await controller.getTimeZone()
    expect(response).toEqual({ timeZone: SETTINGS.general.timeZone })
  })

  it('sets the time zone', async () => {
    const timeZone = 'a'
    await controller.setTimeZone({ timeZone })
    expect(service.setTimeZone).toHaveBeenCalledWith(timeZone)
  })
})
