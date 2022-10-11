import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { VersionDto } from '../src/properties/dto/version.dto'
import { MacAddressInteractor } from '../src/properties/interactors/mac-address-interactor'
import { VersionInteractor } from '../src/properties/interactors/version-interactor'

describe('PropertiesController (e2e)', () => {
  const DEVICE_ID = 'a'
  const USAGE: VersionDto = {
    commitHash: 'abcd',
    version: '1.0.0',
  }

  let app: INestApplication
  let spyGetFirstMacAddress
  let spyGetVersion

  beforeAll(() => {
    spyGetFirstMacAddress = jest
      .spyOn(MacAddressInteractor, 'getFirstMacAddress')
      .mockResolvedValue(DEVICE_ID)
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

  describe('/properties', () => {
    it('/deviceId (GET)', () => {
      return request(app.getHttpServer())
        .get('/properties/deviceId')
        .expect('Content-Type', /json/)
        .expect(200, { deviceId: DEVICE_ID })
    })

    it('/version (GET)', async () => {
      const response = await request(app.getHttpServer()).get(
        '/properties/version',
      )
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
    spyGetFirstMacAddress.mockRestore()
    spyGetVersion.mockRestore()
  })
})