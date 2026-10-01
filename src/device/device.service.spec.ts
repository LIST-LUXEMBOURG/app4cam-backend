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
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException.js'
import { DeviceService } from './device.service.js'
import { PowerActionInteractor } from './interactors/power-action-interactor.js'

describe(DeviceService.name, () => {
  let service: DeviceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceService],
    }).compile()

    service = module.get<DeviceService>(DeviceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe(DeviceService.prototype.reboot.name, () => {
    it('triggers the reboot interactor', async () => {
      const spyTriggerReboot = vi
        .spyOn(PowerActionInteractor, 'triggerReboot')
        .mockResolvedValue()

      await service.reboot()

      expect(spyTriggerReboot).toHaveBeenCalled()
      spyTriggerReboot.mockRestore()
    })

    it('resolves without throwing when the command is unavailable on Windows', async () => {
      const spyTriggerReboot = vi
        .spyOn(PowerActionInteractor, 'triggerReboot')
        .mockRejectedValue(new CommandUnavailableOnWindowsException())

      await expect(service.reboot()).resolves.toBeUndefined()

      spyTriggerReboot.mockRestore()
    })
  })

  describe(DeviceService.prototype.shutDown.name, () => {
    it('triggers the shutdown interactor', async () => {
      const spyTriggerShutdown = vi
        .spyOn(PowerActionInteractor, 'triggerShutdown')
        .mockResolvedValue()

      await service.shutDown()

      expect(spyTriggerShutdown).toHaveBeenCalled()
      spyTriggerShutdown.mockRestore()
    })

    it('resolves without throwing when the command is unavailable on Windows', async () => {
      const spyTriggerShutdown = vi
        .spyOn(PowerActionInteractor, 'triggerShutdown')
        .mockRejectedValue(new CommandUnavailableOnWindowsException())

      await expect(service.shutDown()).resolves.toBeUndefined()

      spyTriggerShutdown.mockRestore()
    })
  })
})
