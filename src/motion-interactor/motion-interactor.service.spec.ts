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
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { MotionClientService } from '../motion-client.service'
import { IMotionClientService } from '../motion-client.service.interface'
import { PropertiesService } from '../properties/properties.service'
import { SettingsModule } from '../settings/settings.module'
import { SettingsService } from '../settings/settings.service'
import { StorageModule } from '../storage/storage.module'
import { StorageService } from '../storage/storage.service'
import { MotionInteractorService } from './motion-interactor.service'

describe(MotionInteractorService.name, () => {
  const spyIsDetectionStatusActive = vi.fn()
  const spyPauseDetection = vi.fn()
  const spyStartDetection = vi.fn()

  class MockMotionClientService implements Partial<IMotionClientService> {
    isDetectionStatusActive = spyIsDetectionStatusActive
    pauseDetection = spyPauseDetection
    startDetection = spyStartDetection
  }

  let service: MotionInteractorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: MotionClientService, useClass: MockMotionClientService },
        MotionInteractorService,
        PropertiesService,
        SettingsService,
        StorageService,
      ],
      imports: [SettingsModule, StorageModule],
    }).compile()

    service = module.get<MotionInteractorService>(MotionInteractorService)
  })

  it('is defined', () => {
    expect(service).toBeDefined()
  })

  describe(
    MotionInteractorService.prototype.pauseDetectionIfActive.name,
    () => {
      it('pauses detection if it is active', async () => {
        spyIsDetectionStatusActive.mockResolvedValue(true)
        await service.pauseDetectionIfActive()
        expect(spyPauseDetection).toHaveBeenCalled()
        spyIsDetectionStatusActive.mockRestore()
      })

      it('does nothing if it is inactive', async () => {
        spyIsDetectionStatusActive.mockResolvedValue(false)
        await service.pauseDetectionIfActive()
        expect(spyPauseDetection).not.toHaveBeenCalled()
        spyIsDetectionStatusActive.mockRestore()
      })

      afterEach(() => {
        spyPauseDetection.mockReset()
      })
    },
  )

  describe(
    MotionInteractorService.prototype.startDetectionIfNotActive.name,
    () => {
      it('starts detection if it is inactive', async () => {
        spyIsDetectionStatusActive.mockResolvedValue(false)
        await service.startDetectionIfNotActive()
        expect(spyStartDetection).toHaveBeenCalled()
        spyIsDetectionStatusActive.mockRestore()
      })

      it('does nothing if it is active', async () => {
        spyIsDetectionStatusActive.mockResolvedValue(true)
        await service.startDetectionIfNotActive()
        expect(spyStartDetection).not.toHaveBeenCalled()
        spyIsDetectionStatusActive.mockRestore()
      })

      afterEach(() => {
        spyStartDetection.mockReset()
      })
    },
  )

  afterAll(() => {
    spyPauseDetection.mockRestore()
    spyStartDetection.mockRestore()
  })
})
