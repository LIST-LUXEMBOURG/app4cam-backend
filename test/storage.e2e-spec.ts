import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { DiskSpaceUsageInteractor } from '../src/storage/disk-space-usage-interactor'
import { DiskSpaceUsageDto } from 'src/storage/disk-space-usage.dto'

describe('StorageController (e2e)', () => {
  const USAGE: DiskSpaceUsageDto = {
    capacityKb: 1,
    usedPercentage: 2,
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
    await app.init()
  })

  describe('/storage', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/storage')
        .expect('Content-Type', /json/)
        .expect(200, USAGE)
    })
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyGetDiskSpaceUsage.mockRestore()
  })
})
