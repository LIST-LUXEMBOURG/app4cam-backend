import { BadRequestException, Injectable } from '@nestjs/common'
import { MotionClient } from '../motion-client'
import { MotionTextAssembler } from './motion-text-assembler'
import { PatchableSettings, Settings, UpdatableSettings } from './settings'
import { SettingsFileProvider } from './settings-file-provider'
import { SystemTimeInteractor } from './system-time-interactor'

const SETTINGS_FILE_PATH = 'settings.json'

@Injectable()
export class SettingsService {
  async getAllSettings(): Promise<Settings> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    const time = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    const shotTypes = []
    const pictureOutput = await MotionClient.getPictureOutput()
    if (pictureOutput === 'on') {
      shotTypes.push('pictures')
    }
    const movieOutput = await MotionClient.getMovieOutput()
    if (movieOutput === 'on') {
      shotTypes.push('videos')
    }
    const settingsToReturn = {
      ...settings,
      shotTypes,
      systemTime: time,
    }
    return settingsToReturn
  }

  async updateSettings(settingsToUpdate: PatchableSettings): Promise<void> {
    if (Object.prototype.hasOwnProperty.call(settingsToUpdate, 'timeZone')) {
      const supportedTimeZones = await this.getAvailableTimeZones()
      if (!supportedTimeZones.includes(settingsToUpdate.timeZone)) {
        throw new BadRequestException(
          `The time zone '${settingsToUpdate.timeZone}' is not supported.`,
        )
      }
    }

    const settingsToUpdateInFile = JSON.parse(JSON.stringify(settingsToUpdate)) // deep clone

    if (Object.prototype.hasOwnProperty.call(settingsToUpdate, 'systemTime')) {
      await SystemTimeInteractor.setSystemTimeInIso8601Format(
        settingsToUpdate.systemTime,
      )
      if (Object.keys(settingsToUpdate).length === 1) {
        // If there is only this one object property, refrain from reading and writing for nothing.
        return
      }
      // Remove this property as it should not be written to the settings file.
      delete settingsToUpdateInFile.systemTime
    }

    if (Object.prototype.hasOwnProperty.call(settingsToUpdate, 'shotTypes')) {
      if (settingsToUpdate.shotTypes.includes('pictures')) {
        await MotionClient.setPictureOutput('on')
      } else {
        await MotionClient.setPictureOutput('off')
      }
      if (settingsToUpdate.shotTypes.includes('videos')) {
        await MotionClient.setMovieOutput('on')
      } else {
        await MotionClient.setMovieOutput('off')
      }
      // Remove this property as it should not be written to the settings file.
      delete settingsToUpdateInFile.shotTypes
    }

    let settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings = {
      ...settings,
      ...settingsToUpdateInFile,
    }
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)

    const filename = MotionTextAssembler.createFilename(
      settings.siteName,
      settings.deviceName,
      settings.timeZone,
    )
    await MotionClient.setFilename(filename)
    if (
      Object.prototype.hasOwnProperty.call(settingsToUpdate, 'deviceName') ||
      Object.prototype.hasOwnProperty.call(settingsToUpdate, 'siteName')
    ) {
      const imageText = MotionTextAssembler.createImageText(
        settings.siteName,
        settings.deviceName,
      )
      await MotionClient.setLeftTextOnImage(imageText)
    }

    if (Object.prototype.hasOwnProperty.call(settingsToUpdate, 'timeZone')) {
      await SystemTimeInteractor.setTimeZone(settingsToUpdate.timeZone)
    }
  }

  async updateAllSettings(settings: UpdatableSettings): Promise<void> {
    const supportedTimeZones = await this.getAvailableTimeZones()
    if (!supportedTimeZones.includes(settings.timeZone)) {
      throw new BadRequestException(
        `The time zone '${settings.timeZone}' is not supported.`,
      )
    }

    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)

    const filename = MotionTextAssembler.createFilename(
      settings.siteName,
      settings.deviceName,
      settings.timeZone,
    )
    await MotionClient.setFilename(filename)

    const imageText = MotionTextAssembler.createImageText(
      settings.siteName,
      settings.deviceName,
    )
    await MotionClient.setLeftTextOnImage(imageText)

    await SystemTimeInteractor.setTimeZone(settings.timeZone)
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
