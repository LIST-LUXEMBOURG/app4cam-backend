import { Test, TestingModule } from '@nestjs/testing'
import { PropertiesController } from './properties.controller'
import { VersionDto } from './dto/version.dto'
import { PropertiesService } from './properties.service'
import { DeviceIdDto } from './dto/device-id.dto'

const DEVICE_ID: DeviceIdDto = {
  deviceId: 'a',
}

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
        {
          provide: PropertiesService,
          useValue: {
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

  it('gets the device ID', async () => {
    const response = await controller.getDeviceId()
    expect(response).toEqual(DEVICE_ID)
  })

  it('gets the version', async () => {
    const response = await controller.getVersion()
    expect(response).toEqual(VERSION)
  })
})
