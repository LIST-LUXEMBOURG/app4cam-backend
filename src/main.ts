// © 2022-2024 Luxembourg Institute of Science and Technology
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { json, urlencoded } from 'body-parser'
import { AppModule } from './app.module'
import { InitialisationInteractor } from './initialisation-interactor'
import { PropertiesService } from './properties/properties.service'
import { UndefinedPathException } from './settings/exceptions/UndefinedPathException'
import { SettingsService } from './settings/settings.service'

const PAYLOAD_LIMIT = '1mb'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      exposedHeaders: ['Content-Disposition'],
    },
  })
  app.useGlobalPipes(new ValidationPipe())
  app.getHttpAdapter().getInstance().disable('x-powered-by')

  app.use(json({ limit: PAYLOAD_LIMIT }))
  app.use(urlencoded({ extended: false, limit: PAYLOAD_LIMIT }))

  const propertiesService = app.get(PropertiesService)
  await propertiesService.logVersion()
  await propertiesService.saveDeviceIdToTextFile()

  const settingsService = app.get(SettingsService)

  const configService = app.get(ConfigService)
  const deviceType = configService.get<string>('deviceType')

  if (process.platform !== 'win32') {
    const mountPath =
      await InitialisationInteractor.getNewestMediaPath(deviceType)
    try {
      await settingsService.setShotsFolder(mountPath)
    } catch (e) {
      if (!(e instanceof UndefinedPathException)) {
        throw e
      }
    }
  }
  const serviceName = configService.get('serviceName')
  const lightType = await settingsService.getTriggeringLight()
  await InitialisationInteractor.resetLights(serviceName, deviceType, lightType)

  const version = (await propertiesService.getVersion()).version
  const config = new DocumentBuilder()
    .setTitle('App4Cam API')
    .setVersion(version)
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = configService.get('port')
  await app.listen(port)
}
bootstrap()
