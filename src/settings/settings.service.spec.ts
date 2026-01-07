/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { InitialisationInteractor } from '../initialisation-interactor'
import { PropertiesService } from '../properties/properties.service'
import { SettingsPutDto } from './dto/settings.dto'
import { PatchableSettings, Settings } from './entities/settings'
import { AccessPointInteractor } from './interactors/access-point-interactor'
import { SystemTimeInteractor } from './interactors/system-time-interactor'
import { TemperatureInteractor } from './interactors/temperature-interactor'
import { VideoDeviceInteractor } from './interactors/video-device-interactor'
import { SettingsFileProvider } from './settings-file-provider'
import { SettingsService } from './settings.service'

const SHOTS_FOLDER = '/a'

const HEIGHT = 2
const TRIGGER_SENSITIVITY = 5
const WIDTH = 3

jest.mock('../motion-client', () => ({
  MotionClient: {
    getHeight: () => HEIGHT,
    getWidth: () => WIDTH,
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
    getThreshold: () => TRIGGER_SENSITIVITY,
    setThreshold: jest.fn(),
    getTargetDir: () => SHOTS_FOLDER,
    getVideoDevice: () => '',
    getVideoParams: () =>
      '"Focus, Auto"=0,"Focus (absolute)"=200,Brightness=16',
    setVideoParams: jest.fn(),
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
    const CAMERA_LIGHT_TYPE = 'visible' as const
    const FOCUS = 200
    const FOCUS_MAX = 500
    const FOCUS_MIN = 0
    const LATITUDE = 1
    const LONGITUDE = 2
    const PASSWORD = 'p'
    const SHOT_TYPES = ['pictures' as const, 'videos' as const]
    const SLEEPING_TIME = {
      hour: 10,
      minute: 12,
    }
    const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
    const TEMPERATURE_THRESHOLD = 10
    const TRIGGER_LIGHT_TYPE = 'infrared' as const
    const TRIGGER_SENSITIVITY_MAXIMUM = HEIGHT * WIDTH
    const USE_SUNRISE_AND_SUNSET_TIMES = false
    const WAKING_UP_TIME = {
      hour: 10,
      minute: 17,
    }

    const CAMERA_JSON_SETTINGS = {
      light: CAMERA_LIGHT_TYPE,
    }
    const GENERAL_JSON_SETTINGS = {
      deviceName: 'd',
      isAlternatingLightModeEnabled: false,
      latitude: LATITUDE,
      locationAccuracy: 3,
      longitude: LONGITUDE,
      siteName: 's',
    }
    const TRIGGERING_JSON_SETTINGS = {
      light: TRIGGER_LIGHT_TYPE,
      sleepingTime: SLEEPING_TIME,
      temperatureThreshold: TEMPERATURE_THRESHOLD,
      useSunriseAndSunsetTimes: USE_SUNRISE_AND_SUNSET_TIMES,
      wakingUpTime: WAKING_UP_TIME,
    }
    const JSON_SETTINGS = {
      camera: CAMERA_JSON_SETTINGS,
      general: GENERAL_JSON_SETTINGS,
      triggering: TRIGGERING_JSON_SETTINGS,
    }

    const ALL_SETTINGS: Settings = {
      camera: {
        focus: FOCUS,
        focusMaximum: FOCUS_MAX,
        focusMinimum: FOCUS_MIN,
        isLightEnabled: true,
        isPictureQualityEnabled: true,
        isShotTypesEnabled: true,
        light: CAMERA_LIGHT_TYPE,
        pictureQuality: 90,
        shotTypes: SHOT_TYPES,
        videoQuality: 60,
      },
      general: {
        ...GENERAL_JSON_SETTINGS,
        password: PASSWORD,
        systemTime: SYSTEM_TIME,
        timeZone: 't',
      },
      triggering: {
        ...TRIGGERING_JSON_SETTINGS,
        isLightEnabled: true,
        isTemperatureThresholdEnabled: false,
        threshold: TRIGGER_SENSITIVITY,
        thresholdMaximum: TRIGGER_SENSITIVITY_MAXIMUM,
      },
    }

    let spyReadSettingsFile
    let spyWriteSettingsFile
    let spyGetSystemTime
    let spySetSystemAndRtcTime
    let spyGetTimeZone
    let spySetTimeZone
    let spyInitializeLights
    let spySetAccessPointNameOrPassword
    let spyGetAccessPointPassword
    let spyGetFocus

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
      spySetSystemAndRtcTime = jest
        .spyOn(SystemTimeInteractor, 'setSystemAndRtcTimeInIso8601Format')
        .mockResolvedValue()
      spyGetTimeZone = jest
        .spyOn(SystemTimeInteractor, 'getTimeZone')
        .mockResolvedValue(ALL_SETTINGS.general.timeZone)
      spySetTimeZone = jest
        .spyOn(SystemTimeInteractor, 'setTimeZone')
        .mockResolvedValue()
      spyInitializeLights = jest
        .spyOn(InitialisationInteractor, 'resetLights')
        .mockResolvedValue()
      spySetAccessPointNameOrPassword = jest
        .spyOn(AccessPointInteractor, 'setAccessPointNameOrPassword')
        .mockResolvedValue()
      spyGetAccessPointPassword = jest
        .spyOn(AccessPointInteractor, 'getAccessPointPassword')
        .mockResolvedValue(PASSWORD)
      spyGetFocus = jest
        .spyOn(VideoDeviceInteractor, 'getFocus')
        .mockResolvedValue({ min: FOCUS_MIN, max: FOCUS_MAX })
    })

    it('gets all settings', async () => {
      const settings = await service.getAllSettings()
      expect(spyGetSystemTime).toHaveBeenCalled()
      expect(settings).toStrictEqual(ALL_SETTINGS)
    })

    it('updates all optional settings', async () => {
      const cameraJsonSettings = {
        light: 'visible' as const,
      }
      const generalJsonSettings = {
        deviceName: 'dd',
        isAlternatingLightModeEnabled: true,
        latitude: 1,
        locationAccuracy: 3,
        longitude: 2,
        siteName: 'ss',
      }
      const triggeringJsonSettings = {
        light: 'infrared' as const,
        sleepingTime: {
          hour: 9,
          minute: 0,
        },
        temperatureThreshold: 7,
        useSunriseAndSunsetTimes: false,
        wakingUpTime: {
          hour: 8,
          minute: 30,
        },
      }
      const jsonSettings = {
        camera: cameraJsonSettings,
        general: generalJsonSettings,
        triggering: triggeringJsonSettings,
      }
      const allSettings: PatchableSettings = {
        camera: {
          ...cameraJsonSettings,
          focus: 200,
          pictureQuality: 90,
          shotTypes: ['pictures', 'videos'],
          videoQuality: 60,
        },
        general: {
          ...generalJsonSettings,
          password: 'pa',
          systemTime: 'sy',
          timeZone: 't1',
        },
        triggering: {
          ...triggeringJsonSettings,
          threshold: 1,
        },
      }
      const returnedSettings = await service.updateSettings(allSettings)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        jsonSettings,
        expect.any(String),
      )
      expect(spySetSystemAndRtcTime).toHaveBeenCalled()
      // Only check the 1st argument:
      expect(spySetSystemAndRtcTime.mock.calls[0][0]).toBe(
        allSettings.general.systemTime,
      )
      expect(spySetTimeZone).toHaveBeenCalledWith(allSettings.general.timeZone)
      expect(returnedSettings).toStrictEqual(allSettings)
    })

    it('updates one setting stored in settings file but neither system time nor time zone', async () => {
      const settingsToUpdate: PatchableSettings = {
        general: {
          deviceName: 'dd',
        },
      }
      const returnedSettings = await service.updateSettings(settingsToUpdate)
      const expectedSettings = JSON.parse(JSON.stringify(JSON_SETTINGS)) // deep clone
      expectedSettings.general.deviceName = settingsToUpdate.general.deviceName
      expect(spySetSystemAndRtcTime).not.toHaveBeenCalled()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expectedSettings,
        expect.any(String),
      )
      expect(spySetTimeZone).not.toHaveBeenCalled()
      expect(returnedSettings).toStrictEqual(settingsToUpdate)
    })

    it('updates system time but does not write settings file', async () => {
      const settingsToUpdate: PatchableSettings = {
        general: {
          systemTime: 'sy',
        },
      }
      const returnedSettings = await service.updateSettings(settingsToUpdate)
      expect(spySetSystemAndRtcTime).toHaveBeenCalled()
      // Only check the 1st argument:
      expect(spySetSystemAndRtcTime.mock.calls[0][0]).toBe(
        settingsToUpdate.general.systemTime,
      )
      expect(spyWriteSettingsFile).not.toHaveBeenCalled()
      expect(spySetTimeZone).not.toHaveBeenCalled()
      expect(returnedSettings).toStrictEqual(settingsToUpdate)
    })

    it('updates all settings', async () => {
      const cameraJsonSettings = {
        light: 'visible' as const,
      }
      const generalJsonSettings = {
        deviceName: 'dd',
        isAlternatingLightModeEnabled: true,
        latitude: 1,
        locationAccuracy: 3,
        longitude: 2,
        siteName: 'ss',
      }
      const triggeringJsonSettings = {
        temperatureThreshold: 1,
        sleepingTime: {
          hour: 9,
          minute: 0,
        },
        useSunriseAndSunsetTimes: false,
        wakingUpTime: {
          hour: 8,
          minute: 30,
        },
        light: 'infrared' as const,
      }
      const jsonSettings = {
        camera: cameraJsonSettings,
        general: generalJsonSettings,
        triggering: triggeringJsonSettings,
      }
      const settings: SettingsPutDto = {
        camera: {
          ...cameraJsonSettings,
          focus: 200,
          pictureQuality: 90,
          shotTypes: SHOT_TYPES,
          videoQuality: 60,
        },
        general: {
          ...generalJsonSettings,
          password: 'pa',
          systemTime: 'sy',
          timeZone: 't1',
        },
        triggering: {
          ...triggeringJsonSettings,
          threshold: TRIGGER_SENSITIVITY,
        },
      }
      await service.updateAllSettings(settings)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        jsonSettings,
        expect.any(String),
      )
      expect(spySetSystemAndRtcTime).toHaveBeenCalled()
      // Only check the 1st argument:
      expect(spySetSystemAndRtcTime.mock.calls[0][0]).toBe(
        settings.general.systemTime,
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
      expect(spySetSystemAndRtcTime).toHaveBeenCalled()
      // Only check the 1st argument:
      expect(spySetSystemAndRtcTime.mock.calls[0][0]).toBe(systemTime)
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

    it('returns the light type', async () => {
      const light = await service.getTriggeringLight()
      expect(light).toBe(TRIGGER_LIGHT_TYPE)
    })

    describe('isTemperatureBelowThreshold', () => {
      it('returns true when above threshold', async () => {
        const spyGetCurrentTemperature = jest
          .spyOn(TemperatureInteractor, 'getCurrentTemperature')
          .mockResolvedValue(-1)
        const flag = await service.isTemperatureBelowThreshold()
        expect(flag).toBeTruthy()
        spyGetCurrentTemperature.mockRestore()
      })

      it('returns false when below threshold', async () => {
        const spyGetCurrentTemperature = jest
          .spyOn(TemperatureInteractor, 'getCurrentTemperature')
          .mockResolvedValue(18)
        const flag = await service.isTemperatureBelowThreshold()
        expect(flag).toBeFalsy()
        spyGetCurrentTemperature.mockRestore()
      })
    })

    it('returns the latitude and longitude', async () => {
      const coordinates = await service.getLatitudeAndLongitude()
      expect(coordinates).toEqual({ latitude: LATITUDE, longitude: LONGITUDE })
    })

    it('returns the getIsAlternatingLightModeEnabled flag', async () => {
      const flag = await service.getIsAlternatingLightModeEnabled()
      expect(flag).toBe(GENERAL_JSON_SETTINGS.isAlternatingLightModeEnabled)
    })

    it('returns the useSunriseAndSunsetTimes flag', async () => {
      const flag = await service.getUseSunriseAndSunsetTimes()
      expect(flag).toBe(USE_SUNRISE_AND_SUNSET_TIMES)
    })

    afterEach(() => {
      spyReadSettingsFile.mockClear()
      spyWriteSettingsFile.mockClear()
      spySetSystemAndRtcTime.mockClear()
      spySetTimeZone.mockClear()
    })

    afterAll(() => {
      spyReadSettingsFile.mockRestore()
      spyWriteSettingsFile.mockRestore()
      spyGetSystemTime.mockRestore()
      spySetSystemAndRtcTime.mockRestore()
      spyGetTimeZone.mockRestore()
      spySetTimeZone.mockRestore()
      spyInitializeLights.mockRestore()
      spySetAccessPointNameOrPassword.mockRestore()
      spyGetAccessPointPassword.mockRestore()
      spyGetFocus.mockRestore()
    })
  })
})
