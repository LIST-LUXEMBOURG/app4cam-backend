import { readFile, writeFile } from 'fs/promises'
import { SettingsFromJsonFile } from './settings'

const JSON_INDENTATION_SPACES = 2

export const JSON_SETTINGS_WITH_NONE_SET: SettingsFromJsonFile = {
  general: {
    deviceName: '',
    siteName: '',
  },
  triggering: {
    sleepingTime: '',
    wakingUpTime: '',
    light: 'infrared',
  },
}

export class SettingsFileProvider {
  static async readSettingsFile(
    filePath: string,
  ): Promise<SettingsFromJsonFile> {
    try {
      const buffer = await readFile(filePath)
      const data = buffer.toString()
      const loadedSettings = JSON.parse(data)
      const mergedSettings = {
        ...JSON_SETTINGS_WITH_NONE_SET,
        ...loadedSettings,
      }
      return mergedSettings
    } catch (err) {
      if (err.code !== 'ENOENT' && err.name !== 'SyntaxError') {
        throw err
      }
      return JSON_SETTINGS_WITH_NONE_SET
    }
  }

  static async writeSettingsToFile(
    settings: SettingsFromJsonFile,
    filePath: string,
  ) {
    const data = JSON.stringify(settings, null, JSON_INDENTATION_SPACES)
    await writeFile(filePath, data)
  }
}
