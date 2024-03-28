// © 2022-2024 Luxembourg Institute of Science and Technology
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FilesService } from '../files/files.service'
import { MotionClient } from '../motion-client'
import { FileSystemInteractor } from './file-system-interactor'

const BEFORE_OPENING_SNAPSHOT_WAITING_TIME_MS = 500
const RASPBERRY_PI_FACTOR = 4

@Injectable()
export class SnapshotsService {
  private readonly logger = new Logger(SnapshotsService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) {}

  async takeSnapshot() {
    await MotionClient.takeSnapshot()

    const deviceType = this.configService.get<string>('deviceType')
    let waitingTimeMs = BEFORE_OPENING_SNAPSHOT_WAITING_TIME_MS
    if (deviceType === 'RaspberryPi') {
      waitingTimeMs *= RASPBERRY_PI_FACTOR
    }
    // Workaround for not opening snapshot directly as saving file takes some time.
    await new Promise((resolve) => setTimeout(resolve, waitingTimeMs))

    const fileFolderPath = await MotionClient.getTargetDir()
    const filename =
      await FileSystemInteractor.getNameOfMostRecentlyModifiedFile(
        fileFolderPath,
      )
    return this.filesService.getStreamableFile(filename)
  }
}
