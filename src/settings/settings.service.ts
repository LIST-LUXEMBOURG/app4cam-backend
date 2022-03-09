import { Injectable } from '@nestjs/common'
import { MotionClient } from '../motion-client'
import { Settings, SettingsFromJsonFile } from './settings'
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
    const settingsToReturn = {
      ...settings,
      systemTime: time,
    }
    return settingsToReturn
  }

  async updateSettings(settingsToUpdate: Partial<Settings>): Promise<void> {
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
    let settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings = {
      ...settings,
      ...settingsToUpdateInFile,
    }
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
    await MotionClient.setFilename(settings.siteName, settings.deviceId)
  }

  async updateAllSettings(settings: SettingsFromJsonFile): Promise<void> {
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
    await MotionClient.setFilename(settings.siteName, settings.deviceId)
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
    await MotionClient.setFilename(siteName, settings.deviceId)
  }

  async getDeviceId(): Promise<string> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    return settings.deviceId
  }

  async setDeviceId(deviceId: string): Promise<void> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings.deviceId = deviceId
    await SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
    await MotionClient.setFilename(settings.siteName, deviceId)
  }

  async getSystemTime(): Promise<string> {
    const time = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    return time
  }

  async setSystemTime(systemTime: string): Promise<void> {
    await SystemTimeInteractor.setSystemTimeInIso8601Format(systemTime)
  }
}
