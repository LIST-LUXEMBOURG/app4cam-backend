// © 2022-2024 Luxembourg Institute of Science and Technology
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SettingsModule } from '../settings/settings.module'
import { FileStatsController } from './file-stats.controller'
import { FileStatsService } from './file-stats.service'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

@Module({
  controllers: [FilesController, FileStatsController],
  providers: [FilesService, FileStatsService],
  imports: [ConfigModule, SettingsModule],
  exports: [FilesService],
})
export class FilesModule {}
