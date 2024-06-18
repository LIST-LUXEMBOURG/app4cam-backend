// © 2022-2024 Luxembourg Institute of Science and Technology
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
