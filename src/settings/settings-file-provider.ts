// © 2022-2024 Luxembourg Institute of Science and Technology
import { readFile, writeFile } from 'fs/promises'
import { LightType, SettingsFromJsonFile } from './settings'

const DEFAULT_CAMERA_LIGHT: LightType = 'visible'
const DEFAULT_TRIGGERING_LIGHT: LightType = 'visible'
const JSON_INDENTATION_SPACES = 2

export const JSON_SETTINGS_WITH_NONE_SET: SettingsFromJsonFile = {
  camera: {
    light: DEFAULT_CAMERA_LIGHT,
  },
  general: {},
  triggering: {
    light: DEFAULT_TRIGGERING_LIGHT,
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
