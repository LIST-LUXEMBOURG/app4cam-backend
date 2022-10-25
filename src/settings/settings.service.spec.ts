import { Test, TestingModule } from '@nestjs/testing'
import { Settings, SettingsFromJsonFile } from './settings'
import { SettingsFileProvider } from './settings-file-provider'
import { SettingsService } from './settings.service'
import { SystemTimeInteractor } from './system-time-interactor'

jest.mock('../motion-client', () => ({
  MotionClient: {
    getHeight: () => 1,
    getWidth: () => 1,
    setFilename: jest.fn(),
    setLeftTextOnImage: jest.fn(),
    getMovieOutput: () => 'on',
    setMovieOutput: jest.fn(),
    getPictureOutput: () => 'best',
    setPictureOutput: jest.fn(),
    getThreshold: () => 1,
    setThreshold: jest.fn(),
  },
}))

describe('SettingsService', () => {
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService],
    }).compile()

    service = module.get<SettingsService>(SettingsService)
  })

  it('is defined', () => {
    expect(service).toBeDefined()
  })

  describe('with mocked SettingsFileProvider', () => {
    const AVAILABLE_TIMEZONES = ['t1', 't2']
    const SHOT_TYPES = ['pictures' as const, 'videos' as const]
    const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
    const TRIGGER_SENSITIVITY = 100
    const FILE_SETTINGS: SettingsFromJsonFile = {
      deviceName: 'd',
      siteName: 's',
      timeZone: 't',
    }
    const ALL_SETTINGS: Settings = {
      camera: {
        shotTypes: SHOT_TYPES,
      },
      general: {
        ...FILE_SETTINGS,
        systemTime: SYSTEM_TIME,
      },
      triggering: {
        sensitivity: TRIGGER_SENSITIVITY,
      },
    }

    let spyReadSettingsFile
    let spyWriteSettingsFile
    let spyGetSystemTime
    let spySetSystemTime
    let spyGetAvailableTimeZones
    let spyGetTimeZone
    let spySetTimeZone

    beforeAll(() => {
      spyReadSettingsFile = jest
        .spyOn(SettingsFileProvider, 'readSettingsFile')
        .mockImplementation(() => {
          return Promise.resolve(FILE_SETTINGS)
        })
      spyWriteSettingsFile = jest
        .spyOn(SettingsFileProvider, 'writeSettingsToFile')
        .mockImplementation(() => {
          return Promise.resolve()
        })
      spyGetSystemTime = jest
        .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
        .mockImplementation(() => Promise.resolve(SYSTEM_TIME))
      spySetSystemTime = jest
        .spyOn(SystemTimeInteractor, 'setSystemTimeInIso8601Format')
        .mockImplementation(() => Promise.resolve())
      spyGetAvailableTimeZones = jest
        .spyOn(SystemTimeInteractor, 'getAvailableTimeZones')
        .mockImplementation(() => Promise.resolve(AVAILABLE_TIMEZONES))
      spyGetTimeZone = jest
        .spyOn(SystemTimeInteractor, 'getTimeZone')
        .mockImplementation(() => Promise.resolve(FILE_SETTINGS.timeZone))
      spySetTimeZone = jest
        .spyOn(SystemTimeInteractor, 'setTimeZone')
        .mockImplementation(() => Promise.resolve())
    })

    it('gets all settings', async () => {
      const settings = await service.getAllSettings()
      expect(spyGetSystemTime).toHaveBeenCalled()
      expect(settings).toStrictEqual(ALL_SETTINGS)
    })

    it('updates all optional settings', async () => {
      const settingsToUpdateInFile: SettingsFromJsonFile = {
        deviceName: 'dd',
        siteName: 'ss',
        timeZone: 't1',
      }
      const allSettings: Settings = {
        camera: {
          shotTypes: ['pictures', 'videos'],
        },
        general: {
          ...settingsToUpdateInFile,
          systemTime: 'sy',
        },
        triggering: {
          sensitivity: 1,
        },
      }
      await service.updateSettings(allSettings)
      expect(spySetSystemTime).toHaveBeenCalledWith(
        allSettings.general.systemTime,
      )
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        settingsToUpdateInFile,
        expect.any(String),
      )
      expect(spySetTimeZone).toHaveBeenCalledWith(
        settingsToUpdateInFile.timeZone,
      )
    })

    it('updates one setting stored in settings file but neither system time nor time zone', async () => {
      const settingsToUpdate: DeepPartial<Settings> = {
        general: {
          deviceName: 'dd',
        },
      }
      await service.updateSettings(settingsToUpdate)
      const expectedSettings = JSON.parse(JSON.stringify(FILE_SETTINGS)) // deep clone
      expectedSettings.deviceName = settingsToUpdate.general.deviceName
      expect(spySetSystemTime).not.toHaveBeenCalled()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expectedSettings,
        expect.any(String),
      )
      expect(spySetTimeZone).not.toHaveBeenCalled()
    })

    it('updates system time but neither read nor write settings file', async () => {
      const settingsToUpdate: DeepPartial<Settings> = {
        general: {
          systemTime: 'sy',
        },
      }
      await service.updateSettings(settingsToUpdate)
      expect(spySetSystemTime).toHaveBeenCalledWith(
        settingsToUpdate.general.systemTime,
      )
      expect(spyReadSettingsFile).not.toHaveBeenCalled()
      expect(spyWriteSettingsFile).not.toHaveBeenCalled()
      expect(spySetTimeZone).not.toHaveBeenCalled()
    })

    it('updates all settings', async () => {
      const settings: SettingsFromJsonFile = {
        deviceName: 'dd',
        siteName: 'ss',
        timeZone: 't1',
      }
      await service.updateAllSettings({
        camera: {
          shotTypes: SHOT_TYPES,
        },
        general: {
          ...settings,
        },
        triggering: {
          sensitivity: TRIGGER_SENSITIVITY,
        },
      })
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        settings,
        expect.any(String),
      )
      expect(spySetTimeZone).toHaveBeenCalledWith(settings.timeZone)
    })

    it('returns site name', async () => {
      const siteName = await service.getSiteName()
      expect(siteName).toBe(FILE_SETTINGS.siteName)
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
      expect(deviceName).toBe(FILE_SETTINGS.deviceName)
    })

    it('sets device name', async () => {
      await service.setDeviceName('b')
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
      )
    })

    it('returns system time', async () => {
      const systemTime = await service.getSystemTime()
      expect(systemTime).toBe(SYSTEM_TIME)
    })

    it('sets system time', async () => {
      const systemTime = 'd'
      await service.setSystemTime(systemTime)
      expect(spySetSystemTime).toHaveBeenCalledWith(systemTime)
    })

    it('returns available time zones', async () => {
      const timeZones = await service.getAvailableTimeZones()
      expect(timeZones).toBe(AVAILABLE_TIMEZONES)
    })

    it('returns time zone', async () => {
      const timeZone = await service.getTimeZone()
      expect(timeZone).toBe(ALL_SETTINGS.general.timeZone)
    })

    it('sets time zone', async () => {
      const timeZone = 't1'
      await service.setTimeZone(timeZone)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
      )
      expect(spySetTimeZone).toHaveBeenCalledWith(timeZone)
    })

    it('throws an error when the time zone given is not supported', async () => {
      const timeZone = 'c'
      await expect(service.setTimeZone(timeZone)).rejects.toThrow()
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
      spyGetAvailableTimeZones.mockRestore()
      spyGetTimeZone.mockRestore()
      spySetTimeZone.mockRestore()
    })
  })
})
