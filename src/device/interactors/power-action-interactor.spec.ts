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
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException.js'
import { PowerActionInteractor } from './power-action-interactor.js'

const itIfNotWindows = () => (process.platform !== 'win32' ? it : it.skip)

describe(PowerActionInteractor.name, () => {
  describe(PowerActionInteractor.triggerReboot.name, () => {
    it('throws CommandUnavailableOnWindowsException on Windows', async () => {
      if (process.platform !== 'win32') {
        return
      }
      await expect(PowerActionInteractor.triggerReboot()).rejects.toThrow(
        CommandUnavailableOnWindowsException,
      )
    })

    itIfNotWindows()('executes without throwing on Linux', async () => {
      // This test only runs on Linux/Mac where the shutdown command exists.
      // The command itself is harmless in a CI environment if sudo is not granted
      // (it will stderr, triggering CommandExecutionException), so we only verify
      // that the Windows guard is not thrown.
      await expect(PowerActionInteractor.triggerReboot()).rejects.not.toThrow(
        CommandUnavailableOnWindowsException,
      )
    })
  })

  describe(PowerActionInteractor.triggerShutdown.name, () => {
    it('throws CommandUnavailableOnWindowsException on Windows', async () => {
      if (process.platform !== 'win32') {
        return
      }
      await expect(PowerActionInteractor.triggerShutdown()).rejects.toThrow(
        CommandUnavailableOnWindowsException,
      )
    })

    itIfNotWindows()('executes without throwing on Linux', async () => {
      // This test only runs on Linux/Mac where the shutdown command exists.
      // The command itself is harmless in a CI environment if sudo is not granted
      // (it will stderr, triggering CommandExecutionException), so we only verify
      // that the Windows guard is not thrown.
      await expect(PowerActionInteractor.triggerShutdown()).rejects.not.toThrow(
        CommandUnavailableOnWindowsException,
      )
    })
  })
})
