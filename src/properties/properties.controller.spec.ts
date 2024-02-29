// © 2022-2024 Luxembourg Institute of Science and Technology
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { VersionDto } from './dto/version.dto'
import { PropertiesController } from './properties.controller'
import { PropertiesService } from './properties.service'

const AVAILABLE_TIME_ZONES = ['a', 'b']

const DEVICE_ID = 'a'

const VERSION: VersionDto = {
  commitHash: 'a',
  version: 'b',
}

describe(PropertiesController.name, () => {
  let controller: PropertiesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        ConfigService,
        {
          provide: PropertiesService,
          useValue: {
            getAvailableTimeZones: jest
              .fn()
              .mockReturnValue(AVAILABLE_TIME_ZONES),
            getDeviceId: jest.fn().mockReturnValue(DEVICE_ID),
            getVersion: jest.fn().mockReturnValue(VERSION),
          },
        },
      ],
    }).compile()

    controller = module.get<PropertiesController>(PropertiesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('gets the available time zones', async () => {
    const response = await controller.getAvailableTimeZones()
    expect(response).toEqual({ timeZones: AVAILABLE_TIME_ZONES })
  })

  it('gets the device ID', async () => {
    const response = await controller.getDeviceId()
    expect(response).toEqual({ deviceId: DEVICE_ID })
  })

  it('gets the version', async () => {
    const response = await controller.getVersion()
    expect(response).toEqual(VERSION)
  })
})
