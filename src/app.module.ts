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
import { LoggerMiddleware } from './logger.middleware'
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
