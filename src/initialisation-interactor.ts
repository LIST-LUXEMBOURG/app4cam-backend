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
import { exec as execSync } from 'child_process'
import { lstat, readdir } from 'fs/promises'
import path = require('path')
import { promisify } from 'util'
import { LightType } from './settings/entities/settings'
import { CommandExecutionException } from './shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from './shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

const MEDIA_BASE_PATH = '/media'
const RASPBERRY_PI_IGNORED_MEDIA_PATH = '/media/pi'

export class InitialisationInteractor {
  static async getNewestMediaPath(deviceType: string) {
    const elements = await readdir(MEDIA_BASE_PATH)
    const elementPromises = elements.map(async (element) => {
      const elementPath = path.join(MEDIA_BASE_PATH, element)
      const stats = await lstat(elementPath)
      return {
        path: elementPath,
        stats,
      }
    })
    const elementsWithStats = await Promise.all(elementPromises)
    return elementsWithStats
      .filter((element) => element.stats.isDirectory())
      .sort((a, b) => {
        return b.stats.mtime.getTime() - a.stats.mtime.getTime()
      })
      .map((folder) => {
        return folder.path
      })
      .filter(
        (folderPath) =>
          deviceType !== 'RaspberryPi' ||
          folderPath !== RASPBERRY_PI_IGNORED_MEDIA_PATH,
      )
      .at(0)
  }

  static async resetLights(
    deviceType: string,
    isAlternatingLightModeEnabled: boolean,
    lightType: LightType,
  ): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const currentWorkingDirectory = process.cwd()
    const { stderr } = await exec(
      `sudo ${currentWorkingDirectory}/scripts/runtime/reset-lights.sh ${deviceType} ${lightType} ${isAlternatingLightModeEnabled}`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
