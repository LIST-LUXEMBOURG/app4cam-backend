import { Injectable } from '@nestjs/common'
import { Settings } from './settings'
import { SettingsFileProvider } from './settings.file.provider'
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
    SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
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
    SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
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
    SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
  }

  async getSystemTime(): Promise<string> {
    const time = await SystemTimeInteractor.getSystemTimeInIso8601Format()
    return time
  }

  async setSystemTime(systemTime: string): Promise<void> {
    await SystemTimeInteractor.setSystemTimeInIso8601Format(systemTime)
  }
}
