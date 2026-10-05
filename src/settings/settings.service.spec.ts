/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
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
import {
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'
import { Mock, vi } from 'vitest'
import { createMockConfigService } from '../../test/unit/config-service.mock.js'
import { InitialisationInteractor } from '../initialisation-interactor.js'
import {
  IMotionClientService,
  MovieOutputValue,
  PictureOutputValue,
} from '../motion-client.service.interface.js'
import { MotionClientService } from '../motion-client.service.js'
import { CommandExecutionException } from '../shared/exceptions/CommandExecutionException.js'
import { SystemTimeZonesInteractor } from '../shared/interactors/system-time-zones-interactor.js'
import { SettingsPutDto } from './dto/settings.dto.js'
import { PatchableSettings, Settings } from './entities/settings.js'
import { AccessPointInteractor } from './interactors/access-point-interactor.js'
import { SleepInteractor } from './interactors/sleep-interactor.js'
import { SystemTimeInteractor } from './interactors/system-time-interactor.js'
import { TemperatureInteractor } from './interactors/temperature-interactor.js'
import { VideoDeviceInteractor } from './interactors/video-device-interactor.js'
import { SettingsFileProvider } from './settings-file-provider.js'
import { SettingsService } from './settings.service.js'

const SHOTS_FOLDER = '/a'

const HEIGHT = 2
const TRIGGER_SENSITIVITY = 5
const WIDTH = 3

class MockMotionClientService implements Partial<IMotionClientService> {
  getHeight = async () => HEIGHT
  getWidth = async () => WIDTH
  setFilename = async () => {}
  setLeftTextOnImage = async () => {}
  getMovieQuality = async () => 60
  setMovieQuality = async () => {}
  getMovieOutput = async () => 'on' as MovieOutputValue
  setMovieOutput = async () => {}
  getPictureQuality = async () => 90
  setPictureQuality = async () => {}
  getPictureOutput = async () => 'best' as PictureOutputValue
  setPictureOutput = async () => {}
  getThreshold = async () => TRIGGER_SENSITIVITY
  setThreshold = async () => {}
  getTargetDir = async () => SHOTS_FOLDER
  getVideoDevice = async () => ''
  getVideoParams = async () =>
    '"Focus, Auto"=0,"Focus (absolute)"=200,Brightness=16'
  setVideoParams = async () => {}
}

describe('SettingsService', () => {
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: createMockConfigService() },
        { provide: MotionClientService, useClass: MockMotionClientService },
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
        isFocusEnabled: true,
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

    let spyReadSettingsFile: Mock
    let spyWriteSettingsFile: Mock
    let spyGetAvailableTimeZones: Mock
    let spyGetSystemTime: Mock
    let spySetSystemAndRtcTime: Mock
    let spyGetTimeZone: Mock
    let spySetTimeZone: Mock
    let spyInitializeLights: Mock
    let spySetAccessPointNameOrPassword: Mock
    let spyGetAccessPointPassword: Mock
    let spyGetFocus: Mock

    beforeAll(() => {
      spyReadSettingsFile = vi
        .spyOn(SettingsFileProvider, 'readSettingsFile')
        .mockResolvedValue(JSON_SETTINGS)
      spyWriteSettingsFile = vi
        .spyOn(SettingsFileProvider, 'writeSettingsToFile')
        .mockResolvedValue()
      spyGetAvailableTimeZones = vi
        .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
        .mockResolvedValue(['t1', 't2'])
      spyGetSystemTime = vi
        .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
        .mockResolvedValue(SYSTEM_TIME)
      spySetSystemAndRtcTime = vi
        .spyOn(SystemTimeInteractor, 'setSystemAndRtcTimeInIso8601Format')
        .mockResolvedValue()
      spyGetTimeZone = vi
        .spyOn(SystemTimeInteractor, 'getTimeZone')
        .mockResolvedValue(ALL_SETTINGS.general.timeZone)
      spySetTimeZone = vi
        .spyOn(SystemTimeInteractor, 'setTimeZone')
        .mockResolvedValue()
      spyInitializeLights = vi
        .spyOn(InitialisationInteractor, 'resetLights')
        .mockResolvedValue()
      spySetAccessPointNameOrPassword = vi
        .spyOn(AccessPointInteractor, 'setAccessPointNameOrPassword')
        .mockResolvedValue()
      spyGetAccessPointPassword = vi
        .spyOn(AccessPointInteractor, 'getAccessPointPassword')
        .mockResolvedValue(PASSWORD)
      spyGetFocus = vi
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
        const spyGetCurrentTemperature = vi
          .spyOn(TemperatureInteractor, 'getCurrentTemperature')
          .mockResolvedValue(-1)
        const flag = await service.isTemperatureBelowThreshold()
        expect(flag).toBeTruthy()
        spyGetCurrentTemperature.mockRestore()
      })

      it('returns false when below threshold', async () => {
        const spyGetCurrentTemperature = vi
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
      spyGetAvailableTimeZones.mockRestore()
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

  describe('with access point update disabled', () => {
    let serviceWithDisabledAp: SettingsService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: ConfigService,
            useValue: createMockConfigService(),
          },
          { provide: MotionClientService, useClass: MockMotionClientService },
          SettingsService,
        ],
      }).compile()

      serviceWithDisabledAp = module.get<SettingsService>(SettingsService)
    })

    describe('with mocked SettingsFileProvider and AccessPointInteractor', () => {
      let spyReadSettingsFile: Mock
      let spyWriteSettingsFile: Mock
      let spyGetAvailableTimeZones: Mock
      let spySetAccessPointNameOrPassword: Mock
      let spyGetAccessPointPassword: Mock
      let spyGetSystemTime: Mock
      let spySetSystemAndRtcTime: Mock
      let spyGetTimeZone: Mock
      let spySetTimeZone: Mock
      let spyInitializeLights: Mock
      let spyGetFocus: Mock

      beforeAll(() => {
        spyReadSettingsFile = vi
          .spyOn(SettingsFileProvider, 'readSettingsFile')
          .mockResolvedValue({
            camera: { light: 'visible' as const },
            general: {
              deviceName: 'd',
              isAlternatingLightModeEnabled: false,
              latitude: 1,
              locationAccuracy: 3,
              longitude: 2,
              siteName: 's',
            },
            triggering: {
              light: 'infrared' as const,
              sleepingTime: { hour: 10, minute: 12 },
              temperatureThreshold: 10,
              useSunriseAndSunsetTimes: false,
              wakingUpTime: { hour: 10, minute: 17 },
            },
          })
        spyWriteSettingsFile = vi
          .spyOn(SettingsFileProvider, 'writeSettingsToFile')
          .mockResolvedValue()
        spyGetAvailableTimeZones = vi
          .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
          .mockResolvedValue(['t1', 't2'])
        spySetAccessPointNameOrPassword = vi
          .spyOn(AccessPointInteractor, 'setAccessPointNameOrPassword')
          .mockResolvedValue()
        spyGetAccessPointPassword = vi
          .spyOn(AccessPointInteractor, 'getAccessPointPassword')
          .mockResolvedValue('p')
        spyGetSystemTime = vi
          .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
          .mockResolvedValue('2022-01-18T14:48:37+01:00')
        spySetSystemAndRtcTime = vi
          .spyOn(SystemTimeInteractor, 'setSystemAndRtcTimeInIso8601Format')
          .mockResolvedValue()
        spyGetTimeZone = vi
          .spyOn(SystemTimeInteractor, 'getTimeZone')
          .mockResolvedValue('t1')
        spySetTimeZone = vi
          .spyOn(SystemTimeInteractor, 'setTimeZone')
          .mockResolvedValue()
        spyInitializeLights = vi
          .spyOn(InitialisationInteractor, 'resetLights')
          .mockResolvedValue()
        spyGetFocus = vi
          .spyOn(VideoDeviceInteractor, 'getFocus')
          .mockResolvedValue({ min: 0, max: 500 })
      })

      afterEach(() => {
        spySetAccessPointNameOrPassword.mockClear()
        spyWriteSettingsFile.mockClear()
      })

      afterAll(() => {
        spyReadSettingsFile.mockRestore()
        spyWriteSettingsFile.mockRestore()
        spyGetAvailableTimeZones.mockRestore()
        spySetAccessPointNameOrPassword.mockRestore()
        spyGetAccessPointPassword.mockRestore()
        spyGetSystemTime.mockRestore()
        spySetSystemAndRtcTime.mockRestore()
        spyGetTimeZone.mockRestore()
        spySetTimeZone.mockRestore()
        spyInitializeLights.mockRestore()
        spyGetFocus.mockRestore()
      })

      it('does not update the access point when setting the device name', async () => {
        await serviceWithDisabledAp.setDeviceName('new-name')
        expect(spySetAccessPointNameOrPassword).not.toHaveBeenCalled()
      })

      it('does not update the access point when patching settings with a device name', async () => {
        const settingsToUpdate: PatchableSettings = {
          general: { deviceName: 'new-name' },
        }
        await serviceWithDisabledAp.updateSettings(settingsToUpdate)
        expect(spySetAccessPointNameOrPassword).not.toHaveBeenCalled()
      })

      it('does not update the access point when replacing all settings', async () => {
        const settings: SettingsPutDto = {
          camera: {
            focus: 200,
            light: 'visible',
            pictureQuality: 90,
            shotTypes: ['pictures', 'videos'],
            videoQuality: 60,
          },
          general: {
            deviceName: 'new-name',
            isAlternatingLightModeEnabled: false,
            latitude: 1,
            locationAccuracy: 3,
            longitude: 2,
            password: 'pw',
            siteName: 's',
            systemTime: '2022-01-18T14:48:37+01:00',
            timeZone: 't1',
          },
          triggering: {
            light: 'infrared',
            sleepingTime: { hour: 9, minute: 0 },
            temperatureThreshold: 1,
            threshold: 5,
            useSunriseAndSunsetTimes: false,
            wakingUpTime: { hour: 8, minute: 30 },
          },
        }
        await serviceWithDisabledAp.updateAllSettings(settings)
        expect(spySetAccessPointNameOrPassword).not.toHaveBeenCalled()
      })
    })
  })

  describe('when Motion is unreachable', () => {
    const CONNECTION_ERROR = new AxiosError(
      'connect ECONNREFUSED 127.0.0.1:8080',
      'ECONNREFUSED',
      { url: 'http://127.0.0.1:8080' } as never,
    )

    const JSON_SETTINGS_MOTION_DOWN = {
      camera: { light: 'visible' as const },
      general: {
        deviceName: 'd',
        isAlternatingLightModeEnabled: false,
        latitude: 1,
        locationAccuracy: 3,
        longitude: 2,
        siteName: 's',
      },
      triggering: {
        light: 'infrared' as const,
        sleepingTime: { hour: 10, minute: 12 },
        temperatureThreshold: 10,
        useSunriseAndSunsetTimes: false,
        wakingUpTime: { hour: 10, minute: 17 },
      },
    }

    let serviceUnderTest: SettingsService
    let motionClient: MockMotionClientService
    let spyReadSettingsFile: Mock
    let spyWriteSettingsFile: Mock
    let spyGetAvailableTimeZones: Mock
    let spyGetSystemTime: Mock
    let spySetSystemAndRtcTime: Mock
    let spyGetTimeZone: Mock
    let spySetTimeZone: Mock
    let spyInitializeLights: Mock
    let spySetAccessPointNameOrPassword: Mock
    let spyGetAccessPointPassword: Mock
    let spyGetFocus: Mock
    let spyLoggerError: Mock

    beforeAll(() => {
      spyReadSettingsFile = vi
        .spyOn(SettingsFileProvider, 'readSettingsFile')
        .mockResolvedValue(JSON_SETTINGS_MOTION_DOWN)
      spyWriteSettingsFile = vi
        .spyOn(SettingsFileProvider, 'writeSettingsToFile')
        .mockResolvedValue()
      spyGetAvailableTimeZones = vi
        .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
        .mockResolvedValue(['t1', 't2'])
      spyGetSystemTime = vi
        .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
        .mockResolvedValue('2022-01-18T14:48:37+01:00')
      spySetSystemAndRtcTime = vi
        .spyOn(SystemTimeInteractor, 'setSystemAndRtcTimeInIso8601Format')
        .mockResolvedValue()
      spyGetTimeZone = vi
        .spyOn(SystemTimeInteractor, 'getTimeZone')
        .mockResolvedValue('t1')
      spySetTimeZone = vi
        .spyOn(SystemTimeInteractor, 'setTimeZone')
        .mockResolvedValue()
      spyInitializeLights = vi
        .spyOn(InitialisationInteractor, 'resetLights')
        .mockResolvedValue()
      spySetAccessPointNameOrPassword = vi
        .spyOn(AccessPointInteractor, 'setAccessPointNameOrPassword')
        .mockResolvedValue()
      spyGetAccessPointPassword = vi
        .spyOn(AccessPointInteractor, 'getAccessPointPassword')
        .mockResolvedValue('p')
      spyGetFocus = vi
        .spyOn(VideoDeviceInteractor, 'getFocus')
        .mockResolvedValue({ min: 0, max: 500 })
      spyLoggerError = vi
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined)
    })

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          { provide: ConfigService, useValue: createMockConfigService() },
          { provide: MotionClientService, useClass: MockMotionClientService },
          SettingsService,
        ],
      }).compile()

      serviceUnderTest = module.get<SettingsService>(SettingsService)
      motionClient = module.get<MockMotionClientService>(MotionClientService)
    })

    afterEach(() => {
      spyReadSettingsFile.mockClear()
      spyWriteSettingsFile.mockClear()
      spySetSystemAndRtcTime.mockClear()
      spySetTimeZone.mockClear()
      spyInitializeLights.mockClear()
      spySetAccessPointNameOrPassword.mockClear()
      spyLoggerError.mockClear()
    })

    afterAll(() => {
      spyReadSettingsFile.mockRestore()
      spyWriteSettingsFile.mockRestore()
      spyGetAvailableTimeZones.mockRestore()
      spyGetSystemTime.mockRestore()
      spySetSystemAndRtcTime.mockRestore()
      spyGetTimeZone.mockRestore()
      spySetTimeZone.mockRestore()
      spyInitializeLights.mockRestore()
      spySetAccessPointNameOrPassword.mockRestore()
      spyGetAccessPointPassword.mockRestore()
      spyGetFocus.mockRestore()
      spyLoggerError.mockRestore()
    })

    it('getAllSettings returns partial data without throwing when Motion is unreachable', async () => {
      const spy = vi
        .spyOn(motionClient, 'getPictureQuality')
        .mockRejectedValue(CONNECTION_ERROR)
      const result = await serviceUnderTest.getAllSettings()
      spy.mockRestore()
      expect(result).toBeDefined()
      expect(result.camera.pictureQuality).toBe(0)
    })

    it('PATCH deviceName persists to JSON and reports Motion unreachable', async () => {
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(CONNECTION_ERROR)
      const spySetLeftText = vi
        .spyOn(motionClient, 'setLeftTextOnImage')
        .mockRejectedValue(CONNECTION_ERROR)
      const settingsToUpdate: PatchableSettings = {
        general: { deviceName: 'new-name' },
      }
      await expect(
        serviceUnderTest.updateSettings(settingsToUpdate),
      ).rejects.toThrow(ServiceUnavailableException)
      spySetFilename.mockRestore()
      spySetLeftText.mockRestore()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.objectContaining({
          general: expect.objectContaining({ deviceName: 'new-name' }),
        }),
        expect.any(String),
      )
    })

    it('PATCH threshold validation is skipped and non-Motion settings persist when Motion is down', async () => {
      const spyGetHeight = vi
        .spyOn(motionClient, 'getHeight')
        .mockRejectedValue(CONNECTION_ERROR)
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(CONNECTION_ERROR)
      const settingsToUpdate: PatchableSettings = {
        general: { deviceName: 'x' },
        triggering: { threshold: 999999 },
      }
      await expect(
        serviceUnderTest.updateSettings(settingsToUpdate),
      ).rejects.toThrow(ServiceUnavailableException)
      spyGetHeight.mockRestore()
      spySetFilename.mockRestore()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.objectContaining({
          general: expect.objectContaining({ deviceName: 'x' }),
        }),
        expect.any(String),
      )
    })

    it('PATCH pictureQuality and videoQuality are skipped gracefully and reports Motion unreachable', async () => {
      const spySetPQ = vi
        .spyOn(motionClient, 'setPictureQuality')
        .mockRejectedValue(CONNECTION_ERROR)
      const spySetVQ = vi
        .spyOn(motionClient, 'setMovieQuality')
        .mockRejectedValue(CONNECTION_ERROR)
      const settingsToUpdate: PatchableSettings = {
        camera: { pictureQuality: 75, videoQuality: 50 },
      }
      await expect(
        serviceUnderTest.updateSettings(settingsToUpdate),
      ).rejects.toThrow(ServiceUnavailableException)
      spySetPQ.mockRestore()
      spySetVQ.mockRestore()
    })

    it('PATCH shotTypes are skipped gracefully and reports Motion unreachable', async () => {
      const spySetPO = vi
        .spyOn(motionClient, 'setPictureOutput')
        .mockRejectedValue(CONNECTION_ERROR)
      const settingsToUpdate: PatchableSettings = {
        camera: { shotTypes: ['pictures'] },
      }
      await expect(
        serviceUnderTest.updateSettings(settingsToUpdate),
      ).rejects.toThrow(ServiceUnavailableException)
      spySetPO.mockRestore()
    })

    it('PUT all settings persists JSON and runs non-Motion steps when Motion is down', async () => {
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(CONNECTION_ERROR)
      const spySetPQ = vi
        .spyOn(motionClient, 'setPictureQuality')
        .mockRejectedValue(CONNECTION_ERROR)
      const settings: SettingsPutDto = {
        camera: {
          focus: 200,
          light: 'visible',
          pictureQuality: 90,
          shotTypes: ['pictures', 'videos'],
          videoQuality: 60,
        },
        general: {
          deviceName: 'dd',
          isAlternatingLightModeEnabled: false,
          latitude: 1,
          locationAccuracy: 3,
          longitude: 2,
          password: 'pa',
          siteName: 'ss',
          systemTime: '2022-01-18T14:48:37+01:00',
          timeZone: 't1',
        },
        triggering: {
          light: 'infrared',
          sleepingTime: { hour: 9, minute: 0 },
          temperatureThreshold: 1,
          threshold: 5,
          useSunriseAndSunsetTimes: false,
          wakingUpTime: { hour: 8, minute: 30 },
        },
      }
      await expect(
        serviceUnderTest.updateAllSettings(settings),
      ).rejects.toThrow(ServiceUnavailableException)
      spySetFilename.mockRestore()
      spySetPQ.mockRestore()
      expect(spyWriteSettingsFile).toHaveBeenCalled()
      expect(spySetTimeZone).toHaveBeenCalled()
    })

    it('setSiteName persists to JSON and reports Motion unreachable', async () => {
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(CONNECTION_ERROR)
      await expect(serviceUnderTest.setSiteName('new-site')).rejects.toThrow(
        ServiceUnavailableException,
      )
      spySetFilename.mockRestore()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.objectContaining({
          general: expect.objectContaining({ siteName: 'new-site' }),
        }),
        expect.any(String),
      )
    })

    it('setDeviceName persists to JSON and reports Motion unreachable', async () => {
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(CONNECTION_ERROR)
      await expect(
        serviceUnderTest.setDeviceName('new-device'),
      ).rejects.toThrow(ServiceUnavailableException)
      spySetFilename.mockRestore()
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.objectContaining({
          general: expect.objectContaining({ deviceName: 'new-device' }),
        }),
        expect.any(String),
      )
    })

    it('setTimeZone commits the timezone and reports Motion unreachable', async () => {
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(CONNECTION_ERROR)
      await expect(serviceUnderTest.setTimeZone('t1')).rejects.toThrow(
        ServiceUnavailableException,
      )
      spySetFilename.mockRestore()
      expect(spySetTimeZone).toHaveBeenCalledWith('t1')
    })

    it('non-ECONNREFUSED Axios error still propagates from PATCH', async () => {
      const otherError = new AxiosError('bad response', 'ERR_BAD_RESPONSE', {
        url: 'http://127.0.0.1:8080',
      } as never)
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(otherError)
      const settingsToUpdate: PatchableSettings = {
        general: { deviceName: 'x' },
      }
      await expect(
        serviceUnderTest.updateSettings(settingsToUpdate),
      ).rejects.toThrow(otherError)
      spySetFilename.mockRestore()
    })

    it('non-Axios error still propagates from PATCH', async () => {
      const plainError = new Error('unexpected error')
      const spySetFilename = vi
        .spyOn(motionClient, 'setFilename')
        .mockRejectedValue(plainError)
      const settingsToUpdate: PatchableSettings = {
        general: { deviceName: 'x' },
      }
      await expect(
        serviceUnderTest.updateSettings(settingsToUpdate),
      ).rejects.toThrow(plainError)
      spySetFilename.mockRestore()
    })
  })

  describe('when the camera is unreachable', () => {
    const CAMERA_ERROR = new CommandExecutionException('device missing')

    const JSON_SETTINGS_CAMERA_DOWN = {
      camera: { light: 'visible' as const },
      general: {
        deviceName: 'd',
        isAlternatingLightModeEnabled: false,
        latitude: 1,
        locationAccuracy: 3,
        longitude: 2,
        siteName: 's',
      },
      triggering: {
        light: 'infrared' as const,
        sleepingTime: { hour: 10, minute: 12 },
        temperatureThreshold: 10,
        useSunriseAndSunsetTimes: false,
        wakingUpTime: { hour: 10, minute: 17 },
      },
    }

    let serviceUnderTest: SettingsService
    let spyReadSettingsFile: Mock
    let spyWriteSettingsFile: Mock
    let spyGetAvailableTimeZones: Mock
    let spyGetSystemTime: Mock
    let spySetSystemAndRtcTime: Mock
    let spyGetTimeZone: Mock
    let spySetTimeZone: Mock
    let spyInitializeLights: Mock
    let spySetAccessPointNameOrPassword: Mock
    let spyGetAccessPointPassword: Mock
    let spyGetFocus: Mock
    let spySetFocus: Mock
    let spyLoggerError: Mock

    beforeAll(() => {
      spyReadSettingsFile = vi
        .spyOn(SettingsFileProvider, 'readSettingsFile')
        .mockResolvedValue(JSON_SETTINGS_CAMERA_DOWN)
      spyWriteSettingsFile = vi
        .spyOn(SettingsFileProvider, 'writeSettingsToFile')
        .mockResolvedValue()
      spyGetAvailableTimeZones = vi
        .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
        .mockResolvedValue(['t1', 't2'])
      spyGetSystemTime = vi
        .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
        .mockResolvedValue('2022-01-18T14:48:37+01:00')
      spySetSystemAndRtcTime = vi
        .spyOn(SystemTimeInteractor, 'setSystemAndRtcTimeInIso8601Format')
        .mockResolvedValue()
      spyGetTimeZone = vi
        .spyOn(SystemTimeInteractor, 'getTimeZone')
        .mockResolvedValue('t1')
      spySetTimeZone = vi
        .spyOn(SystemTimeInteractor, 'setTimeZone')
        .mockResolvedValue()
      spyInitializeLights = vi
        .spyOn(InitialisationInteractor, 'resetLights')
        .mockResolvedValue()
      spySetAccessPointNameOrPassword = vi
        .spyOn(AccessPointInteractor, 'setAccessPointNameOrPassword')
        .mockResolvedValue()
      spyGetAccessPointPassword = vi
        .spyOn(AccessPointInteractor, 'getAccessPointPassword')
        .mockResolvedValue('p')
      spyGetFocus = vi
        .spyOn(VideoDeviceInteractor, 'getFocus')
        .mockRejectedValue(CAMERA_ERROR)
      spySetFocus = vi
        .spyOn(VideoDeviceInteractor, 'setFocus')
        .mockRejectedValue(CAMERA_ERROR)
      spyLoggerError = vi
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined)
    })

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: ConfigService,
            useValue: createMockConfigService({ deviceType: 'RaspberryPi' }),
          },
          { provide: MotionClientService, useClass: MockMotionClientService },
          SettingsService,
        ],
      }).compile()
      serviceUnderTest = module.get<SettingsService>(SettingsService)
    })

    afterEach(() => {
      spyReadSettingsFile.mockClear()
      spyWriteSettingsFile.mockClear()
      spySetSystemAndRtcTime.mockClear()
      spySetTimeZone.mockClear()
      spyInitializeLights.mockClear()
      spySetAccessPointNameOrPassword.mockClear()
      spyLoggerError.mockClear()
      spyGetFocus.mockClear()
      spySetFocus.mockClear()
    })

    afterAll(() => {
      spyReadSettingsFile.mockRestore()
      spyWriteSettingsFile.mockRestore()
      spyGetAvailableTimeZones.mockRestore()
      spyGetSystemTime.mockRestore()
      spySetSystemAndRtcTime.mockRestore()
      spyGetTimeZone.mockRestore()
      spySetTimeZone.mockRestore()
      spyInitializeLights.mockRestore()
      spySetAccessPointNameOrPassword.mockRestore()
      spyGetAccessPointPassword.mockRestore()
      spyGetFocus.mockRestore()
      spySetFocus.mockRestore()
      spyLoggerError.mockRestore()
    })

    it('getAllSettings returns default focus without throwing when camera is unreachable', async () => {
      const settings = await serviceUnderTest.getAllSettings()
      expect(settings.camera.focus).toBe(0)
      expect(settings.camera.focusMinimum).toBe(Number.MIN_SAFE_INTEGER)
      expect(settings.camera.focusMaximum).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('PATCH persists non-focus settings and reports camera unreachable', async () => {
      await expect(
        serviceUnderTest.updateSettings({
          general: { deviceName: 'new' },
          camera: { focus: 100 },
        }),
      ).rejects.toThrow(ServiceUnavailableException)
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.objectContaining({
          general: expect.objectContaining({ deviceName: 'new' }),
        }),
        expect.any(String),
      )
    })

    it('PATCH camera-only 503 message names the camera, not Motion', async () => {
      await expect(
        serviceUnderTest.updateSettings({ camera: { focus: 100 } }),
      ).rejects.toThrow('camera is unreachable')
    })

    it('PUT all settings persists JSON and runs setTimeZone when camera is unreachable', async () => {
      const spyConfigureWittyPiSchedule = vi
        .spyOn(SleepInteractor, 'configureWittyPiSchedule')
        .mockResolvedValue()
      const settings: SettingsPutDto = {
        camera: {
          focus: 100,
          light: 'visible',
          pictureQuality: 80,
          shotTypes: ['pictures'],
          videoQuality: 60,
        },
        general: {
          deviceName: 'd',
          isAlternatingLightModeEnabled: false,
          latitude: 1,
          locationAccuracy: 3,
          longitude: 2,
          password: '12345678',
          siteName: 's',
          systemTime: '2022-01-18T14:48:37+01:00',
          timeZone: 't1',
        },
        triggering: {
          light: 'infrared',
          sleepingTime: { hour: 10, minute: 12 },
          temperatureThreshold: 10,
          threshold: 1,
          useSunriseAndSunsetTimes: false,
          wakingUpTime: { hour: 10, minute: 17 },
        },
      }
      await expect(
        serviceUnderTest.updateAllSettings(settings),
      ).rejects.toThrow(ServiceUnavailableException)
      expect(spyWriteSettingsFile).toHaveBeenCalled()
      expect(spySetTimeZone).toHaveBeenCalledWith('t1')
      spyConfigureWittyPiSchedule.mockRestore()
    })

    it('out-of-range focus still throws BadRequestException when camera is responsive', async () => {
      spyGetFocus.mockResolvedValueOnce({ min: 0, max: 100 })
      await expect(
        serviceUnderTest.updateSettings({ camera: { focus: 999 } }),
      ).rejects.toThrow(BadRequestException)
    })

    it('non-CommandExecutionException from getFocus still propagates', async () => {
      const unexpectedError = new Error('unexpected driver error')
      spyGetFocus.mockRejectedValueOnce(unexpectedError)
      await expect(
        serviceUnderTest.updateSettings({ camera: { focus: 100 } }),
      ).rejects.toThrow(unexpectedError)
    })
  })
})
