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
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { AccessControlAllowOriginInterceptor } from './access-control-allow-origin.interceptor.js'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { configuration } from './config/configuration.js'
import { validate } from './config/validation.js'
import { FilesModule } from './files/files.module.js'
import { LogFilesModule } from './log-files/log-files.module.js'
import { LoggerMiddleware } from './logger.middleware.js'
import { MotionClientService } from './motion-client.service.js'
import { MotionInteractorModule } from './motion-interactor/motion-interactor.module.js'
import { PropertiesModule } from './properties/properties.module.js'
import { SettingsModule } from './settings/settings.module.js'
import { SnapshotsModule } from './snapshots/snapshots.module.js'
import { StorageModule } from './storage/storage.module.js'
import { UpgradesModule } from './upgrades/upgrades.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/${process.env.NODE_ENV}.env`,
      load: [configuration],
      validate,
    }),
    FilesModule,
    PropertiesModule,
    SettingsModule,
    ScheduleModule.forRoot(),
    SnapshotsModule,
    StorageModule,
    LogFilesModule,
    MotionInteractorModule,
    UpgradesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AccessControlAllowOriginInterceptor,
    },
    MotionClientService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
