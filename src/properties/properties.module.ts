// © 2022-2024 Luxembourg Institute of Science and Technology
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PropertiesController } from './properties.controller'
import { PropertiesService } from './properties.service'

@Module({
  controllers: [PropertiesController],
  providers: [ConfigService, PropertiesService],
  imports: [ConfigModule],
  exports: [PropertiesService],
})
export class PropertiesModule {}
