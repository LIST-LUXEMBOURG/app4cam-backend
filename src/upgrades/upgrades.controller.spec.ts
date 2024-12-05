/**
 * Copyright (C) 2024  Luxembourg Institute of Science and Technology
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
import { UpgradeFileCheckResultDto } from './dto/upgrade-file-check-result.dto'
import { UpgradesController } from './upgrades.controller'
import { UpgradesService } from './upgrades.service'

describe(UpgradesController.name, () => {
  const MESSAGE: UpgradeFileCheckResultDto = {
    isOkay: false,
    message: 'a',
  }

  let controller: UpgradesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpgradesController],
      providers: [
        {
          provide: UpgradesService,
          useValue: {
            verifyUpgradeFile: jest.fn().mockResolvedValue(MESSAGE),
          },
        },
      ],
    }).compile()

    controller = module.get<UpgradesController>(UpgradesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getUpgradeFileCheckResult', () => {
    it('gets a message', async () => {
      const response = await controller.getUpgradeFileCheckResult()
      expect(response).toEqual(MESSAGE)
    })
  })
})
