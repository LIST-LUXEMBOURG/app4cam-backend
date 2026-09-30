/**
 * Copyright (C) since 2026 Luxembourg Institute of Science and Technology
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

const exec = promisify(execSync)

export class CpuTemperatureInteractor {
  static async getCpuTemperature(): Promise<number> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stdout, stderr } = await exec(
      'cat /sys/devices/virtual/thermal/thermal_zone0/temp',
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const response = stdout.trimEnd()
    // The output is in millidegrees Celsius.
    const temperature = parseInt(response) / 1000
    return temperature
  }
}
