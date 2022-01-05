import { Injectable } from '@nestjs/common'
import { SettingsFileProvider } from './settings.file.provider'

const SETTINGS_FILE_PATH = 'settings.json'

@Injectable()
export class SettingsService {
  async getSiteName(): Promise<string> {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    return settings.siteName
  }

  async setSiteName(siteName: string) {
    const settings = await SettingsFileProvider.readSettingsFile(
      SETTINGS_FILE_PATH,
    )
    settings.siteName = siteName
    SettingsFileProvider.writeSettingsToFile(settings, SETTINGS_FILE_PATH)
  }
}
