import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FilesModule } from './files/files.module'
import { SettingsModule } from './settings/settings.module'
import { ConfigModule } from '@nestjs/config'
import { validate } from './env.validation'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
    FilesModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
