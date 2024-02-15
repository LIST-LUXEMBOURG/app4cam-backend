// © 2022-2024 Luxembourg Institute of Science and Technology
import { Injectable, Logger } from '@nestjs/common'
import { FilesService } from '../files/files.service'
import { MotionClient } from '../motion-client'
import { FileSystemInteractor } from './file-system-interactor'

@Injectable()
export class SnapshotsService {
  private readonly logger = new Logger(SnapshotsService.name)

  constructor(private readonly filesService: FilesService) {}

  async takeSnapshot() {
    await MotionClient.takeSnapshot()
    await new Promise((resolve) => setTimeout(resolve, 500)) // Workaround for not opening snapshot directly.
    const fileFolderPath = await MotionClient.getTargetDir()
    const filename =
      await FileSystemInteractor.getNameOfMostRecentlyModifiedFile(
        fileFolderPath,
      )
    return this.filesService.getStreamableFile(filename)
  }
}
