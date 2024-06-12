// © 2024 Luxembourg Institute of Science and Technology
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MotionClient } from '../motion-client'
import { PropertiesService } from '../properties/properties.service'
import { SettingsModule } from '../settings/settings.module'
import { SettingsService } from '../settings/settings.service'
import { StorageModule } from '../storage/storage.module'
import { StorageService } from '../storage/storage.service'
import { MotionInteractorService } from './motion-interactor.service'

describe(MotionInteractorService.name, () => {
  let service: MotionInteractorService
  let spyPauseDetection: jest.SpyInstance
  let spyStartDetection: jest.SpyInstance

  beforeAll(() => {
    spyPauseDetection = jest
      .spyOn(MotionClient, 'pauseDetection')
      .mockImplementation()
    spyStartDetection = jest
      .spyOn(MotionClient, 'startDetection')
      .mockImplementation()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        MotionInteractorService,
        PropertiesService,
        SettingsService,
        StorageService,
      ],
      imports: [SettingsModule, StorageModule],
    }).compile()

    service = module.get<MotionInteractorService>(MotionInteractorService)
  })

  it('is defined', () => {
    expect(service).toBeDefined()
  })

  describe('pauseDetectionIfActive', () => {
    it('pauses detection if it is active', async () => {
      const spyIsDetectionStatusActive = jest
        .spyOn(MotionClient, 'isDetectionStatusActive')
        .mockResolvedValue(true)
      await service.pauseDetectionIfActive()
      expect(spyPauseDetection).toHaveBeenCalled()
      spyIsDetectionStatusActive.mockRestore()
    })

    it('does nothing if it is inactive', async () => {
      const spyIsDetectionStatusActive = jest
        .spyOn(MotionClient, 'isDetectionStatusActive')
        .mockResolvedValue(false)
      await service.pauseDetectionIfActive()
      expect(spyPauseDetection).not.toHaveBeenCalled()
      spyIsDetectionStatusActive.mockRestore()
    })

    afterEach(() => {
      spyPauseDetection.mockReset()
    })
  })

  describe('startDetectionIfNotActive', () => {
    it('starts detection if it is inactive', async () => {
      const spyIsDetectionStatusActive = jest
        .spyOn(MotionClient, 'isDetectionStatusActive')
        .mockResolvedValue(false)
      await service.startDetectionIfNotActive()
      expect(spyStartDetection).toHaveBeenCalled()
      spyIsDetectionStatusActive.mockRestore()
    })

    it('does nothing if it is active', async () => {
      const spyIsDetectionStatusActive = jest
        .spyOn(MotionClient, 'isDetectionStatusActive')
        .mockResolvedValue(true)
      await service.startDetectionIfNotActive()
      expect(spyStartDetection).not.toHaveBeenCalled()
      spyIsDetectionStatusActive.mockRestore()
    })

    afterEach(() => {
      spyStartDetection.mockReset()
    })
  })

  afterAll(() => {
    spyPauseDetection.mockRestore()
    spyStartDetection.mockRestore()
  })
})
