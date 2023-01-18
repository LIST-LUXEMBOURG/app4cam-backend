import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LogFilesController } from './log-files.controller'
import { LogFilesService } from './log-files.service'

@Module({
  controllers: [LogFilesController],
  providers: [ConfigService, LogFilesService],
  imports: [ConfigModule],
})
export class LogFilesModule {}
