import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MotionClient } from '../motion-client'
import { MotionTextAssembler } from './motion-text-assembler'
import {
  PatchableSettings,
  Settings,
  SettingsFromJsonFile,
  UpdatableSettings,
} from './settings'
import { SettingsFileProvider } from './settings-file-provider'
import { SystemTimeInteractor } from './system-time-interactor'

const SETTINGS_FILE_PATH = 'settings.json'

@Injectable()
export class SettingsService {
  private readonly deviceType: string
  private readonly logger = new Logger(SettingsService.name)

  constructor(private readonly configService: ConfigService) {
    this.deviceType = this.configService.get<string>('deviceType')
  }

  async getAllSettings(): Promise<Settings> {
    const settingsFromFile = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )

    const systemTime = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    const timeZone = await SystemTimeInteractor.getTimeZone()

    const shotTypes = []
    let pictureQuality = 0
    let videoQuality = 0
    let triggerSensitivity = 0
    try {
      pictureQuality = await MotionClient.getPictureQuality()
      videoQuality = await MotionClient.getMovieQuality()

      const pictureOutput = await MotionClient.getPictureOutput()
      if (pictureOutput === 'best') {
        shotTypes.push('pictures')
      }
      const movieOutput = await MotionClient.getMovieOutput()
      if (movieOutput === 'on') {
        shotTypes.push('videos')
      }

      const height = await MotionClient.getHeight()
      const width = await MotionClient.getWidth()
      const threshold = await MotionClient.getThreshold()
      triggerSensitivity = (100 * threshold) / (height * width)
      this.logger.debug(
        `Calculated trigger sensitivity ${triggerSensitivity} from threshold ${threshold}, height ${height} and width ${width}`,
      )
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
        pictureQuality,
        shotTypes,
        videoQuality,
      },
      general: {
        ...settingsFromFile,
        systemTime,
        timeZone,
      },
      triggering: {
        sensitivity: triggerSensitivity,
      },
    }
  }

  async updateSettings(settings: PatchableSettings): Promise<void> {
    if (
      Object.prototype.hasOwnProperty.call(settings, 'general') &&
      Object.prototype.hasOwnProperty.call(settings.general, 'timeZone')
    ) {
      const supportedTimeZones = await this.getAvailableTimeZones()
      if (!supportedTimeZones.includes(settings.general.timeZone)) {
        throw new BadRequestException(
          `The time zone '${settings.general.timeZone}' is not supported.`,
        )
      }
    }

    if (Object.prototype.hasOwnProperty.call(settings, 'camera')) {
      if (
        Object.prototype.hasOwnProperty.call(settings.camera, 'pictureQuality')
      ) {
        await MotionClient.setPictureQuality(settings.camera.pictureQuality)
      }
      if (
        Object.prototype.hasOwnProperty.call(settings.camera, 'videoQuality')
      ) {
        await MotionClient.setMovieQuality(settings.camera.videoQuality)
      }

      if (Object.prototype.hasOwnProperty.call(settings.camera, 'shotTypes')) {
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

    if (Object.prototype.hasOwnProperty.call(settings, 'general')) {
      if (
        Object.prototype.hasOwnProperty.call(settings.general, 'systemTime')
      ) {
        const isRaspberryPi = this.deviceType === 'RaspberryPi'
        await SystemTimeInteractor.setSystemTimeInIso8601Format(
          settings.general.systemTime,
          isRaspberryPi,
        )
      }

      if (Object.prototype.hasOwnProperty.call(settings.general, 'timeZone')) {
        await SystemTimeInteractor.setTimeZone(settings.general.timeZone)
      }

      const settingsToUpdateInFile: Partial<SettingsFromJsonFile> = {}

      if (
        Object.prototype.hasOwnProperty.call(settings.general, 'deviceName')
      ) {
        settingsToUpdateInFile.deviceName = settings.general.deviceName
      }

      if (Object.prototype.hasOwnProperty.call(settings.general, 'siteName')) {
        settingsToUpdateInFile.siteName = settings.general.siteName
      }

      if (Object.keys(settingsToUpdateInFile).length > 0) {
        // Only if there is an object property to update, do the reading and writing.

        const settingsReadFromFile =
          await SettingsFileProvider.readSettingsFile(SETTINGS_FILE_PATH)
        const settingsMerged = {
          ...settingsReadFromFile,
          ...settingsToUpdateInFile,
        }
        await SettingsFileProvider.writeSettingsToFile(
          settingsMerged,
          SETTINGS_FILE_PATH,
        )

        let timeZone
        if (
          Object.prototype.hasOwnProperty.call(settings.general, 'timeZone')
        ) {
          timeZone = settings.general.timeZone
        } else {
          timeZone = await SystemTimeInteractor.getTimeZone()
        }
        const filename = MotionTextAssembler.createFilename(
          settingsMerged.siteName,
          settingsMerged.deviceName,
          timeZone,
        )
        await MotionClient.setFilename(filename)
        if (
          Object.prototype.hasOwnProperty.call(
            settings.general,
            'deviceName',
          ) ||
          Object.prototype.hasOwnProperty.call(settings.general, 'siteName')
        ) {
          const imageText = MotionTextAssembler.createImageText(
            settingsMerged.siteName,
            settingsMerged.deviceName,
          )
          await MotionClient.setLeftTextOnImage(imageText)
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(settings, 'triggering')) {
      if (
        Object.prototype.hasOwnProperty.call(settings.triggering, 'sensitivity')
      ) {
        try {
          const height = await MotionClient.getHeight()
          const width = await MotionClient.getWidth()
          const threshold = Math.round(
            (settings.triggering.sensitivity * height * width) / 100,
          )
          this.logger.debug(
            `Calculated threshold ${threshold} from trigger sensitivity ${settings.triggering.sensitivity}, height ${height} and width ${width}`,
          )
          await MotionClient.setThreshold(threshold)
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
  }

  async updateAllSettings(settings: UpdatableSettings): Promise<void> {
    const supportedTimeZones = await this.getAvailableTimeZones()
    if (!supportedTimeZones.includes(settings.general.timeZone)) {
      throw new BadRequestException(
        `The time zone '${settings.general.timeZone}' is not supported.`,
      )
    }

    const isRaspberryPi = this.deviceType === 'RaspberryPi'
    await SystemTimeInteractor.setSystemTimeInIso8601Format(
      settings.general.systemTime,
      isRaspberryPi,
    )

    await SystemTimeInteractor.setTimeZone(settings.general.timeZone)

    if (Object.prototype.hasOwnProperty.call(settings.camera, 'shotTypes')) {
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
      await MotionClient.setPictureQuality(settings.camera.pictureQuality)
      await MotionClient.setMovieQuality(settings.camera.videoQuality)

      const height = await MotionClient.getHeight()
      const width = await MotionClient.getWidth()
      const threshold = Math.round(
        (settings.triggering.sensitivity * height * width) / 100,
      )
      this.logger.debug(
        `Calculated threshold ${threshold} from trigger sensitivity ${settings.triggering.sensitivity}, height ${height} and width ${width}`,
      )
      await MotionClient.setThreshold(threshold)
    } catch (error) {
      if (error.config && error.config.url) {
        this.logger.error(`Could not connect to ${error.config.url}`)
      }
      if (error.code !== 'ECONNREFUSED') {
        throw error
      }
    }

    const settingsToWriteFile: SettingsFromJsonFile = {
      deviceName: settings.general.deviceName,
      siteName: settings.general.siteName,
    }

    await SettingsFileProvider.writeSettingsToFile(
      settingsToWriteFile,
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
  }

  async getSiteName(): Promise<string> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    return settings.siteName
  }

  async setSiteName(siteName: string): Promise<void> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings.siteName = siteName
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
    const timeZone = await SystemTimeInteractor.getTimeZone()
    const filename = MotionTextAssembler.createFilename(
      siteName,
      settings.deviceName,
      timeZone,
    )
    await MotionClient.setFilename(filename)
    const imageText = MotionTextAssembler.createImageText(
      siteName,
      settings.deviceName,
    )
    await MotionClient.setLeftTextOnImage(imageText)
  }

  async getDeviceName(): Promise<string> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    return settings.deviceName
  }

  async setDeviceName(deviceName: string): Promise<void> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings.deviceName = deviceName
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
    const timeZone = await SystemTimeInteractor.getTimeZone()
    const filename = MotionTextAssembler.createFilename(
      settings.siteName,
      deviceName,
      timeZone,
    )
    await MotionClient.setFilename(filename)
    const imageText = MotionTextAssembler.createImageText(
      settings.siteName,
      deviceName,
    )
    await MotionClient.setLeftTextOnImage(imageText)
  }

  async getSystemTime(): Promise<string> {
    const time = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    return time
  }

  async setSystemTime(systemTime: string): Promise<void> {
    const isRaspberryPi = this.deviceType === 'RaspberryPi'
    await SystemTimeInteractor.setSystemTimeInIso8601Format(
      systemTime,
      isRaspberryPi,
    )
  }

  async getAvailableTimeZones(): Promise<string[]> {
    const timeZones = await SystemTimeInteractor.getAvailableTimeZones()
    return timeZones
  }

  async getTimeZone(): Promise<string> {
    const timeZone = await SystemTimeInteractor.getTimeZone()
    return timeZone
  }

  async setTimeZone(timeZone: string): Promise<void> {
    const supportedTimeZones = await this.getAvailableTimeZones()
    if (!supportedTimeZones.includes(timeZone)) {
      throw new BadRequestException(
        `The time zone '${timeZone}' is not supported.`,
      )
    }
    await SystemTimeInteractor.setTimeZone(timeZone)
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    const filename = MotionTextAssembler.createFilename(
      settings.siteName,
      settings.deviceName,
      timeZone,
    )
    await MotionClient.setFilename(filename)
  }

  async getShotsFolder(): Promise<string> {
    const shotsFolder = await MotionClient.getTargetDir()
    return shotsFolder
  }

  async setShotsFolder(path: string): Promise<void> {
    await MotionClient.setTargetDir(path)
  }
}
