import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { json, urlencoded } from 'body-parser'
import { AppModule } from './app.module'
import { InitialisationInteractor } from './initialisation-interactor'
import { PropertiesService } from './properties/properties.service'

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
  await propertiesService.saveDeviceIdToTextFile()

  const configService = app.get(ConfigService)
  const deviceType = configService.get('deviceType')
  const serviceName = configService.get('serviceName')
  if (deviceType === 'Variscite') {
    await InitialisationInteractor.initialiseLights(serviceName)
  }

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
