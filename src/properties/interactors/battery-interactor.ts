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
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'
import { UnsupportedDeviceTypeException } from '../exceptions/UnsupportedDeviceTypeException'

const exec = promisify(execSync)

export class BatteryInteractor {
  static async getBatteryVoltage(deviceType: string): Promise<number> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    let relativeCommandPath = 'scripts/runtime/'
    if (deviceType === 'RaspberryPi') {
      relativeCommandPath += 'raspberry-pi/get-input-voltage.sh'
    } else if (deviceType === 'Variscite') {
      relativeCommandPath += 'variscite/battery-monitoring/battery_monitoring'
    } else {
      throw new UnsupportedDeviceTypeException(deviceType)
    }
    const currentWorkingDirectory = process.cwd()
    const { stdout, stderr } = await exec(
      `sudo ${currentWorkingDirectory}/${relativeCommandPath}`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const value = parseFloat(stdout)
    return value
  }
}
