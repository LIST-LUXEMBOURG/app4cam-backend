import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('VersionController (e2e)', () => {
  let app: INestApplication

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
})
