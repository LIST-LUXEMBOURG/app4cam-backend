/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
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
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException.js'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException.js'
import { FocusValueOutOfRange } from '../exceptions/FocusValueOutOfRange.js'

const exec = promisify(execSync)

const FOCUS_DETAILS_KEYS = ['default', 'min', 'max', 'value'] as const

type FocusDetails = Partial<Record<(typeof FOCUS_DETAILS_KEYS)[number], number>>

export class VideoDeviceInteractor {
  static async getFocus(devicePath: string): Promise<FocusDetails> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const command = `sudo v4l2-ctl -d ${devicePath} -l | grep focus_absolute`
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const line = stdout.trim()
    const controlMapping = line.split(': ')
    const focusMappings = controlMapping[1].split(' ')
    const focusMappingsAsObject: FocusDetails = {}
    for (const focusMapping of focusMappings) {
      const mapping = focusMapping.split('=')
      const key = mapping[0]
      const value = mapping[1]
      if (this.isFocusDetailsKey(key)) {
        focusMappingsAsObject[key] = parseInt(value)
      }
    }
    return focusMappingsAsObject
  }

  static isFocusDetailsKey(key: string): key is keyof FocusDetails {
    return (FOCUS_DETAILS_KEYS as readonly string[]).includes(key)
  }

  static async setFocus(devicePath: string, focus: number): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const currentFocus = await this.getFocus(devicePath)
    if (
      (currentFocus.min !== undefined && focus < currentFocus.min) ||
      (currentFocus.max !== undefined && currentFocus.max < focus)
    ) {
      throw new FocusValueOutOfRange(
        `Focus value ${focus} not between ${currentFocus.min} and ${currentFocus.max}!`,
      )
    }
    const currentWorkingDirectory = process.cwd()
    const command = `sudo ${currentWorkingDirectory}/scripts/runtime/raspberry-pi/set-camera-focus.sh ${devicePath} ${focus}`
    const { stderr } = await exec(command)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
