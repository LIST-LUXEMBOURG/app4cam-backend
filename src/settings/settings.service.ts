import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { DateTime } from 'luxon'
import { InitialisationInteractor } from '../initialisation-interactor'
import { MotionClient } from '../motion-client'
import { PropertiesService } from '../properties/properties.service'
import { AccessPointInteractor } from './interactors/access-point-interactor'
import { SleepInteractor } from './interactors/sleep-interactor'
import { SystemTimeInteractor } from './interactors/system-time-interactor'
import { MotionTextAssembler } from './motion-text-assembler'
import { MotionVideoParametersWorker } from './motion-video-parameters-worker'
import {
  LightType,
  PatchableSettings,
  Settings,
  SettingsFromJsonFile,
} from './settings'
import { SettingsFileProvider } from './settings-file-provider'
import { UndefinedPathError } from './undefined-path-error'

const MOTION_FOCUS_DIFFERENCE_VISIBLE_INFRARED_LIGHTS = 150
const MOTION_VIDEO_PARAMS_FOCUS_KEY = 'Focus (absolute)'
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
    const password = await AccessPointInteractor.getAccessPointPassword(
      isRaspberryPi,
      this.logger,
    )
    const systemTime = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    const timeZone = await SystemTimeInteractor.getTimeZone()

    const shotTypes = []
    let focus = 0
    let pictureQuality = 0
    let threshold = 1
    let videoQuality = 0
    try {
      focus = await this.getFocusFromMotionAdaptedToCameraLight(
        settingsFromFile.camera.light,
      )
      pictureQuality = await MotionClient.getPictureQuality()
      threshold = await MotionClient.getThreshold()
      videoQuality = await MotionClient.getMovieQuality()

      const pictureOutput = await MotionClient.getPictureOutput()
      if (pictureOutput === 'best') {
        shotTypes.push('pictures')
      }
      const movieOutput = await MotionClient.getMovieOutput()
      if (movieOutput === 'on') {
        shotTypes.push('videos')
      }
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
        pictureQuality,
        shotTypes,
        videoQuality,
      },
      general: {
        ...settingsFromFile.general,
        password,
        systemTime,
        timeZone,
      },
      triggering: {
        ...settingsFromFile.triggering,
        threshold,
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

    if ('triggering' in settings) {
      if (
        ('sleepingTime' in settings.triggering &&
          !('wakingUpTime' in settings.triggering)) ||
        (!('sleepingTime' in settings.triggering) &&
          'wakingUpTime' in settings.triggering)
      ) {
        throw new BadRequestException(
          'Sleeping and waking up times must be given at the same time.',
        )
      }

      if (
        (settings.triggering.sleepingTime &&
          !settings.triggering.wakingUpTime) ||
        (!settings.triggering.sleepingTime && settings.triggering.wakingUpTime)
      ) {
        throw new BadRequestException(
          'Sleeping and waking up times can only be empty at the same time.',
        )
      }
    }

    let isAtLeastOneJsonSettingUpdated = false
    const settingsReadFromFile =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)

    const cameraSettingsMerged = settingsReadFromFile.camera
    if ('camera' in settings) {
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
        await this.setFocusInMotionAdaptedToCameraLight(
          settings.camera.focus,
          cameraSettingsMerged.light,
        )
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
        await SystemTimeInteractor.setSystemAndRtcTimeInIso8601Format(
          settings.general.systemTime,
          this.deviceType,
          this.logger,
        )
      }

      if ('timeZone' in settings.general) {
        await SystemTimeInteractor.setTimeZone(settings.general.timeZone)
      }

      const newGeneralSettings: Partial<SettingsFromJsonFile['general']> = {}

      if ('deviceName' in settings.general) {
        newGeneralSettings.deviceName = settings.general.deviceName
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
          timeZone = await SystemTimeInteractor.getTimeZone()
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
        const isRaspberryPi = this.deviceType === 'RaspberryPi'
        await AccessPointInteractor.setAccessPointNameOrPassword(
          settings.general.deviceName,
          settings.general.password,
          isRaspberryPi,
          this.logger,
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

      if ('wakingUpTime' in settings.triggering) {
        newTriggeringSettings.wakingUpTime = settings.triggering.wakingUpTime
      }

      if (
        'light' in settings.triggering &&
        settings.triggering.light != settingsReadFromFile.triggering.light
      ) {
        newTriggeringSettings.light = settings.triggering.light

        const serviceName = this.configService.get<string>('serviceName')
        const deviceType = this.configService.get<string>('deviceType')
        await InitialisationInteractor.resetLights(
          serviceName,
          deviceType,
          newTriggeringSettings.light,
        )
      }

      if (Object.keys(newTriggeringSettings).length > 0) {
        // Only if there is an object property to update, do the reading and writing.

        isAtLeastOneJsonSettingUpdated = true
        triggeringSettingsMerged = {
          ...triggeringSettingsMerged,
          ...newTriggeringSettings,
        }
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
    }

    return settings
  }

  async updateAllSettings(settings: Settings): Promise<void> {
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

    await SystemTimeInteractor.setSystemAndRtcTimeInIso8601Format(
      settings.general.systemTime,
      this.deviceType,
      this.logger,
    )

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
      await this.setFocusInMotionAdaptedToCameraLight(
        settings.camera.focus,
        settings.camera.light,
      )

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
      const serviceName = this.configService.get<string>('serviceName')
      const deviceType = this.configService.get<string>('deviceType')
      await InitialisationInteractor.resetLights(
        serviceName,
        deviceType,
        settings.triggering.light,
      )
    }

    const settingsToWriteToFile: SettingsFromJsonFile = {
      camera: {
        light: settings.camera.light,
      },
      general: {
        deviceName: settings.general.deviceName,
        siteName: settings.general.siteName,
      },
      triggering: {
        sleepingTime: settings.triggering.sleepingTime,
        wakingUpTime: settings.triggering.wakingUpTime,
        light: settings.triggering.light,
      },
    }
    await SettingsFileProvider.writeSettingsToFile(
      settingsToWriteToFile,
      SETTINGS_FILE_PATH,
    )

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

    const isRaspberryPi = this.deviceType === 'RaspberryPi'
    await AccessPointInteractor.setAccessPointNameOrPassword(
      settings.general.deviceName,
      settings.general.password,
      isRaspberryPi,
      this.logger,
    )
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
    const timeZone = await SystemTimeInteractor.getTimeZone()
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

    const timeZone = await SystemTimeInteractor.getTimeZone()
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

    const isRaspberryPi = this.deviceType === 'RaspberryPi'
    await AccessPointInteractor.setAccessPointNameOrPassword(
      deviceName,
      undefined,
      isRaspberryPi,
      this.logger,
    )
  }

  async getSystemTime(): Promise<string> {
    const time = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    return time
  }

  async setSystemTime(systemTime: string): Promise<void> {
    await SystemTimeInteractor.setSystemAndRtcTimeInIso8601Format(
      systemTime,
      this.deviceType,
      this.logger,
    )
  }

  async getTimeZone(): Promise<string> {
    const timeZone = await SystemTimeInteractor.getTimeZone()
    return timeZone
  }

  async setTimeZone(timeZone: string): Promise<void> {
    const supportedTimeZones =
      await this.propertiesService.getAvailableTimeZones()
    if (!supportedTimeZones.includes(timeZone)) {
      throw new BadRequestException(
        `The time zone '${timeZone}' is not supported.`,
      )
    }
    await SystemTimeInteractor.setTimeZone(timeZone)
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
      throw new UndefinedPathError()
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

  async getSleepingTime(): Promise<string> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.triggering.sleepingTime
  }

  async getWakingUpTime(): Promise<string> {
    const settings =
      await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
    return settings.triggering.wakingUpTime
  }

  @Cron('* * * * *') // every 1 minute
  async sleepWhenItIsTime() {
    this.logger.log('Cron job to go to sleep when it is time triggered...')
    const sleepingTime = await this.getSleepingTime()
    if (!sleepingTime) {
      this.logger.log('No sleeping time set.')
      return
    }
    const sleepingTimeHours = parseInt(sleepingTime.substring(0, 2))
    const sleepingTimeMinutes = parseInt(sleepingTime.substring(3))
    const now = new Date()
    if (
      sleepingTimeHours === now.getHours() &&
      sleepingTimeMinutes === now.getMinutes()
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
      const wakingUpTimeHours = parseInt(wakingUpTime.substring(0, 2))
      const wakingUpTimeMinutes = parseInt(wakingUpTime.substring(3))
      let wakingUpDateTime = DateTime.now().set({
        hour: wakingUpTimeHours,
        minute: wakingUpTimeMinutes,
      })
      if (wakingUpTime < sleepingTime) {
        wakingUpDateTime = wakingUpDateTime.plus({ days: 1 })
      }
      SleepInteractor.triggerSleeping(wakingUpDateTime.toISO(), this.logger)
    } else {
      this.logger.log('Not time to sleep yet.')
    }
  }
}
