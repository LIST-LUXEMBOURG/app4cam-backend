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
import { ReadStream } from 'fs'
import { PassThrough } from 'stream'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { createMockConfigService } from '../../test/unit/config-service.mock.js'
import { FilesService } from '../files/files.service.js'
import { MotionClientService } from '../motion-client.service.js'
import { PropertiesService } from '../properties/properties.service.js'
import { SettingsService } from '../settings/settings.service.js'
import { SnapshotsController } from './snapshots.controller.js'
import { ISnapshotsService } from './snapshots.service.interface.js'
import { SnapshotsService } from './snapshots.service.js'

describe(SnapshotsController.name, () => {
  const mockSnapshotContentType = 'a'
  let controller: SnapshotsController
  let service: SnapshotsService

  class MockSnapshotsService implements ISnapshotsService {
    takeSnapshot = vi.fn(() =>
      Promise.resolve({
        contentType: mockSnapshotContentType,
        stream: new PassThrough() as unknown as ReadStream,
      }),
    )
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnapshotsController],
      providers: [
        { provide: ConfigService, useValue: createMockConfigService() },
        FilesService,
        MotionClientService,
        PropertiesService,
        SettingsService,
        { provide: SnapshotsService, useClass: MockSnapshotsService },
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
