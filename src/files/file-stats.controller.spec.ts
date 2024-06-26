// © 2024 Luxembourg Institute of Science and Technology
import { Test, TestingModule } from '@nestjs/testing'
import { SettingsService } from '../settings/settings.service'
import { FileStatsController } from './file-stats.controller'
import { FileStatsService } from './file-stats.service'
import { FilesService } from './files.service'

describe(FileStatsController.name, () => {
  const counts = new Array(24).fill(0)

  let controller: FileStatsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileStatsController],
      providers: [
        FilesService,
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: FileStatsService,
          useValue: {
            getNumberShotsPerHoursOfDay: jest.fn().mockResolvedValue(counts),
          },
        },
      ],
    }).compile()

    controller = module.get<FileStatsController>(FileStatsController)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
  })

  it('gets the number of shots per hours of the day', async () => {
    const response = await controller.getNumberShotsPerHoursOfDay()
    expect(response).toEqual({ hoursOfDayCounts: counts })
  })
})
