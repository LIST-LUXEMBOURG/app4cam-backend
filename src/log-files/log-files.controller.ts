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
import { LogFilesService } from './log-files.service'

const APP_LOG_FILENAME = 'app.log'
const LOG_FILE_CONTENT_TYPE = 'text/plain'
const MOTION_LOG_FILENAME = 'motion.log'

@Controller('log-files')
export class LogFilesController {
  constructor(private readonly logFilesService: LogFilesService) {}

  @Get('app')
  async downloadAppLogFile(@Res({ passthrough: true }) res) {
    const stream = await this.logFilesService.getAppLogFileStream()
    res.set({
      'Content-Type': LOG_FILE_CONTENT_TYPE,
      'Content-Disposition': `attachment; filename="${APP_LOG_FILENAME}"`,
    })
    return new StreamableFile(stream)
  }

  @Get('motion')
  async downloadMotionLogFile(@Res({ passthrough: true }) res) {
    const stream = await this.logFilesService.getMotionLogFileStream()
    res.set({
      'Content-Type': LOG_FILE_CONTENT_TYPE,
      'Content-Disposition': `attachment; filename="${MOTION_LOG_FILENAME}"`,
    })
    return new StreamableFile(stream)
  }
}
