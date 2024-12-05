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
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { UpgradeFileCheckResultDto } from '../src/upgrades/dto/upgrade-file-check-result.dto'
import { UpgradesService } from '../src/upgrades/upgrades.service'
import { AppModule } from './../src/app.module'

describe('FilesController (e2e)', () => {
  const FILE_CHECK_RESULT: UpgradeFileCheckResultDto = {
    isOkay: false,
    message: 'a',
  }
  const STATUS = true

  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UpgradesService)
      .useValue({
        isUpgradeInProgress: jest.fn().mockResolvedValue(STATUS),
        performUpgrade: jest.fn(),
        verifyUpgradeFile: jest.fn().mockResolvedValue(FILE_CHECK_RESULT),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  describe('/upgrades/', () => {
    it('/fileCheckResult (GET)', () => {
      return request(app.getHttpServer())
        .get('/upgrades/fileCheckResult')
        .expect('Content-Type', /json/)
        .expect(200, FILE_CHECK_RESULT)
    })

    it('/status (GET)', () => {
      return request(app.getHttpServer())
        .get('/upgrades/status')
        .expect('Content-Type', /json/)
        .expect(200, { inProgress: STATUS })
    })

    it('/upgrade (POST)', () => {
      return request(app.getHttpServer()).post('/upgrades/upgrade').expect(201)
    })
  })

  afterEach(() => {
    app.close()
  })
})
