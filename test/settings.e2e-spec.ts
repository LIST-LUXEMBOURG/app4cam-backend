// © 2022-2024 Luxembourg Institute of Science and Technology
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { InitialisationInteractor } from '../src/initialisation-interactor'
import { SystemTimeZonesInteractor } from '../src/properties/interactors/system-time-zones-interactor'
import { AccessPointInteractor } from '../src/settings/interactors/access-point-interactor'
import { SystemTimeInteractor } from '../src/settings/interactors/system-time-interactor'
import { SettingsFileProvider } from '../src/settings/settings-file-provider'
import { AppModule } from './../src/app.module'
import {
  CameraSettings,
  GeneralSettings,
  Settings,
  TriggeringSettings,
} from 'src/settings/settings'

const MOVIE_QUALITY = 80
const PICTURE_QUALITY = 80
const SHOTS_FOLDER = '/a'
const TRIGGER_THRESHOLD = 75

jest.mock('../src/motion-client', () => ({
  MotionClient: {
    getHeight: () => 10,
    getWidth: () => 10,
    setFilename: jest.fn(),
    setLeftTextOnImage: jest.fn(),
    getMovieQuality: () => MOVIE_QUALITY,
    setMovieQuality: jest.fn(),
    getMovieOutput: () => 'on',
    setMovieOutput: jest.fn(),
    getPictureQuality: () => PICTURE_QUALITY,
    setPictureQuality: jest.fn(),
    getPictureOutput: () => 'best',
    setPictureOutput: jest.fn(),
    setTargetDir: jest.fn(),
    getThreshold: () => 75,
    setThreshold: jest.fn(),
    getTargetDir: () => SHOTS_FOLDER,
    getVideoParams: () =>
      '"Focus, Auto"=0,"Focus (absolute)"=200,Brightness=16',
    setVideoParams: jest.fn(),
  },
}))

describe('SettingsController (e2e)', () => {
  const AVAILABLE_TIMEZONES = ['Europe/Luxembourg', 'Europe/Paris']
  const CAMERA_LIGHT = 'visible' as const
  const FOCUS = 200
  const PASSWORD = 'p'
  const SHOT_TYPES = ['pictures' as const, 'videos' as const]
  const SLEEPING_TIME = '10:12'
  const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
  const TRIGGERING_LIGHT = 'infrared' as const
  const WAKING_UP_TIME = '10:17'

  const CAMERA_JSON_SETTINGS = {
    light: CAMERA_LIGHT,
  }
  const GENERAL_JSON_SETTINGS = {
    deviceName: 'd',
    siteName: 's',
  }
  const TRIGGERING_JSON_SETTINGS = {
    sleepingTime: SLEEPING_TIME,
    wakingUpTime: WAKING_UP_TIME,
    light: TRIGGERING_LIGHT,
  }
  const JSON_SETTINGS = {
    camera: CAMERA_JSON_SETTINGS,
    general: GENERAL_JSON_SETTINGS,
    triggering: TRIGGERING_JSON_SETTINGS,
  }

  const ALL_SETTINGS: Settings = {
    camera: {
      focus: FOCUS,
      light: CAMERA_LIGHT,
      pictureQuality: PICTURE_QUALITY,
      shotTypes: SHOT_TYPES,
      videoQuality: MOVIE_QUALITY,
    },
    general: {
      ...GENERAL_JSON_SETTINGS,
      password: PASSWORD,
      systemTime: SYSTEM_TIME,
      timeZone: AVAILABLE_TIMEZONES[0],
    },
    triggering: {
      ...TRIGGERING_JSON_SETTINGS,
      threshold: TRIGGER_THRESHOLD,
    },
  }

  let app: INestApplication
  let spyReadSettingsFile
  let spyWriteSettingsFile
  let spyGetSystemTime
  let spySetSystemAndRtcTime
  let spyGetAvailableTimeZones
  let spyGetTimeZone
  let spySetTimeZone
  let spyInitializeLights
  let spySetAccessPointNameOrPassword
  let spyGetAccessPointPassword

  beforeAll(() => {
    spyReadSettingsFile = jest
      .spyOn(SettingsFileProvider, 'readSettingsFile')
      .mockImplementation(() => Promise.resolve(JSON_SETTINGS))
    spyWriteSettingsFile = jest
      .spyOn(SettingsFileProvider, 'writeSettingsToFile')
      .mockImplementation(() => Promise.resolve())
    spyGetSystemTime = jest
      .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
      .mockImplementation(() => Promise.resolve(SYSTEM_TIME))
    spySetSystemAndRtcTime = jest
      .spyOn(SystemTimeInteractor, 'setSystemAndRtcTimeInIso8601Format')
      .mockImplementation(() => Promise.resolve())
    spyGetAvailableTimeZones = jest
      .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
      .mockImplementation(() => Promise.resolve(AVAILABLE_TIMEZONES))
    spyGetTimeZone = jest
      .spyOn(SystemTimeInteractor, 'getTimeZone')
      .mockImplementation(() => Promise.resolve(ALL_SETTINGS.general.timeZone))
    spySetTimeZone = jest
      .spyOn(SystemTimeInteractor, 'setTimeZone')
      .mockImplementation(() => Promise.resolve())
    spyInitializeLights = jest
      .spyOn(InitialisationInteractor, 'resetLights')
      .mockResolvedValue()
    spySetAccessPointNameOrPassword = jest
      .spyOn(AccessPointInteractor, 'setAccessPointNameOrPassword')
      .mockResolvedValue()
    spyGetAccessPointPassword = jest
      .spyOn(AccessPointInteractor, 'getAccessPointPassword')
      .mockResolvedValue(PASSWORD)
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  describe('/settings', () => {
    describe('/ (GET)', () => {
      it('returns all settings', () => {
        return request(app.getHttpServer())
          .get('/settings')
          .expect('Content-Type', /json/)
          .expect(200, ALL_SETTINGS)
      })
    })

    describe('/ (PATCH)', () => {
      it('returns success on valid focus value', () => {
        const data = { camera: { focus: 300 } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on negative focus value', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ camera: { focus: -100 } })
          .expect(400)
      })

      it('returns bad request on string focus value', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ camera: { focus: 'a' } })
          .expect(400)
      })

      it('returns bad request on invalid option in shot types', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            camera: {
              shotTypes: ['a'],
            },
          })
          .expect(400)
      })

      it('returns bad request on invalid value for video quality', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            camera: {
              videoQuality: 101,
            },
          })
          .expect(400)
      })

      it('returns bad request on invalid value for picture quality', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            camera: {
              pictureQuality: -1,
            },
          })
          .expect(400)
      })

      it('returns success on device name', () => {
        const data = { general: { deviceName: 'a' } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on invalid space in device ID', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ general: { deviceName: 'a ' } })
          .expect(400)
      })

      it('returns success on site name', () => {
        const data = { general: { siteName: 'a' } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns success on empty site name', () => {
        const data = { general: { siteName: '' } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on invalid space in site name', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ general: { siteName: 'a ' } })
          .expect(400)
      })

      it('returns success system time', () => {
        const data = { general: { systemTime: new Date().toISOString() } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns success on time zone', () => {
        const data = { general: { timeZone: AVAILABLE_TIMEZONES[0] } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns success trigger threshold', () => {
        const data = { triggering: { threshold: 1 } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on too low threshold', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ triggering: { threshold: 0 } })
          .expect(400)
      })

      it('returns bad request on too high threshold', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ triggering: { threshold: 2147483648 } })
          .expect(400)
      })

      it('returns bad request on decimal threshold', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ triggering: { threshold: 1.1 } })
          .expect(400)
      })

      it('returns success with empty sleeping and waking up times', () => {
        const data = { triggering: { sleepingTime: '', wakingUpTime: '' } }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on empty sleeping time', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ triggering: { sleepingTime: '' } })
          .expect(400)
      })

      it('returns bad request on empty waking up time', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ triggering: { wakingUpTime: '' } })
          .expect(400)
      })

      it('returns bad request on empty sleeping time while waking up time is not', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({ triggering: { sleepingTime: '', wakingUpTime: '20:00' } })
          .expect(400)
      })

      it('returns bad request on invalid camera light', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            camera: {
              light: 'a',
            },
          })
          .expect(400)
      })

      it('returns success with valid camera light', () => {
        const data = {
          camera: {
            light: 'visible',
          },
        }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on invalid triggering light', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            triggering: {
              light: 'a',
            },
          })
          .expect(400)
      })

      it('returns success with valid triggering light', () => {
        const data = {
          triggering: {
            light: 'infrared',
          },
        }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on invalid camera and triggering light combination', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            camera: {
              light: 'infrared',
            },
            triggering: {
              light: 'visible',
            },
          })
          .expect(400)
      })

      it('returns success with valid Wi-Fi password', () => {
        const data = {
          general: {
            password: '12345678',
          },
        }
        return request(app.getHttpServer())
          .patch('/settings')
          .send(data)
          .expect(200, data)
      })

      it('returns bad request on too short Wi-Fi password', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            general: {
              password: '0',
            },
          })
          .expect(400)
      })

      it('returns bad request on too long Wi-Fi password', () => {
        return request(app.getHttpServer())
          .patch('/settings')
          .send({
            general: {
              password:
                '01234567890123456789012345678901234567890123456789012345678901234',
            },
          })
          .expect(400)
      })
    })

    describe('/ (PUT)', () => {
      const goodCameraPutSettings: CameraSettings = {
        focus: FOCUS,
        light: 'visible',
        pictureQuality: PICTURE_QUALITY,
        shotTypes: SHOT_TYPES,
        videoQuality: MOVIE_QUALITY,
      }
      const goodGeneralPutSettings: GeneralSettings = {
        deviceName: 'd',
        password: '12345678',
        siteName: 's',
        systemTime: new Date().toISOString(),
        timeZone: ALL_SETTINGS.general.timeZone,
      }
      const goodTriggeringPutSettings: TriggeringSettings = {
        threshold: TRIGGER_THRESHOLD,
        sleepingTime: '18:00',
        wakingUpTime: '20:00',
        light: 'infrared',
      }

      it('returns success on all settings', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: goodCameraPutSettings,
            general: goodGeneralPutSettings,
            triggering: goodTriggeringPutSettings,
          })
          .expect(200)
      })

      it('returns success on empty site name', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: goodCameraPutSettings,
            general: {
              ...goodGeneralPutSettings,
              siteName: '',
            },
            triggering: goodTriggeringPutSettings,
          })
          .expect(200)
      })

      it('returns bad request when incomplete', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({ general: { siteName: 's' } })
          .expect(400)
      })

      it('returns bad request on empty option in shot types', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: {
              ...goodCameraPutSettings,
              shotTypes: [''],
            },
            general: goodGeneralPutSettings,
            triggering: goodTriggeringPutSettings,
          })
          .expect(400)
      })

      it('returns bad request on negative focus value', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: {
              ...goodCameraPutSettings,
              focus: -100,
            },
            general: goodGeneralPutSettings,
            triggering: goodTriggeringPutSettings,
          })
          .expect(400)
      })

      it('returns bad request on string focus value', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: {
              ...goodCameraPutSettings,
              focus: 'a',
            },
            general: goodGeneralPutSettings,
            triggering: goodTriggeringPutSettings,
          })
          .expect(400)
      })

      it('returns bad request on invalid value as video quality', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: {
              ...goodCameraPutSettings,
              videoQuality: -1,
            },
            general: goodGeneralPutSettings,
            triggering: goodTriggeringPutSettings,
          })
          .expect(400)
      })

      it('returns bad request on invalid value as picture quality', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: {
              ...goodCameraPutSettings,
              pictureQuality: 101,
            },
            general: goodGeneralPutSettings,
            triggering: goodTriggeringPutSettings,
          })
          .expect(400)
      })

      it('returns bad request on invalid option in shot types', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: {
              ...goodCameraPutSettings,
              shotTypes: ['a'],
            },
            general: goodGeneralPutSettings,
            triggering: goodTriggeringPutSettings,
          })
          .expect(400)
      })

      it('returns bad request on empty waking up time while sleeping time is not', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: goodCameraPutSettings,
            general: goodGeneralPutSettings,
            triggering: {
              ...goodTriggeringPutSettings,
              wakingUpTime: '',
            },
          })
          .expect(400)
      })

      it('returns bad request on invalid camera and triggering light combination', () => {
        return request(app.getHttpServer())
          .put('/settings')
          .send({
            camera: {
              ...goodCameraPutSettings,
              light: 'infrared',
            },
            general: goodGeneralPutSettings,
            triggering: {
              ...goodTriggeringPutSettings,
              light: 'visible',
            },
          })
          .expect(400)
      })
    })

    describe('/cameraLight (GET)', () => {
      it('returns camera light type', () => {
        return request(app.getHttpServer())
          .get('/settings/cameraLight')
          .expect('Content-Type', /text\/plain/)
          .expect(200, CAMERA_LIGHT)
      })
    })

    describe('/siteName (GET)', () => {
      it('returns site name', () => {
        return request(app.getHttpServer())
          .get('/settings/siteName')
          .expect('Content-Type', /json/)
          .expect(200, { siteName: GENERAL_JSON_SETTINGS.siteName })
      })
    })

    describe('/siteName (PUT)', () => {
      it('returns success', () => {
        return request(app.getHttpServer())
          .put('/settings/siteName')
          .send({ siteName: 'a-0A' })
          .expect(200)
      })

      it('returns success when empty', async () => {
        return request(app.getHttpServer())
          .put('/settings/siteName')
          .send({ siteName: '' })
          .expect(200)
      })

      it('returns bad request on space', () => {
        return request(app.getHttpServer())
          .put('/settings/siteName')
          .send({ siteName: 'a ' })
          .expect(400)
      })

      it('returns bad request on underscore', () => {
        return request(app.getHttpServer())
          .put('/settings/siteName')
          .send({ siteName: 'a_' })
          .expect(400)
      })
    })

    describe('/deviceName (GET)', () => {
      it('returns device name', () => {
        return request(app.getHttpServer())
          .get('/settings/deviceName')
          .expect('Content-Type', /json/)
          .expect(200, { deviceName: GENERAL_JSON_SETTINGS.deviceName })
      })
    })

    describe('/deviceName (PUT)', () => {
      it('returns success', () => {
        return request(app.getHttpServer())
          .put('/settings/deviceName')
          .send({ deviceName: 'a-0A' })
          .expect(200)
      })

      it('returns bad request on space', () => {
        return request(app.getHttpServer())
          .put('/settings/deviceName')
          .send({ deviceName: 'a ' })
          .expect(400)
      })

      it('returns bad request on underscore', () => {
        return request(app.getHttpServer())
          .put('/settings/deviceName')
          .send({ deviceName: 'a_' })
          .expect(400)
      })

      it('returns bad request when empty', async () => {
        return request(app.getHttpServer())
          .put('/settings/deviceName')
          .send({ deviceName: '' })
          .expect(400)
      })
    })

    describe('/shotsFolder (GET)', () => {
      it('returns shot folder', async () => {
        return request(app.getHttpServer())
          .get('/settings/shotsFolder')
          .expect('Content-Type', /json/)
          .expect(200, { shotsFolder: SHOTS_FOLDER })
      })
    })

    describe('/shotsFolder (PUT)', () => {
      it('returns success', async () => {
        return request(app.getHttpServer())
          .put('/settings/shotsFolder')
          .send({ shotsFolder: '/media/a' })
          .expect(200)
      })

      it('returns bad request when empty', async () => {
        return request(app.getHttpServer())
          .put('/settings/shotsFolder')
          .send({ shotsFolder: '' })
          .expect(400)
      })

      it('returns bad request on non-media path', async () => {
        return request(app.getHttpServer())
          .put('/settings/shotsFolder')
          .send({ shotsFolder: '/a/b' })
          .expect(403)
      })
    })

    describe('/systemTime (GET)', () => {
      it('returns system time', () => {
        return request(app.getHttpServer())
          .get('/settings/systemTime')
          .expect('Content-Type', /json/)
          .expect(200, { systemTime: SYSTEM_TIME })
      })
    })

    describe('/systemTime (PUT)', () => {
      it('returns success', async () => {
        return request(app.getHttpServer())
          .put('/settings/systemTime')
          .send({ systemTime: '2022-01-18T14:48:37+01:00' })
          .expect(200)
      })

      it('returns bad request when empty', async () => {
        return request(app.getHttpServer())
          .put('/settings/systemTime')
          .send({ systemTime: '' })
          .expect(400)
      })

      it('returns bad request when non-date', async () => {
        return request(app.getHttpServer())
          .put('/settings/systemTime')
          .send({ systemTime: 'a' })
          .expect(400)
      })
    })

    describe('/timeZone (GET)', () => {
      it('returns time zone', () => {
        return request(app.getHttpServer())
          .get('/settings/timeZone')
          .expect('Content-Type', /json/)
          .expect(200, { timeZone: ALL_SETTINGS.general.timeZone })
      })
    })

    describe('/timeZone (PUT)', () => {
      it('returns success', async () => {
        return request(app.getHttpServer())
          .put('/settings/timeZone')
          .send({ timeZone: AVAILABLE_TIMEZONES[0] })
          .expect(200)
      })

      it('returns bad request when empty', async () => {
        return request(app.getHttpServer())
          .put('/settings/timeZone')
          .send({ timeZone: '' })
          .expect(400)
      })

      it('returns bad request when non-supported', async () => {
        return request(app.getHttpServer())
          .put('/settings/timeZone')
          .send({ timeZone: 'a' })
          .expect(400)
      })
    })

    describe('/triggeringLight (GET)', () => {
      it('returns triggering light type', () => {
        return request(app.getHttpServer())
          .get('/settings/triggeringLight')
          .expect('Content-Type', /text\/plain/)
          .expect(200, TRIGGERING_LIGHT)
      })
    })
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyReadSettingsFile.mockRestore()
    spyWriteSettingsFile.mockRestore()
    spyGetSystemTime.mockRestore()
    spySetSystemAndRtcTime.mockRestore()
    spyGetAvailableTimeZones.mockRestore()
    spyGetTimeZone.mockRestore()
    spySetTimeZone.mockRestore()
    spyInitializeLights.mockRestore()
    spySetAccessPointNameOrPassword.mockRestore()
    spyGetAccessPointPassword.mockRestore()
  })
})
