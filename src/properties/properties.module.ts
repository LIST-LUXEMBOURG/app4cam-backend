/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MotionClientService } from '../motion-client.service'
import { SettingsModule } from '../settings/settings.module'
import { SettingsService } from '../settings/settings.service'
import { PropertiesController } from './properties.controller'
import { PropertiesService } from './properties.service'

@Module({
  controllers: [PropertiesController],
  providers: [
    ConfigService,
    MotionClientService,
    PropertiesService,
    SettingsService,
  ],
  imports: [ConfigModule, forwardRef(() => SettingsModule)],
  exports: [PropertiesService],
})
export class PropertiesModule {}
