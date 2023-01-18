import { createReadStream } from 'fs'
import { access, constants } from 'fs/promises'
import path = require('path')
import { Readable } from 'stream'
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MotionClient } from '../motion-client'
import { LogFileInteractor } from './log-file-interactor'

const TEMPORARY_APP_LOG_FILENAME = 'app.log'
const TEMPORARY_FOLDER_PATH = 'temp' // also used by files module

@Injectable()
export class LogFilesService {
  private readonly serviceName: string

  constructor(private readonly configService: ConfigService) {
    this.serviceName = this.configService.get<string>('serviceName')
  }

  async getAppLogFileStream(): Promise<Readable> {
    const logFilePath = path.join(
      TEMPORARY_FOLDER_PATH,
      TEMPORARY_APP_LOG_FILENAME,
    )
    await LogFileInteractor.writeAppLogFileToDisk(this.serviceName, logFilePath)
    const stream = createReadStream(logFilePath)
    return stream
  }

  async getMotionLogFileStream(): Promise<Readable> {
    const logFilePath = await MotionClient.getLogFilePath()
    try {
      await access(logFilePath, constants.F_OK)
    } catch {
      throw new NotFoundException()
    }
    try {
      await access(logFilePath, constants.R_OK)
    } catch {
      throw new ForbiddenException()
    }
    const stream = createReadStream(logFilePath)
    return stream
  }
}
