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
import { DeviceController } from './device.controller.js'
import { DeviceService } from './device.service.js'

describe(DeviceController.name, () => {
  let controller: DeviceController
  const spyReboot = vi.fn()
  const spyShutDown = vi.fn()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: {
            reboot: spyReboot,
            shutDown: spyShutDown,
          },
        },
      ],
    }).compile()

    controller = module.get<DeviceController>(DeviceController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe(DeviceController.prototype.reboot.name, () => {
    it('delegates to the device service', async () => {
      await controller.reboot()
      expect(spyReboot).toHaveBeenCalled()
    })
  })

  describe(DeviceController.prototype.shutDown.name, () => {
    it('delegates to the device service', async () => {
      await controller.shutDown()
      expect(spyShutDown).toHaveBeenCalled()
    })
  })
})
