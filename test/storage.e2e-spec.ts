/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
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
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { StorageUsageInteractor } from '../src/storage/interactors/storage-usage-interactor'
import { StorageStatusDto } from 'src/storage/dto/storage-status.dto'
import { StorageUsageDto } from 'src/storage/dto/storage-usage.dto'

const FILES_FOLDER_PATH = 'src/files/fixtures/'

jest.mock('../src/motion-client', () => ({
  MotionClient: {
    getTargetDir: () => FILES_FOLDER_PATH,
  },
}))

describe('StorageController (e2e)', () => {
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
    spyGetStorageUsage = jest
      .spyOn(StorageUsageInteractor, 'getStorageUsage')
      .mockImplementation(() => Promise.resolve(USAGE))
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

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
