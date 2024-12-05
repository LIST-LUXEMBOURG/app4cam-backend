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
import { Controller, Get, Post } from '@nestjs/common'
import { UpgradeFileCheckResultDto } from './dto/upgrade-file-check-result.dto'
import { UpgradeStatusDto } from './dto/upgrade-status.dto'
import { UpgradesService } from './upgrades.service'

@Controller('upgrades')
export class UpgradesController {
  constructor(private readonly upgradesService: UpgradesService) {}

  @Get('fileCheckResult')
  getUpgradeFileCheckResult(): Promise<UpgradeFileCheckResultDto> {
    return this.upgradesService.verifyUpgradeFile()
  }

  @Get('status')
  async getUpgradeStatus(): Promise<UpgradeStatusDto> {
    const inProgress = await this.upgradesService.isUpgradeInProgress()
    return {
      inProgress,
    }
  }

  @Post('upgrade')
  upgrade(): Promise<void> {
    return this.upgradesService.performUpgrade()
  }
}
