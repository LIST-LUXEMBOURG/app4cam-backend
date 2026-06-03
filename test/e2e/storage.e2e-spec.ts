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
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { vi } from 'vitest'
import { AppModule } from '../../src/app.module'
import { MotionClientService } from '../../src/motion-client.service'
import { StorageStatusDto } from '../../src/storage/dto/storage-status.dto'
import { StorageUsageDto } from '../../src/storage/dto/storage-usage.dto'
import { StorageUsageInteractor } from '../../src/storage/interactors/storage-usage-interactor'

describe('StorageController (e2e)', () => {
  const FILES_FOLDER_PATH = 'src/files/fixtures/'
  const STATUS: StorageStatusDto = {
    isAvailable: true,
    message: `The path ${FILES_FOLDER_PATH} is accessible and writable.`,
  }
  const USAGE: StorageUsageDto = {
    capacityKb: 1,
    usedPercentage: 2,
  }

  let app: INestApplication
  let spyGetStorageUsage

  beforeAll(() => {
    spyGetStorageUsage = vi
      .spyOn(StorageUsageInteractor, 'getStorageUsage')
      .mockResolvedValue(USAGE)
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MotionClientService)
      .useValue({
        getTargetDir: () => FILES_FOLDER_PATH,
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('/storage', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/storage/')
        .expect('Content-Type', /json/)
        .expect(200, {
          status: STATUS,
          usage: USAGE,
        })
    })

    it('/status (GET)', () => {
      return request(app.getHttpServer())
        .get('/storage/status')
        .expect('Content-Type', /json/)
        .expect(200, STATUS)
    })

    it('/usage (GET)', () => {
      return request(app.getHttpServer())
        .get('/storage/usage')
        .expect('Content-Type', /json/)
        .expect(200, USAGE)
    })
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyGetStorageUsage.mockRestore()
  })
})
