import { BadRequestException, Injectable, Logger } from '@nestjs/common'
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
  private readonly logger = new Logger(SettingsService.name)

  async getAllSettings(): Promise<Settings> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    const time = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    const shotTypes = []
    let triggerSensitivity = 0
    try {
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
    const settingsToReturn = {
      camera: {
        shotTypes,
      },
      general: {
        ...settings,
        systemTime: time,
      },
      triggering: {
        sensitivity: triggerSensitivity,
      },
    }
    return settingsToReturn
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
        await SystemTimeInteractor.setSystemTimeInIso8601Format(
          settings.general.systemTime,
        )
        if (Object.keys(settings).length === 1) {
          // If there is only this one object property, refrain from reading and writing for nothing.
          return
        }
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

      if (Object.prototype.hasOwnProperty.call(settings.general, 'timeZone')) {
        settingsToUpdateInFile.timeZone = settings.general.timeZone

        await SystemTimeInteractor.setTimeZone(settings.general.timeZone)
      }

      const settingsReadFromFile = await SettingsFileProvider.readSettingsFile(
        SETTINGS_FILE_PATH,
      )
      const settingsMerged = {
        ...settingsReadFromFile,
        ...settingsToUpdateInFile,
      }
      await SettingsFileProvider.writeSettingsToFile(
        settingsMerged,
        SETTINGS_FILE_PATH,
      )

      const filename = MotionTextAssembler.createFilename(
        settingsMerged.siteName,
        settingsMerged.deviceName,
        settingsMerged.timeZone,
      )
      await MotionClient.setFilename(filename)
      if (
        Object.prototype.hasOwnProperty.call(settings.general, 'deviceName') ||
        Object.prototype.hasOwnProperty.call(settings.general, 'siteName')
      ) {
        const imageText = MotionTextAssembler.createImageText(
          settingsMerged.siteName,
          settingsMerged.deviceName,
        )
        await MotionClient.setLeftTextOnImage(imageText)
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
      timeZone: settings.general.timeZone,
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
    const filename = MotionTextAssembler.createFilename(
      siteName,
      settings.deviceName,
      settings.timeZone,
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
    const filename = MotionTextAssembler.createFilename(
      settings.siteName,
      deviceName,
      settings.timeZone,
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
    await SystemTimeInteractor.setSystemTimeInIso8601Format(systemTime)
  }

  async getAvailableTimeZones(): Promise<string[]> {
    const timeZones = await SystemTimeInteractor.getAvailableTimeZones()
    return timeZones
  }

  async getTimeZone(): Promise<string> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    const settingsFileTimeZone = settings.timeZone
    const systemTimeZone = await SystemTimeInteractor.getTimeZone()
    if (settingsFileTimeZone !== systemTimeZone) {
      throw new Error(
        `There is a mismatch between the system time zone '${systemTimeZone}' and the time zone stored in the settings file '${settingsFileTimeZone}'.`,
      )
    }
    return settingsFileTimeZone
  }

  async setTimeZone(timeZone: string): Promise<void> {
    const supportedTimeZones = await this.getAvailableTimeZones()
    if (!supportedTimeZones.includes(timeZone)) {
      throw new BadRequestException(
        `The time zone '${timeZone}' is not supported.`,
      )
    }
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings.timeZone = timeZone
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
    await SystemTimeInteractor.setTimeZone(timeZone)
    const filename = MotionTextAssembler.createFilename(
      settings.siteName,
      settings.deviceName,
      timeZone,
    )
    await MotionClient.setFilename(filename)
  }
}
