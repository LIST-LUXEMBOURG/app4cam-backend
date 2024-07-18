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
import { rm, writeFile } from 'fs/promises'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { SettingsService } from '../src/settings/settings.service'
import { AppModule } from './../src/app.module'

const FILES_FOLDER_PATH = 'src/files/fixtures/'

jest.mock('../src/motion-client', () => ({
  MotionClient: {
    getTargetDir: () => FILES_FOLDER_PATH,
  },
}))

describe('FilesController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SettingsService)
      .useValue({
        getAllSettings: jest.fn().mockResolvedValue({
          general: {
            deviceName: 'd',
            siteName: 's',
          },
        }),
        getShotTypes: jest
          .fn()
          .mockResolvedValue(new Set(['pictures', 'videos'])),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('/files (POST)', () => {
    const filenames = ['a.txt', 'b.txt']
    return request(app.getHttpServer())
      .post('/files')
      .send({ filenames })
      .expect(201)
      .expect('Content-Type', /application\/zip/)
      .expect(
        'Content-Disposition',
        /attachment; filename="[A-Za-z0-9]+_[A-Za-z0-9]+_[TZ0-9]+.zip"/,
      )
      .responseType('blob')
  })

  it('/files (POST) non-existing file', () => {
    const filenames = ['a.txt', 'c.txt']
    return request(app.getHttpServer())
      .post('/files')
      .send({ filenames })
      .expect(201)
  })

  it('/files (POST) illegal path', () => {
    const filenames = ['../whatever-file-in-different-folder.txt']
    return request(app.getHttpServer())
      .post('/files')
      .send({ filenames })
      .expect(403)
  })

  it('/files (GET)', () => {
    return request(app.getHttpServer())
      .get('/files')
      .expect(200)
      .expect('Content-Type', /json/)
  })

  it('/files (DELETE)', async () => {
    const filenames = ['to-delete-1.txt', 'to-delete-2.txt']
    for (const filename of filenames) {
      const filePath = FILES_FOLDER_PATH + filename
      await writeFile(filePath, 'bla')
    }
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ 'to-delete-1.txt': true, 'to-delete-2.txt': true })
  })

  it('/files (DELETE) first one does not exist', async () => {
    const filenames = ['non-existing.txt', 'existing.txt']
    const filePath = FILES_FOLDER_PATH + filenames[1]
    await writeFile(filePath, 'bla')
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ 'non-existing.txt': false, 'existing.txt': true })
  })

  it('/files (DELETE) non-existing', async () => {
    const filenames = ['non-existing-1.txt', 'non-existing-2.txt']
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(404)
  })

  it('/files (DELETE) different folder', async () => {
    const filenames = ['../whatever-file-in-different-folder.txt']
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(403)
  })

  it('/files/:id (GET)', async () => {
    const filename = 'a.txt'
    const filePath = FILES_FOLDER_PATH + filename
    await writeFile(filePath, 'a')
    const response = await request(app.getHttpServer()).get(
      '/files/' + filename,
    )
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/text\/plain/)
    expect(response.headers['content-disposition']).toBe(
      `attachment; filename="${filename}"`,
    )
    await rm(filePath)
  })

  it('/files/:id (DELETE)', async () => {
    const filename = 'to-delete.txt'
    const filePath = FILES_FOLDER_PATH + filename
    await writeFile(filePath, 'bla')
    return request(app.getHttpServer())
      .delete('/files/' + filename)
      .expect(200)
  })

  it('/files/:id (DELETE) non-existing', async () => {
    const filename = 'non-existing.txt'
    return request(app.getHttpServer())
      .delete('/files/' + filename)
      .expect(404)
  })

  it('/file-stats/number-per-hours-of-day (GET)', async () => {
    return request(app.getHttpServer())
      .get('/file-stats/number-per-hours-of-day')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ hoursOfDayCounts: new Array(24).fill(0) })
  })

  afterEach(() => {
    app.close()
  })
})
