import { Injectable, Logger } from '@nestjs/common'
import { FilesService } from '../files/files.service'
import { MotionClient } from '../motion-client'

const LATEST_SNAPSHOT_SYMBOLIC_LINK = 'lastsnap.jpg'

@Injectable()
export class SnapshotsService {
  private readonly logger = new Logger(SnapshotsService.name)

  constructor(private readonly filesService: FilesService) {}

  async takeSnapshot() {
    await MotionClient.takeSnapshot()
    await new Promise((resolve) => setTimeout(resolve, 333)) // Workaround for not opening previous snapshot
    return this.filesService.getStreamableFile(LATEST_SNAPSHOT_SYMBOLIC_LINK)
  }
}
