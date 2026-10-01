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
import { Injectable, Logger } from '@nestjs/common'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException.js'
import { IDeviceService } from './device.service.interface.js'
import { PowerActionInteractor } from './interactors/power-action-interactor.js'

@Injectable()
export class DeviceService implements IDeviceService {
  private readonly logger = new Logger(DeviceService.name)

  async reboot(): Promise<void> {
    try {
      await PowerActionInteractor.triggerReboot()
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        this.logger.warn('Reboot command is not available on Windows.')
        return
      }
      throw error
    }
  }

  async shutDown(): Promise<void> {
    try {
      await PowerActionInteractor.triggerShutdown()
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        this.logger.warn('Shutdown command is not available on Windows.')
        return
      }
      throw error
    }
  }
}
