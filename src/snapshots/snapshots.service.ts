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
