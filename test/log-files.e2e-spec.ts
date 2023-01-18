import { rm, writeFile } from 'fs/promises'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { LogFileInteractor } from '../src/log-files/log-file-interactor'
import { AppModule } from './../src/app.module'

const APP_LOG_FILE_PATH = 'temp/app.log'

const FIXTURE_LOG_FILE_PATH = 'src/log-files/fixtures/a.log'

jest.mock('../src/motion-client', () => ({
  MotionClient: {
    getLogFilePath: () => FIXTURE_LOG_FILE_PATH,
  },
}))

describe('LogFilesController (e2e)', () => {
  let app: INestApplication

  let spyWriteAppLogFileToDisk

  beforeAll(async () => {
    spyWriteAppLogFileToDisk = jest
      .spyOn(LogFileInteractor, 'writeAppLogFileToDisk')
      .mockResolvedValue()
    await writeFile(APP_LOG_FILE_PATH, 'b')
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
    await rm(APP_LOG_FILE_PATH)
  })
})
