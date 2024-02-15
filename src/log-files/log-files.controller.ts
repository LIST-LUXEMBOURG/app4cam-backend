// © 2023-2024 Luxembourg Institute of Science and Technology
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
