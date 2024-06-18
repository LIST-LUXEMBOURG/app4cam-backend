// © 2022-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { lstat, readdir } from 'fs/promises'
import path = require('path')
import { promisify } from 'util'
import { LightType } from './settings/settings'
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
    lightType: LightType,
  ): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const currentWorkingDirectory = process.cwd()
    const { stderr } = await exec(
      `sudo ${currentWorkingDirectory}/scripts/use-triggering-leds.sh ${deviceType} ${lightType}`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
