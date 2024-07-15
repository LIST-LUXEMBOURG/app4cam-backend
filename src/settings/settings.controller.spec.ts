// © 2022-2024 Luxembourg Institute of Science and Technology
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PropertiesService } from '../properties/properties.service'
import { Settings } from './entities/settings'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

describe('SettingsController', () => {
  const SLEEPING_TIME = {
    hour: 10,
    minute: 12,
  }
  const WAKING_UP_TIME = {
    hour: 10,
    minute: 17,
  }

  const SETTINGS: Settings = {
    camera: {
      focus: 200,
      focusMaximum: Number.MAX_SAFE_INTEGER,
      focusMinimum: Number.MIN_SAFE_INTEGER,
      isLightEnabled: true,
      light: 'visible',
      pictureQuality: 90,
      shotTypes: ['pictures', 'videos'],
      videoQuality: 60,
    },
    general: {
      deviceName: 'd',
      latitude: 1,
      locationAccuracy: 3,
      longitude: 2,
      password: 'p',
      siteName: 's',
      systemTime: '2022-01-18T14:48:37+01:00',
      timeZone: 't',
    },
    triggering: {
      isLightEnabled: true,
      isTemperatureThresholdEnabled: true,
      light: 'infrared',
      temperatureThreshold: 10,
      threshold: 1,
      thresholdMaximum: 100,
      sleepingTime: SLEEPING_TIME,
      wakingUpTime: WAKING_UP_TIME,
    },
  }
  const SHOT_TYPES = ['pictures', 'videos']
  const SHOTS_FOLDER = '/a'
  let controller: SettingsController
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        ConfigService,
        PropertiesService,
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
            getTimeZone: jest.fn().mockReturnValue(SETTINGS.general.timeZone),
            setTimeZone: jest.fn(),
            getShotsFolder: jest.fn().mockReturnValue(SHOTS_FOLDER),
            setShotsFolder: jest.fn(),
            getShotTypes: jest.fn().mockReturnValue(SHOT_TYPES),
            getSleepingTime: jest.fn().mockReturnValue(SLEEPING_TIME),
            getWakingUpTime: jest.fn().mockReturnValue(WAKING_UP_TIME),
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
        focus: 200,
        light: 'visible' as const,
        pictureQuality: 40,
        shotTypes: ['pictures' as const, 'videos' as const],
        videoQuality: 40,
      },
      general: {
        deviceName: 'd',
        latitude: 1,
        locationAccuracy: 3,
        longitude: 2,
        password: 'p',
        siteName: 's',
        systemTime: new Date().toISOString(),
        timeZone: 't',
      },
      triggering: {
        light: 'infrared' as const,
        sleepingTime: {
          hour: 1,
          minute: 2,
        },
        temperatureThreshold: 7,
        threshold: 1,
        wakingUpTime: {
          hour: 3,
          minute: 4,
        },
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

  it('gets the time zone', async () => {
    const response = await controller.getTimeZone()
    expect(response).toEqual({ timeZone: SETTINGS.general.timeZone })
  })

  it('sets the time zone', async () => {
    const timeZone = 'a'
    await controller.setTimeZone({ timeZone })
    expect(service.setTimeZone).toHaveBeenCalledWith(timeZone)
  })

  it('gets the shots folder', async () => {
    const response = await controller.getShotsFolder()
    expect(response).toEqual({ shotsFolder: SHOTS_FOLDER })
  })

  it('sets the shots folder', async () => {
    const shotsFolder = '/media/a'
    await controller.setShotsFolder({ shotsFolder })
    expect(service.setShotsFolder).toHaveBeenCalledWith(shotsFolder)
  })

  it('gets the shot types', async () => {
    const response = await controller.getShotTypes()
    expect(response).toEqual({ shotTypes: SHOT_TYPES })
  })
})
