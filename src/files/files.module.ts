// © 2022-2024 Luxembourg Institute of Science and Technology
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SettingsModule } from '../settings/settings.module'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [ConfigModule, SettingsModule],
  exports: [FilesService],
})
export class FilesModule {}
