/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
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
