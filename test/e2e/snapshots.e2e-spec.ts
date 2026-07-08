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
import { AppModule } from '../../src/app.module'
import { MotionClientService } from '../../src/motion-client.service'
import { IMotionClientService } from '../../src/motion-client.service.interface'

describe('SnapshotsController (e2e)', () => {
  const FILES_FOLDER_PATH = 'src/snapshots/fixtures/'

  class MockMotionClientService implements Partial<IMotionClientService> {
    getTargetDir = async () => FILES_FOLDER_PATH
    takeSnapshot = async () => {}
  }

  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MotionClientService)
      .useClass(MockMotionClientService)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/snapshots (GET)', () => {
    return request(app.getHttpServer())
      .get('/snapshots')
      .expect(200)
      .expect('Content-Type', 'image/jpeg')
      .expect(
        'Content-Disposition',
        'attachment; filename="latest_snapshot.jpg"',
      )
      .responseType('blob')
  })

  afterEach(() => {
    app.close()
  })
})
