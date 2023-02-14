import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PropertiesService } from '../properties/properties.service'
import { SystemTimeInteractor } from './interactors/system-time-interactor'
import { Settings } from './settings'
import { SettingsFileProvider } from './settings-file-provider'
import { SettingsService } from './settings.service'

const SHOTS_FOLDER = '/a'

jest.mock('../motion-client', () => ({
  MotionClient: {
    getHeight: () => 1,
    getWidth: () => 1,
    setFilename: jest.fn(),
    setLeftTextOnImage: jest.fn(),
    getMovieQuality: () => 60,
    setMovieQuality: jest.fn(),
    getMovieOutput: () => 'on',
    setMovieOutput: jest.fn(),
    getPictureQuality: () => 90,
    setPictureQuality: jest.fn(),
    getPictureOutput: () => 'best',
    setPictureOutput: jest.fn(),
    getThreshold: () => 1,
    setThreshold: jest.fn(),
    getTargetDir: () => SHOTS_FOLDER,
  },
}))

const mockPropertiesService = {
  getAvailableTimeZones: jest.fn().mockReturnValue(['t1', 't2']),
}

describe('SettingsService', () => {
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
        SettingsService,
      ],
    }).compile()

    service = module.get<SettingsService>(SettingsService)
  })

  it('is defined', () => {
    expect(service).toBeDefined()
  })

  describe('with mocked SettingsFileProvider', () => {
    const SHOT_TYPES = ['pictures' as const, 'videos' as const]
    const SLEEPING_TIME = '10:12'
    const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
    const TRIGGER_SENSITIVITY = 1
    const WAKING_UP_TIME = '10:17'

    const GENERAL_JSON_SETTINGS = {
      deviceName: 'd',
      siteName: 's',
    }
    const TRIGGERING_JSON_SETTINGS = {
      sleepingTime: SLEEPING_TIME,
      wakingUpTime: WAKING_UP_TIME,
    }
    const JSON_SETTINGS = {
      general: GENERAL_JSON_SETTINGS,
      triggering: TRIGGERING_JSON_SETTINGS,
    }

    const ALL_SETTINGS: Settings = {
      camera: {
        pictureQuality: 90,
        shotTypes: SHOT_TYPES,
        videoQuality: 60,
      },
      general: {
        ...GENERAL_JSON_SETTINGS,
        systemTime: SYSTEM_TIME,
        timeZone: 't',
      },
      triggering: {
        ...TRIGGERING_JSON_SETTINGS,
        sensitivity: TRIGGER_SENSITIVITY,
      },
    }

    let spyReadSettingsFile
    let spyWriteSettingsFile
    let spyGetSystemTime
    let spySetSystemTime
    let spyGetTimeZone
    let spySetTimeZone

    beforeAll(() => {
      spyReadSettingsFile = jest
        .spyOn(SettingsFileProvider, 'readSettingsFile')
        .mockResolvedValue(JSON_SETTINGS)
      spyWriteSettingsFile = jest
        .spyOn(SettingsFileProvider, 'writeSettingsToFile')
        .mockResolvedValue()
      spyGetSystemTime = jest
        .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
        .mockResolvedValue(SYSTEM_TIME)
      spySetSystemTime = jest
        .spyOn(SystemTimeInteractor, 'setSystemTimeInIso8601Format')
        .mockResolvedValue()
      spyGetTimeZone = jest
        .spyOn(SystemTimeInteractor, 'getTimeZone')
        .mockResolvedValue(ALL_SETTINGS.general.timeZone)
      spySetTimeZone = jest
        .spyOn(SystemTimeInteractor, 'setTimeZone')
        .mockResolvedValue()
    })

    it('gets all settings', async () => {
      const settings = await service.getAllSettings()
      expect(spyGetSystemTime).toHaveBeenCalled()
      expect(settings).toStrictEqual(ALL_SETTINGS)
    })

    it('updates all optional settings', async () => {
      const generalJsonSettings = {
        deviceName: 'dd',
        siteName: 'ss',
      }
      const triggeringJsonSettings = {
        sleepingTime: 'st',
        wakingUpTime: 'wt',
      }
      const jsonSettings = {
        general: generalJsonSettings,
        triggering: triggeringJsonSettings,
      }
      const allSettings: Settings = {
        camera: {
          pictureQuality: 90,
          shotTypes: ['pictures', 'videos'],
          videoQuality: 60,
        },
        general: {
          ...generalJsonSettings,
          systemTime: 'sy',
          timeZone: 't1',
        },
        triggering: {
          ...triggeringJsonSettings,
          sensitivity: 1,
        },
      }
      await service.updateSettings(allSettings)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        jsonSettings,
        expect.any(String),
      )
      expect(spySetSystemTime).toHaveBeenCalledWith(
        allSettings.general.systemTime,
        false,
      )
      expect(spySetTimeZone).toHaveBeenCalledWith(allSettings.general.timeZone)
    })

    it('updates one setting stored in settings file but neither system time nor time zone', async () => {
      const settingsToUpdate: DeepPartial<Settings> = {
        general: {
          deviceName: 'dd',
        },
      }
      await service.updateSettings(settingsToUpdate)
      const expectedSettings = JSON.parse(JSON.stringify(JSON_SETTINGS)) // deep clone
      expectedSettings.general.deviceName = settingsToUpdate.general.deviceName
      expect(spySetSystemTime).not.toHaveBeenCalled()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expectedSettings,
        expect.any(String),
      )
      expect(spySetTimeZone).not.toHaveBeenCalled()
    })

    it('updates system time but does not write settings file', async () => {
      const settingsToUpdate: DeepPartial<Settings> = {
        general: {
          systemTime: 'sy',
        },
      }
      await service.updateSettings(settingsToUpdate)
      expect(spySetSystemTime).toHaveBeenCalledWith(
        settingsToUpdate.general.systemTime,
        false,
      )
      expect(spyWriteSettingsFile).not.toHaveBeenCalled()
      expect(spySetTimeZone).not.toHaveBeenCalled()
    })

    it('updates all settings', async () => {
      const generalJsonSettings = {
        deviceName: 'dd',
        siteName: 'ss',
      }
      const triggeringJsonSettings = {
        sleepingTime: 'st',
        wakingUpTime: 'wt',
      }
      const jsonSettings = {
        general: generalJsonSettings,
        triggering: triggeringJsonSettings,
      }
      const settings: Settings = {
        camera: {
          pictureQuality: 90,
          shotTypes: SHOT_TYPES,
          videoQuality: 60,
        },
        general: {
          ...generalJsonSettings,
          systemTime: 'sy',
          timeZone: 't1',
        },
        triggering: {
          ...triggeringJsonSettings,
          sensitivity: TRIGGER_SENSITIVITY,
        },
      }
      await service.updateAllSettings(settings)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        jsonSettings,
        expect.any(String),
      )
      expect(spySetSystemTime).toHaveBeenCalledWith(
        settings.general.systemTime,
        false,
      )
      expect(spySetTimeZone).toHaveBeenCalledWith(settings.general.timeZone)
    })

    it('returns site name', async () => {
      const siteName = await service.getSiteName()
      expect(siteName).toBe(GENERAL_JSON_SETTINGS.siteName)
    })

    it('sets site name', async () => {
      await service.setSiteName('a')
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
      )
    })

    it('returns device name', async () => {
      const deviceName = await service.getDeviceName()
      expect(deviceName).toBe(GENERAL_JSON_SETTINGS.deviceName)
    })

    it('sets device name', async () => {
      await service.setDeviceName('b')
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
      )
    })

    it('returns shots folder', async () => {
      const shotsFolder = await service.getShotsFolder()
      expect(shotsFolder).toBe(SHOTS_FOLDER)
    })

    it('returns system time', async () => {
      const systemTime = await service.getSystemTime()
      expect(systemTime).toBe(SYSTEM_TIME)
    })

    it('sets system time', async () => {
      const systemTime = 'd'
      await service.setSystemTime(systemTime)
      expect(spySetSystemTime).toHaveBeenCalledWith(systemTime, false)
    })

    it('returns time zone', async () => {
      const timeZone = await service.getTimeZone()
      expect(timeZone).toBe(ALL_SETTINGS.general.timeZone)
    })

    it('sets time zone', async () => {
      const timeZone = 't1'
      await service.setTimeZone(timeZone)
      expect(spySetTimeZone).toHaveBeenCalledWith(timeZone)
    })

    it('throws an error when the time zone given is not supported', async () => {
      const timeZone = 'c'
      await expect(service.setTimeZone(timeZone)).rejects.toThrow()
    })

    it('returns the sleeping time', async () => {
      const time = await service.getSleepingTime()
      expect(time).toBe(SLEEPING_TIME)
    })

    it('returns the waking up time', async () => {
      const time = await service.getWakingUpTime()
      expect(time).toBe(WAKING_UP_TIME)
    })

    afterEach(() => {
      spyReadSettingsFile.mockClear()
      spyWriteSettingsFile.mockClear()
      spySetSystemTime.mockClear()
      spySetTimeZone.mockClear()
    })

    afterAll(() => {
      spyReadSettingsFile.mockRestore()
      spyWriteSettingsFile.mockRestore()
      spyGetSystemTime.mockRestore()
      spySetSystemTime.mockRestore()
      spyGetTimeZone.mockRestore()
      spySetTimeZone.mockRestore()
    })
  })
})
