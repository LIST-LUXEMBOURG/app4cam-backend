import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { FilesController } from './files.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SettingsModule } from '../settings/settings.module'

@Module({
  controllers: [FilesController],
  providers: [ConfigService, FilesService],
  imports: [ConfigModule, SettingsModule],
})
export class FilesModule {}
