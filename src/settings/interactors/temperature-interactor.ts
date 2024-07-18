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

const exec = promisify(execSync)

export class TemperatureInteractor {
  static async getCurrentTemperature(): Promise<number> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const currentWorkingDirectory = process.cwd()
    const { stdout, stderr } = await exec(
      `${currentWorkingDirectory}/scripts/runtime/raspberry-pi/air-temperature/read_air_temp`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const line = stdout.trim()
    const value = parseFloat(line)
    return value
  }
}
