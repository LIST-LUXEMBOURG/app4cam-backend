import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { VersionInteractor } from '../src/version/version-interactor'
import { VersionDto } from '../src/version/version.dto'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('VersionController (e2e)', () => {
  const USAGE: VersionDto = {
    commitHash: 'abcd',
    version: '1.0.0',
  }

  let app: INestApplication
  let spyGetVersion

  beforeAll(() => {
    spyGetVersion = jest
      .spyOn(VersionInteractor, 'getVersion')
      .mockImplementation(() => Promise.resolve(USAGE))
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('/version', () => {
    it('/ (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/version')
      expect(response.headers['content-type']).toMatch(/json/)
      expect(response.status).toEqual(200)
      expect(response.body).toHaveProperty('commitHash')
      expect(response.body.commitHash).toMatch(/[a-z0-9]{4,}/)
      expect(response.body).toHaveProperty('version')
      expect(response.body.version).toMatch(/[0-9]+.[0-9]+.[0-9]+/)
    })
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyGetVersion.mockRestore()
  })
})
