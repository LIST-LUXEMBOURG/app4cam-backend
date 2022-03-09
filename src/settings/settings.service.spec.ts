import { Test, TestingModule } from '@nestjs/testing'
import { Settings, SettingsFromJsonFile } from './settings'
import { SettingsFileProvider } from './settings-file-provider'
import { SettingsService } from './settings.service'
import { SystemTimeInteractor } from './system-time-interactor'

jest.mock('../motion-client', () => ({
  MotionClient: {
    setFilename: () => jest.fn(),
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
    const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
    const FILE_SETTINGS: SettingsFromJsonFile = {
      deviceId: 'd',
      siteName: 's',
    }
    const ALL_SETTINGS: Settings = {
      ...FILE_SETTINGS,
      systemTime: SYSTEM_TIME,
    }
    let spyReadSettingsFile
    let spyWriteSettingsFile
    let spyGetSystemTime
    let spySetSystemTime

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
    })

    it('gets all settings', async () => {
      const settings = await service.getAllSettings()
      expect(spyGetSystemTime).toHaveBeenCalled()
      expect(settings).toStrictEqual(ALL_SETTINGS)
    })

    it('updates all optional settings', async () => {
      const settingsToUpdateInFile: SettingsFromJsonFile = {
        deviceId: 'dd',
        siteName: 'ss',
      }
      const allSettings: Settings = {
        ...settingsToUpdateInFile,
        systemTime: 'sy',
      }
      await service.updateSettings(allSettings)
      expect(spySetSystemTime).toHaveBeenCalledWith(allSettings.systemTime)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        settingsToUpdateInFile,
        expect.any(String),
      )
    })

    it('updates one setting stored in settings file but not system time', async () => {
      const settingsToUpdate: Partial<Settings> = {
        deviceId: 'dd',
      }
      await service.updateSettings(settingsToUpdate)
      const expectedSettings = JSON.parse(JSON.stringify(FILE_SETTINGS)) // deep clone
      expectedSettings.deviceId = settingsToUpdate.deviceId
      expect(spySetSystemTime).not.toHaveBeenCalled()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expectedSettings,
        expect.any(String),
      )
    })

    it('updates system time but neither read nor write settings file', async () => {
      const settingsToUpdate: Partial<Settings> = {
        systemTime: 'sy',
      }
      await service.updateSettings(settingsToUpdate)
      expect(spySetSystemTime).toHaveBeenCalledWith(settingsToUpdate.systemTime)
      expect(spyReadSettingsFile).not.toHaveBeenCalled()
      expect(spyWriteSettingsFile).not.toHaveBeenCalled()
    })

    it('updates all settings', async () => {
      const settings: SettingsFromJsonFile = {
        deviceId: 'dd',
        siteName: 'ss',
      }
      await service.updateAllSettings(settings)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        settings,
        expect.any(String),
      )
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

    it('returns device ID', async () => {
      const deviceId = await service.getDeviceId()
      expect(deviceId).toBe(FILE_SETTINGS.deviceId)
    })

    it('sets device ID', async () => {
      await service.setDeviceId('b')
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
      )
    })

    it('returns system time', async () => {
      const systemTime = await service.getSystemTime()
      expect(systemTime).toBe(ALL_SETTINGS.systemTime)
    })

    it('sets system time', async () => {
      const systemTime = 'd'
      await service.setSystemTime(systemTime)
      expect(spySetSystemTime).toHaveBeenCalledWith(systemTime)
    })

    afterEach(() => {
      spyReadSettingsFile.mockClear()
      spyWriteSettingsFile.mockClear()
      spySetSystemTime.mockClear()
    })

    afterAll(() => {
      spyReadSettingsFile.mockRestore()
      spyWriteSettingsFile.mockRestore()
      spyGetSystemTime.mockRestore()
      spySetSystemTime.mockRestore()
    })
  })
})
