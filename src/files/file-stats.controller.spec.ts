/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
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
import { MotionClientService } from '../motion-client.service'
import { SettingsService } from '../settings/settings.service'
import { HoursOfDayCounts } from './entities/hours-of-day-counts.entity'
import { FileStatsController } from './file-stats.controller'
import { FileStatsService } from './file-stats.service'
import { IFileStatsService } from './file-stats.service.interface'
import { FilesService } from './files.service'

describe(FileStatsController.name, () => {
  const counts: HoursOfDayCounts = Object.fromEntries(
    Array.from({ length: 24 }, (_, i) => [i, 0]),
  ) as HoursOfDayCounts

  class MockFileStatsService implements IFileStatsService {
    getNumberShotsPerHoursOfDay = async () => counts
  }

  let controller: FileStatsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileStatsController],
      providers: [
        FilesService,
        {
          provide: FileStatsService,
          useClass: MockFileStatsService,
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        MotionClientService,
      ],
    }).compile()

    controller = module.get<FileStatsController>(FileStatsController)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
  })

  it('gets the number of shots per hours of the day', async () => {
    const response = await controller.getNumberShotsPerHoursOfDay()
    expect(response).toEqual({ hoursOfDayCounts: counts })
  })
})
