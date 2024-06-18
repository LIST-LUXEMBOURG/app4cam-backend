// © 2023-2024 Luxembourg Institute of Science and Technology
import { createReadStream } from 'fs'
import path = require('path')
import { Readable } from 'stream'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'
import { LogFileInteractor } from './log-file-interactor'

const TEMPORARY_APP_LOG_FILENAME = 'app.log'
const TEMPORARY_MOTION_LOG_FILENAME = 'motion.log'
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
    try {
      await LogFileInteractor.writeAppLogFileToDisk(
        this.serviceName,
        logFilePath,
      )
    } catch (error) {
      if (!(error instanceof CommandUnavailableOnWindowsException)) {
        throw error
      }
    }
    const stream = createReadStream(logFilePath)
    return stream
  }

  async getMotionLogFileStream(): Promise<Readable> {
    const logFilePath = path.join(
      TEMPORARY_FOLDER_PATH,
      TEMPORARY_MOTION_LOG_FILENAME,
    )
    try {
      await LogFileInteractor.writeMotionLogFileToDisk(logFilePath)
    } catch (error) {
      if (!(error instanceof CommandUnavailableOnWindowsException)) {
        throw error
      }
    }
    const stream = createReadStream(logFilePath)
    return stream
  }
}
