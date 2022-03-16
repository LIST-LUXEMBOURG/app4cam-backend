import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import {
  DiskSpaceUsage,
  DiskSpaceUsageInteractor,
} from '../src/storage/disk-space-usage-interactor'

describe('StorageController (e2e)', () => {
  const USAGE: DiskSpaceUsage = {
    capacityKb: 0,
    usedPercentage: '0.00',
  }
  let app: INestApplication
  let spyGetDiskSpaceUsage

  beforeAll(() => {
    spyGetDiskSpaceUsage = jest
      .spyOn(DiskSpaceUsageInteractor, 'getDiskSpaceUsage')
      .mockImplementation(() => Promise.resolve(USAGE))
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  describe('/storage', () => {
    it('/ (GET)', () => {
      const expectedData = Buffer.from(JSON.stringify(USAGE))
      return request(app.getHttpServer())
        .get('/storage')
        .expect('Content-Type', /json/)
        .responseType('application/json')
        .expect(200, expectedData)
    })
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyGetDiskSpaceUsage.mockRestore()
  })
})
