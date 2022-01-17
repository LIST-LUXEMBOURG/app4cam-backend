import { Injectable } from '@nestjs/common'
import { Settings } from './settings'
import { SettingsFileProvider } from './settings.file.provider'

const SETTINGS_FILE_PATH = 'settings.json'

@Injectable()
export class SettingsService {
  async getAllSettings(): Promise<Settings> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    return settings
  }

  async updateSettings(settingsToUpdate: Partial<Settings>): Promise<void> {
    let settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings = {
      ...settings,
      ...settingsToUpdate,
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
}
