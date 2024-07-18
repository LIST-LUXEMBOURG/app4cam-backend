/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
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
import { AccessControlAllowOriginInterceptor } from './access-control-allow-origin.interceptor'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configuration } from './config/configuration'
import { validate } from './config/validation'
import { FilesModule } from './files/files.module'
import { LogFilesModule } from './log-files/log-files.module'
import { LoggerMiddleware } from './logger.middleware'
import { MotionInteractorModule } from './motion-interactor/motion-interactor.module'
import { PropertiesModule } from './properties/properties.module'
import { SettingsModule } from './settings/settings.module'
import { SnapshotsModule } from './snapshots/snapshots.module'
import { StorageModule } from './storage/storage.module'

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AccessControlAllowOriginInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
