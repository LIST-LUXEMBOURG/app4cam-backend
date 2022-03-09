import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FilesModule } from './files/files.module'
import { SettingsModule } from './settings/settings.module'
import { ConfigModule } from '@nestjs/config'
import { validate } from './config/validation'
import { configuration } from './config/configuration'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AccessControlAllowOriginInterceptor } from './access-control-allow-origin.interceptor'
import { LoggerMiddleware } from './logger.middleware'
import { ScheduleModule } from '@nestjs/schedule'
import { SnapshotsModule } from './snapshots/snapshots.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/${process.env.NODE_ENV}.env`,
      load: [configuration],
      validate,
    }),
    FilesModule,
    SettingsModule,
    ScheduleModule.forRoot(),
    SnapshotsModule,
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
