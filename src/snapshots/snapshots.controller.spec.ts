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
import { PassThrough } from 'stream'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { FilesService } from '../files/files.service'
import { MotionClientService } from '../motion-client.service'
import { PropertiesService } from '../properties/properties.service'
import { SettingsService } from '../settings/settings.service'
import { SnapshotsController } from './snapshots.controller'
import { SnapshotsService } from './snapshots.service'

describe(SnapshotsController.name, () => {
  const mockSnapshotContentType = 'a'
  let controller: SnapshotsController
  let service: SnapshotsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnapshotsController],
      providers: [
        ConfigService,
        FilesService,
        MotionClientService,
        PropertiesService,
        SettingsService,
        {
          provide: SnapshotsService,
          useValue: {
            takeSnapshot: vi.fn(() => ({
              contentType: mockSnapshotContentType,
              stream: new PassThrough(),
            })),
          },
        },
      ],
    }).compile()

    controller = module.get<SnapshotsController>(SnapshotsController)
    service = module.get<SnapshotsService>(SnapshotsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe(SnapshotsController.prototype.takeSnapshot.name, () => {
    it('asks for taking a snapshot and sets the response', async () => {
      const mockResponse = {
        set: vi.fn(),
      }
      await controller.takeSnapshot(mockResponse)
      expect(service.takeSnapshot).toHaveBeenCalledWith()
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': mockSnapshotContentType,
        'Content-Disposition': 'attachment; filename="latest_snapshot.jpg"',
      })
    })
  })
})
