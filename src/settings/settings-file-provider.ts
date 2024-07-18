/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import { readFile, writeFile } from 'fs/promises'
import { LightType, SettingsFromJsonFile } from './entities/settings'

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
