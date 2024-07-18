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
import { LogFileInteractor } from '../src/log-files/log-file-interactor'
import { AppModule } from './../src/app.module'

const APP_LOG_FILE_PATH = 'temp/app.log'
const MOTION_LOG_FILE_PATH = 'temp/motion.log'

describe('LogFilesController (e2e)', () => {
  let app: INestApplication

  let spyWriteAppLogFileToDisk
  let spyWriteMotionLogFileToDisk

  beforeAll(async () => {
    spyWriteAppLogFileToDisk = jest
      .spyOn(LogFileInteractor, 'writeAppLogFileToDisk')
      .mockResolvedValue()
    await writeFile(APP_LOG_FILE_PATH, 'b')
    spyWriteMotionLogFileToDisk = jest
      .spyOn(LogFileInteractor, 'writeMotionLogFileToDisk')
      .mockResolvedValue()
    await writeFile(MOTION_LOG_FILE_PATH, 'c')
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('/log-files/app', () => {
    return request(app.getHttpServer())
      .get('/log-files/app')
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect('Content-Disposition', `attachment; filename="app.log"`)
      .responseType('blob')
  })

  it('/log-files/motion', () => {
    return request(app.getHttpServer())
      .get('/log-files/motion')
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect('Content-Disposition', `attachment; filename="motion.log"`)
      .responseType('blob')
  })

  afterEach(() => {
    app.close()
  })

  afterAll(async () => {
    spyWriteAppLogFileToDisk.mockRestore()
    spyWriteMotionLogFileToDisk.mockRestore()
    await rm(APP_LOG_FILE_PATH)
    await rm(MOTION_LOG_FILE_PATH)
  })
})
