import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PropertiesModule } from '../properties/properties.module'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  controllers: [SettingsController],
  providers: [ConfigService, SettingsService],
  imports: [ConfigModule, PropertiesModule],
  exports: [SettingsService],
})
export class SettingsModule {}
