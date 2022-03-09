import { Controller, Get, Res, StreamableFile } from '@nestjs/common'
import { SnapshotsService } from './snapshots.service'

const LATEST_SNAPSHOT_FILENAME = 'latest_snapshot.jpg'

@Controller('snapshots')
export class SnapshotsController {
  constructor(private readonly snapshotsService: SnapshotsService) {}

  @Get()
  async takeSnapshot(@Res({ passthrough: true }) res): Promise<StreamableFile> {
    const snapshot = await this.snapshotsService.takeSnapshot()
    res.set({
      'Content-Type': snapshot.contentType,
      'Content-Disposition':
        'attachment; filename="' + LATEST_SNAPSHOT_FILENAME + '"',
    })
    return new StreamableFile(snapshot.stream)
  }
}
