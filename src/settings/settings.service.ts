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
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { DateTime } from 'luxon'
import { FileNamer } from '../files/file-namer'
import { InitialisationInteractor } from '../initialisation-interactor'
import { MotionClient } from '../motion-client'
import { PropertiesService } from '../properties/properties.service'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'
import { SettingsPutDto, TriggeringTimeDto } from './dto/settings.dto'
import {
  LightType,
  PatchableSettings,
  Settings,
  SettingsFromJsonFile,
  TriggeringTime,
} from './entities/settings'
import { ShotTypes } from './entities/shot-types'
import { UndefinedPathException } from './exceptions/UndefinedPathException'
import { AccessPointInteractor } from './interactors/access-point-interactor'
import { SleepInteractor } from './interactors/sleep-interactor'
import { SystemTimeInteractor } from './interactors/system-time-interactor'
import { TemperatureInteractor } from './interactors/temperature-interactor'
import { VideoDeviceInteractor } from './interactors/video-device-interactor'
import { MotionTextAssembler } from './motion-text-assembler'
import { MotionVideoParametersWorker } from './motion-video-parameters-worker'
import { SettingsFileProvider } from './settings-file-provider'

const MOTION_FOCUS_DIFFERENCE_VISIBLE_INFRARED_LIGHTS = 150
const MOTION_VIDEO_PARAMS_FOCUS_KEY = 'Focus (absolute)'
const RASPBERRY_PI_FOCUS_DEVICE_PATH = '/dev/v4l-subdev1'
const SETTINGS_FILE_PATH = 'settings.json'

@Injectable()
export class SettingsService {
  private readonly deviceType: string
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly propertiesService: PropertiesService,
  ) {
    this.deviceType = this.configService.get<string>('deviceType')
  }

  async getAllSettings(): Promise<Settings> {
    const settingsFromFile =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)

    const isRaspberryPi = this.deviceType === 'RaspberryPi'

    const password = await this.getAccessPointPassword()
    const systemTime = await this.getSystemTime()
    const timeZone = await this.getTimeZone()

    let shotTypes: ShotTypes = new Set()
    let focus = 0
    let focusMaximum = Number.MAX_SAFE_INTEGER
    let focusMinimum = Number.MIN_SAFE_INTEGER
    let pictureQuality = 0
    let threshold = 1
    let thresholdMaximum = Number.MAX_SAFE_INTEGER
    let videoQuality = 0
    try {
      const focusValues = await this.getFocusFromDriver()
      focusMaximum = focusValues.max
      focusMinimum = focusValues.min
      if (isRaspberryPi) {
        focus = focusValues.value
      } else {
        focus = await this.getFocusFromMotionAdaptedToCameraLight(
          settingsFromFile.camera.light,
        )
      }

      pictureQuality = await MotionClient.getPictureQuality()
      threshold = await MotionClient.getThreshold()
      videoQuality = await MotionClient.getMovieQuality()

      shotTypes = await this.getShotTypes()

      const height = await MotionClient.getHeight()
      const width = await MotionClient.getWidth()
      thresholdMaximum = height * width
    } catch (error) {
      if (error.config && error.config.url) {
        this.logger.error(`Could not connect to ${error.config.url}`)
      }
      if (error.code !== 'ECONNREFUSED') {
        throw error
      }
    }

    return {
      camera: {
        ...settingsFromFile.camera,
        focus,
        isLightEnabled: !isRaspberryPi,
        focusMaximum,
        focusMinimum,
        pictureQuality,
        shotTypes: Array.from(shotTypes),
        videoQuality,
      },
      general: {
        deviceName: undefined,
        latitude: undefined,
        locationAccuracy: undefined,
        longitude: undefined,
        siteName: undefined,
        ...settingsFromFile.general,
        password,
        systemTime,
        timeZone,
      },
      triggering: {
        sleepingTime: undefined,
        temperatureThreshold: undefined,
        wakingUpTime: undefined,
        ...settingsFromFile.triggering,
        isLightEnabled: !isRaspberryPi,
        isTemperatureThresholdEnabled: isRaspberryPi,
        threshold,
        thresholdMaximum,
      },
    }
  }

  async updateSettings(
    settings: PatchableSettings,
  ): Promise<PatchableSettings> {
    if (
      'camera' in settings &&
      'triggering' in settings &&
      'light' in settings.camera &&
      'light' in settings.triggering &&
      settings.camera.light === 'infrared' &&
      settings.triggering.light === 'visible'
    ) {
      throw new BadRequestException(
        'The combination of visible trigger light and infrared camera light is not valid.',
      )
    }

    if ('general' in settings && 'timeZone' in settings.general) {
      const supportedTimeZones =
        await this.propertiesService.getAvailableTimeZones()
      if (!supportedTimeZones.includes(settings.general.timeZone)) {
        throw new BadRequestException(
          `The time zone '${settings.general.timeZone}' is not supported.`,
        )
      }
    }

    const settingsReadFromFile =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)

    if ('triggering' in settings) {
      if (
        ('sleepingTime' in settings.triggering &&
          'wakingUpTime' in settings.triggering &&
          ((settings.triggering.sleepingTime === null &&
            settings.triggering.wakingUpTime !== null) ||
            (settings.triggering.sleepingTime !== null &&
              settings.triggering.wakingUpTime === null))) ||
        ('sleepingTime' in settings.triggering &&
          !('wakingUpTime' in settings.triggering) &&
          settings.triggering.sleepingTime === null) ||
        ('wakingUpTime' in settings.triggering &&
          !('sleepingTime' in settings.triggering) &&
          settings.triggering.wakingUpTime === null)
      ) {
        throw new BadRequestException(
          'Both waking up and sleeping times can only be reset at the same time.',
        )
      }
      if (
        !settingsReadFromFile.triggering.wakingUpTime &&
        !settingsReadFromFile.triggering.sleepingTime &&
        (('sleepingTime' in settings.triggering &&
          !('wakingUpTime' in settings.triggering)) ||
          ('wakingUpTime' in settings.triggering &&
            !('sleepingTime' in settings.triggering)))
      ) {
        throw new BadRequestException(
          'Both waking up and sleeping times must be given.',
        )
      }

      if ('threshold' in settings.triggering) {
        const height = await MotionClient.getHeight()
        const width = await MotionClient.getWidth()
        if (settings.triggering.threshold > height * width) {
          throw new BadRequestException(
            'The threshold must be smaller or equal to the resolution.',
          )
        }
      }
    }

    let isAtLeastOneJsonSettingUpdated = false

    const cameraSettingsMerged = settingsReadFromFile.camera
    if ('camera' in settings) {
      if ('focus' in settings.camera) {
        const focusValues = await this.getFocusFromDriver()
        if (
          settings.camera.focus < focusValues.min ||
          settings.camera.focus > focusValues.max
        ) {
          throw new BadRequestException(
            `The focus value must be in the range ${focusValues.min} to ${focusValues.max}.`,
          )
        }
      }

      if (
        'light' in settings.camera &&
        settings.camera.light != settingsReadFromFile.camera.light
      ) {
        cameraSettingsMerged.light = settings.camera.light
        isAtLeastOneJsonSettingUpdated = true
      }
      if (
        ('light' in settings.camera &&
          settings.camera.light != settingsReadFromFile.camera.light) ||
        'focus' in settings.camera
      ) {
        if (this.deviceType === 'RaspberryPi') {
          await this.setFocusInDriver(settings.camera.focus)
        } else {
          await this.setFocusInMotionAdaptedToCameraLight(
            settings.camera.focus,
            cameraSettingsMerged.light,
          )
        }
      }

      if ('pictureQuality' in settings.camera) {
        await MotionClient.setPictureQuality(settings.camera.pictureQuality)
      }
      if ('videoQuality' in settings.camera) {
        await MotionClient.setMovieQuality(settings.camera.videoQuality)
      }

      if ('shotTypes' in settings.camera) {
        try {
          if (settings.camera.shotTypes.includes('pictures')) {
            await MotionClient.setPictureOutput('best')
          } else {
            await MotionClient.setPictureOutput('off')
          }
          if (settings.camera.shotTypes.includes('videos')) {
            await MotionClient.setMovieOutput('on')
          } else {
            await MotionClient.setMovieOutput('off')
          }
        } catch (error) {
          if (error.config && error.config.url) {
            this.logger.error(`Could not connect to ${error.config.url}`)
          }
          if (error.code !== 'ECONNREFUSED') {
            throw error
          }
        }
      }
    }

    let generalSettingsMerged = settingsReadFromFile.general
    if ('general' in settings) {
      if ('systemTime' in settings.general) {
        await this.setSystemTime(settings.general.systemTime)
      }

      if ('timeZone' in settings.general) {
        await SystemTimeInteractor.setTimeZone(settings.general.timeZone)
      }

      const newGeneralSettings: Partial<SettingsFromJsonFile['general']> = {}

      if ('deviceName' in settings.general) {
        newGeneralSettings.deviceName = settings.general.deviceName
      }

      if ('latitude' in settings.general) {
        newGeneralSettings.latitude = settings.general.latitude
      }

      if ('locationAccuracy' in settings.general) {
        newGeneralSettings.locationAccuracy = settings.general.locationAccuracy
      }

      if ('longitude' in settings.general) {
        newGeneralSettings.longitude = settings.general.longitude
      }

      if ('siteName' in settings.general) {
        newGeneralSettings.siteName = settings.general.siteName
      }

      if (Object.keys(newGeneralSettings).length > 0) {
        // Only if there is an object property to update, do the writing.

        isAtLeastOneJsonSettingUpdated = true
        generalSettingsMerged = {
          ...generalSettingsMerged,
          ...newGeneralSettings,
        }

        let timeZone
        if ('timeZone' in settings.general) {
          timeZone = settings.general.timeZone
        } else {
          timeZone = await this.getTimeZone()
        }
        const filename = MotionTextAssembler.createFilename(
          generalSettingsMerged.siteName,
          generalSettingsMerged.deviceName,
          timeZone,
        )
        await MotionClient.setFilename(filename)

        if (
          'deviceName' in settings.general ||
          'siteName' in settings.general
        ) {
          const imageText = MotionTextAssembler.createImageText(
            generalSettingsMerged.siteName,
            generalSettingsMerged.deviceName,
          )
          await MotionClient.setLeftTextOnImage(imageText)
        }
      }

      if ('deviceName' in settings.general || 'password' in settings.general) {
        await this.setAccessPointNameOrPassword(
          settings.general.deviceName,
          settings.general.password,
        )
      }
    }

    let triggeringSettingsMerged = settingsReadFromFile.triggering
    if ('triggering' in settings) {
      const newTriggeringSettings: Partial<SettingsFromJsonFile['triggering']> =
        {}

      if ('sleepingTime' in settings.triggering) {
        newTriggeringSettings.sleepingTime = settings.triggering.sleepingTime
      }

      if ('temperatureThreshold' in settings.triggering) {
        newTriggeringSettings.temperatureThreshold =
          settings.triggering.temperatureThreshold
      }

      if ('wakingUpTime' in settings.triggering) {
        newTriggeringSettings.wakingUpTime = settings.triggering.wakingUpTime
      }

      if (
        'light' in settings.triggering &&
        settings.triggering.light != settingsReadFromFile.triggering.light
      ) {
        newTriggeringSettings.light = settings.triggering.light

        const deviceType = this.configService.get<string>('deviceType')
        try {
          await InitialisationInteractor.resetLights(
            deviceType,
            newTriggeringSettings.light,
          )
        } catch (error) {
          if (!(error instanceof CommandUnavailableOnWindowsException)) {
            throw error
          }
        }
      }

      if (Object.keys(newTriggeringSettings).length > 0) {
        // Only if there is an object property to update, do the reading and writing.

        isAtLeastOneJsonSettingUpdated = true
        triggeringSettingsMerged = {
          ...triggeringSettingsMerged,
          ...newTriggeringSettings,
        }
      }

      if (this.deviceType === 'RaspberryPi') {
        this.configureWittyPiSchedule(
          triggeringSettingsMerged.sleepingTime,
          triggeringSettingsMerged.wakingUpTime,
        )
      }

      if ('threshold' in settings.triggering) {
        try {
          await MotionClient.setThreshold(settings.triggering.threshold)
        } catch (error) {
          if (error.config && error.config.url) {
            this.logger.error(`Could not connect to ${error.config.url}`)
          }
          if (error.code !== 'ECONNREFUSED') {
            throw error
          }
        }
      }
    }

    if (isAtLeastOneJsonSettingUpdated) {
      const settingsToUpdate = {
        camera: cameraSettingsMerged,
        general: generalSettingsMerged,
        triggering: triggeringSettingsMerged,
      }
      await SettingsFileProvider.writeSettingsToFile(
        settingsToUpdate,
        SETTINGS_FILE_PATH,
      )
      await this.storeSettingsFileToShotsFolder(settingsToUpdate)
    }

    return settings
  }

  async updateAllSettings(settings: SettingsPutDto): Promise<void> {
    if (
      settings.camera.light === 'infrared' &&
      settings.triggering.light === 'visible'
    ) {
      throw new BadRequestException(
        'The combination of visible trigger light and infrared camera light is not valid.',
      )
    }

    const supportedTimeZones =
      await this.propertiesService.getAvailableTimeZones()
    if (!supportedTimeZones.includes(settings.general.timeZone)) {
      throw new BadRequestException(
        `The time zone '${settings.general.timeZone}' is not supported.`,
      )
    }

    if (
      (settings.triggering.sleepingTime && !settings.triggering.wakingUpTime) ||
      (!settings.triggering.sleepingTime && settings.triggering.wakingUpTime)
    ) {
      throw new BadRequestException(
        'Sleeping and waking up times can only be empty at the same time.',
      )
    }

    if ('threshold' in settings.triggering) {
      const height = await MotionClient.getHeight()
      const width = await MotionClient.getWidth()
      if (settings.triggering.threshold > height * width) {
        throw new BadRequestException(
          'The threshold must be smaller or equal to the resolution.',
        )
      }
    }

    const isRaspberryPi = this.deviceType === 'RaspberryPi'

    if ('camera' in settings && 'focus' in settings.camera) {
      const focusValues = await this.getFocusFromDriver()
      if (
        settings.camera.focus < focusValues.min ||
        settings.camera.focus > focusValues.max
      ) {
        throw new BadRequestException(
          `The focus value must be in the range ${focusValues.min} to ${focusValues.max}.`,
        )
      }
    }

    await this.setSystemTime(settings.general.systemTime)

    await SystemTimeInteractor.setTimeZone(settings.general.timeZone)

    if ('shotTypes' in settings.camera) {
      try {
        if (settings.camera.shotTypes.includes('pictures')) {
          await MotionClient.setPictureOutput('best')
        } else {
          await MotionClient.setPictureOutput('off')
        }
        if (settings.camera.shotTypes.includes('videos')) {
          await MotionClient.setMovieOutput('on')
        } else {
          await MotionClient.setMovieOutput('off')
        }
      } catch (error) {
        if (error.config && error.config.url) {
          this.logger.error(`Could not connect to ${error.config.url}`)
        }
        if (error.code !== 'ECONNREFUSED') {
          throw error
        }
      }
    }

    try {
      if (isRaspberryPi) {
        await this.setFocusInDriver(settings.camera.focus)
      } else {
        await this.setFocusInMotionAdaptedToCameraLight(
          settings.camera.focus,
          settings.camera.light,
        )
      }

      await MotionClient.setPictureQuality(settings.camera.pictureQuality)
      await MotionClient.setMovieQuality(settings.camera.videoQuality)
      await MotionClient.setThreshold(settings.triggering.threshold)
    } catch (error) {
      if (error.config && error.config.url) {
        this.logger.error(`Could not connect to ${error.config.url}`)
      }
      if (error.code !== 'ECONNREFUSED') {
        throw error
      }
    }

    const currentSettings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    if (currentSettings.triggering.light != settings.triggering.light) {
      const deviceType = this.configService.get<string>('deviceType')
      try {
        await InitialisationInteractor.resetLights(
          deviceType,
          settings.triggering.light,
        )
      } catch (error) {
        if (!(error instanceof CommandUnavailableOnWindowsException)) {
          throw error
        }
      }
    }

    if (this.deviceType === 'RaspberryPi') {
      this.configureWittyPiSchedule(
        settings.triggering.sleepingTime,
        settings.triggering.wakingUpTime,
      )
    }

    const settingsToWriteToFile: SettingsFromJsonFile = {
      camera: {
        light: settings.camera.light,
      },
      general: {
        deviceName: settings.general.deviceName,
        latitude: settings.general.latitude,
        locationAccuracy: settings.general.locationAccuracy,
        longitude: settings.general.longitude,
        siteName: settings.general.siteName,
      },
      triggering: {
        light: settings.triggering.light,
        sleepingTime: settings.triggering.sleepingTime,
        temperatureThreshold: settings.triggering.temperatureThreshold,
        wakingUpTime: settings.triggering.wakingUpTime,
      },
    }
    await SettingsFileProvider.writeSettingsToFile(
      settingsToWriteToFile,
      SETTINGS_FILE_PATH,
    )
    await this.storeSettingsFileToShotsFolder(settingsToWriteToFile)

    const filename = MotionTextAssembler.createFilename(
      settings.general.siteName,
      settings.general.deviceName,
      settings.general.timeZone,
    )
    await MotionClient.setFilename(filename)

    const imageText = MotionTextAssembler.createImageText(
      settings.general.siteName,
      settings.general.deviceName,
    )
    await MotionClient.setLeftTextOnImage(imageText)

    await SystemTimeInteractor.setTimeZone(settings.general.timeZone)

    await this.setAccessPointNameOrPassword(
      settings.general.deviceName,
      settings.general.password,
    )
  }

  private async getAccessPointPassword(): Promise<string> {
    const isRaspberryPi = this.deviceType === 'RaspberryPi'
    try {
      const password = await AccessPointInteractor.getAccessPointPassword(
        isRaspberryPi,
        this.logger,
      )
      return password
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return '<not supported on Windows>'
      } else {
        throw error
      }
    }
  }

  private async configureWittyPiSchedule(
    sleepingTime: TriggeringTimeDto,
    wakingUpTime: TriggeringTimeDto,
  ): Promise<void> {
    try {
      await SleepInteractor.configureWittyPiSchedule(sleepingTime, wakingUpTime)
    } catch (error) {
      if (!(error instanceof CommandUnavailableOnWindowsException)) {
        throw error
      }
    }
  }

  private async getFocusFromMotionAdaptedToCameraLight(
    light: LightType,
  ): Promise<number> {
    const videoParametersString = await MotionClient.getVideoParams()
    const videoParameters = MotionVideoParametersWorker.convertStringToObject(
      videoParametersString,
    )
    if (
      !Object.prototype.hasOwnProperty.call(
        videoParameters,
        MOTION_VIDEO_PARAMS_FOCUS_KEY,
      )
    ) {
      return 0
    }
    const focus = videoParameters[MOTION_VIDEO_PARAMS_FOCUS_KEY]
    let focusAdaptedToLight = focus
    if (light === 'infrared') {
      focusAdaptedToLight += MOTION_FOCUS_DIFFERENCE_VISIBLE_INFRARED_LIGHTS
    }
    return focusAdaptedToLight
  }

  private async setFocusInMotionAdaptedToCameraLight(
    focus: number,
    light: LightType,
  ) {
    let focusAdaptedToLight = focus
    if (light === 'infrared') {
      focusAdaptedToLight -= MOTION_FOCUS_DIFFERENCE_VISIBLE_INFRARED_LIGHTS
    }
    const videoParametersString = await MotionClient.getVideoParams()
    const videoParameters = MotionVideoParametersWorker.convertStringToObject(
      videoParametersString,
    )
    videoParameters[MOTION_VIDEO_PARAMS_FOCUS_KEY] = focusAdaptedToLight
    const newVideoParametersString =
      MotionVideoParametersWorker.convertObjectToString(videoParameters)
    await MotionClient.setVideoParams(newVideoParametersString)
  }

  private async getFocusFromDriver() {
    let devicePath = RASPBERRY_PI_FOCUS_DEVICE_PATH
    if (this.deviceType !== 'RaspberryPi') {
      devicePath = await MotionClient.getVideoDevice()
    }
    try {
      const focus = await VideoDeviceInteractor.getFocus(devicePath)
      return focus
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return { value: 0 }
      }
      throw error
    }
  }

  private async setFocusInDriver(focus: number) {
    let devicePath = RASPBERRY_PI_FOCUS_DEVICE_PATH
    if (this.deviceType !== 'RaspberryPi') {
      devicePath = await MotionClient.getVideoDevice()
    }
    try {
      await VideoDeviceInteractor.setFocus(devicePath, focus)
    } catch (error) {
      if (!(error instanceof CommandUnavailableOnWindowsException)) {
        throw error
      }
    }
  }

  async storeSettingsFileToShotsFolder(
    settings: SettingsFromJsonFile,
  ): Promise<void> {
    const now = new Date()
    const deviceName = await this.getDeviceName()
    const siteName = await this.getSiteName()
    const timeZone = await this.getTimeZone()
    const settingsFilename = FileNamer.createFilename(
      now,
      deviceName,
      siteName,
      '_automatically-exported-settings.json',
      timeZone,
    )
    const shotsFolderPath = await this.getShotsFolder()
    const settingsFileInShotsFolderPath = `${shotsFolderPath}/${settingsFilename}`
    await SettingsFileProvider.writeSettingsToFile(
      settings,
      settingsFileInShotsFolderPath,
    )
  }

  async getShotTypes(): Promise<ShotTypes> {
    const shotTypes: ShotTypes = new Set()
    const pictureOutput = await MotionClient.getPictureOutput()
    if (pictureOutput === 'best') {
      shotTypes.add('pictures')
    }
    const movieOutput = await MotionClient.getMovieOutput()
    if (movieOutput === 'on') {
      shotTypes.add('videos')
    }
    return shotTypes
  }

  async getSiteName(): Promise<string> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.general.siteName
  }

  async setSiteName(siteName: string): Promise<void> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    settings.general.siteName = siteName
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
    const timeZone = await this.getTimeZone()
    const filename = MotionTextAssembler.createFilename(
      siteName,
      settings.general.deviceName,
      timeZone,
    )
    await MotionClient.setFilename(filename)
    const imageText = MotionTextAssembler.createImageText(
      siteName,
      settings.general.deviceName,
    )
    await MotionClient.setLeftTextOnImage(imageText)
  }

  async getDeviceName(): Promise<string> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.general.deviceName
  }

  async setDeviceName(deviceName: string): Promise<void> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    settings.general.deviceName = deviceName
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)

    const timeZone = await this.getTimeZone()
    const filename = MotionTextAssembler.createFilename(
      settings.general.siteName,
      deviceName,
      timeZone,
    )
    await MotionClient.setFilename(filename)

    const imageText = MotionTextAssembler.createImageText(
      settings.general.siteName,
      deviceName,
    )
    await MotionClient.setLeftTextOnImage(imageText)

    await this.setAccessPointNameOrPassword(deviceName)
  }

  async setAccessPointNameOrPassword(
    name: string,
    password: string = undefined,
  ): Promise<void> {
    const isRaspberryPi = this.deviceType === 'RaspberryPi'
    try {
      await AccessPointInteractor.setAccessPointNameOrPassword(
        name,
        password,
        isRaspberryPi,
        this.logger,
      )
    } catch (error) {
      if (!(error instanceof CommandUnavailableOnWindowsException)) {
        throw error
      }
    }
  }

  async getSystemTime(): Promise<string> {
    try {
      const time = await SystemTimeInteractor.getSystemTimeInIso8601Format()
      return time
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return ''
      }
      throw error
    }
  }

  async setSystemTime(systemTime: string): Promise<void> {
    try {
      await SystemTimeInteractor.setSystemAndRtcTimeInIso8601Format(
        systemTime,
        this.deviceType,
        this.logger,
      )
    } catch (error) {
      if (!(error instanceof CommandUnavailableOnWindowsException)) {
        throw error
      }
    }
  }

  async getTimeZone(): Promise<string> {
    try {
      const timeZone = await SystemTimeInteractor.getTimeZone()
      return timeZone
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return ''
      }
      throw error
    }
  }

  async setTimeZone(timeZone: string): Promise<void> {
    const supportedTimeZones =
      await this.propertiesService.getAvailableTimeZones()
    if (!supportedTimeZones.includes(timeZone)) {
      throw new BadRequestException(
        `The time zone '${timeZone}' is not supported.`,
      )
    }
    try {
      await SystemTimeInteractor.setTimeZone(timeZone)
    } catch (error) {
      if (!(error instanceof CommandUnavailableOnWindowsException)) {
        throw error
      }
    }
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    const filename = MotionTextAssembler.createFilename(
      settings.general.siteName,
      settings.general.deviceName,
      timeZone,
    )
    await MotionClient.setFilename(filename)
  }

  async getShotsFolder(): Promise<string> {
    const shotsFolder = await MotionClient.getTargetDir()
    return shotsFolder
  }

  async setShotsFolder(path: string): Promise<void> {
    if (!path) {
      this.logger.warn('The path to set as shots folder is not defined.')
      throw new UndefinedPathException()
    }
    await MotionClient.setTargetDir(path)
  }

  async getCameraLight(): Promise<LightType> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.camera.light
  }

  async getTriggeringLight(): Promise<LightType> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.triggering.light
  }

  async getSleepingTime(): Promise<TriggeringTime> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.triggering.sleepingTime
  }

  async getWakingUpTime(): Promise<TriggeringTime> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.triggering.wakingUpTime
  }

  async isTemperatureBelowThreshold(): Promise<boolean> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    const threshold = settings.triggering.temperatureThreshold
    const currentTemperature =
      await TemperatureInteractor.getCurrentTemperature()
    return currentTemperature < threshold
  }

  @Cron('* * * * *') // every 1 minute
  async sleepWhenItIsTime() {
    this.logger.log('Cron job to go to sleep when it is time triggered...')
    if (this.deviceType === 'RaspberryPi') {
      this.logger.log('Exiting cron job as device type does not need it.')
      return
    }
    const sleepingTime = await this.getSleepingTime()
    if (!sleepingTime) {
      this.logger.log('No sleeping time set.')
      return
    }
    const now = new Date()
    if (
      sleepingTime.hour === now.getHours() &&
      sleepingTime.minute === now.getMinutes()
    ) {
      this.logger.log('It is time to sleep. Good night!')
      const wakingUpTime = await this.getWakingUpTime()
      if (!wakingUpTime) {
        this.logger.error('No waking up time set, but a sleeping time is set.')
        return
      }
      if (wakingUpTime == sleepingTime) {
        this.logger.error(
          'The waking up time cannot be the same as the sleeping time.',
        )
        return
      }
      let wakingUpDateTime = DateTime.now().set({
        hour: wakingUpTime.hour,
        minute: wakingUpTime.minute,
      })
      if (wakingUpTime < sleepingTime) {
        wakingUpDateTime = wakingUpDateTime.plus({ days: 1 })
      }
      try {
        SleepInteractor.triggerSleeping(wakingUpDateTime.toISO(), this.logger)
      } catch (error) {
        if (!(error instanceof CommandUnavailableOnWindowsException)) {
          throw error
        }
      }
    } else {
      this.logger.log('Not time to sleep yet.')
    }
  }
}
