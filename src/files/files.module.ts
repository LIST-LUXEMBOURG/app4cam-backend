import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SettingsModule } from '../settings/settings.module'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

@Module({
  controllers: [FilesController],
  providers: [ConfigService, FilesService],
  imports: [ConfigModule, SettingsModule],
  exports: [FilesService],
})
export class FilesModule {}
