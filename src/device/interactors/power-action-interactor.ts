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

export class PowerActionInteractor {
  static async triggerReboot(): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec('sudo reboot')
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }

  static async triggerShutdown(): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec('sudo shutdown -h now')
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
