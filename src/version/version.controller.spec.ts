import { Test, TestingModule } from '@nestjs/testing'
import { VersionController } from './version.controller'
import { VersionDto } from './version.dto'
import { VersionService } from './version.service'

const VERSION: VersionDto = {
  commitHash: 'a',
  version: 'b',
}

describe(VersionController.name, () => {
  let controller: VersionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VersionController],
      providers: [
        {
          provide: VersionService,
          useValue: {
            getVersion: jest.fn().mockReturnValue(VERSION),
          },
        },
      ],
    }).compile()

    controller = module.get<VersionController>(VersionController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('gets the version', async () => {
    const response = await controller.getVersion()
    expect(response).toEqual(VERSION)
  })
})
