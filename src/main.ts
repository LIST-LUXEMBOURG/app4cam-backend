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
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { json, urlencoded } from 'body-parser'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { AppModule } from './app.module'
import { InitialisationInteractor } from './initialisation-interactor'
import { PropertiesService } from './properties/properties.service'
import { UndefinedPathException } from './settings/exceptions/UndefinedPathException'
import { SettingsService } from './settings/settings.service'
import { CommandUnavailableOnWindowsException } from './shared/exceptions/CommandUnavailableOnWindowsException'

const PAYLOAD_LIMIT = '1mb'

async function bootstrap() {
  const logger = new Logger('main')
  logger.log('Bootstrapping the application...')

  const app = await NestFactory.create(AppModule, {
    cors: {
      exposedHeaders: ['Content-Disposition'],
    },
  })
  app.useGlobalPipes(new ValidationPipe())
  app.getHttpAdapter().getInstance().disable('x-powered-by')

  app.use(json({ limit: PAYLOAD_LIMIT }))
  app.use(urlencoded({ extended: false, limit: PAYLOAD_LIMIT }))

  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))

  const propertiesService = app.get(PropertiesService)
  await propertiesService.logVersion()
  await propertiesService.saveDeviceIdToTextFile()

  const settingsService = app.get(SettingsService)

  const configService = app.get(ConfigService)
  const deviceType = configService.get<string>('deviceType')

  if (process.platform === 'win32') {
    logger.warn(
      'Windows environment detected. Many features are not supported!',
    )
  } else {
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
  const isAlternatingLightModeEnabled =
    await settingsService.getIsAlternatingLightModeEnabled()
  const lightType = await settingsService.getTriggeringLight()
  try {
    await InitialisationInteractor.resetLights(
      deviceType,
      isAlternatingLightModeEnabled,
      lightType,
    )
  } catch (error) {
    if (!(error instanceof CommandUnavailableOnWindowsException)) {
      throw error
    }
  }

  settingsService.setNextSunsetForSleepingAndSunriseForWakingUpOnRaspberryPi()

  const version = (await propertiesService.getVersion()).version
  const config = new DocumentBuilder()
    .setTitle('App4Cam API')
    .setVersion(version)
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = configService.get('port')
  await app.listen(port)
  logger.log('Bootstrapping the application done.')
}
bootstrap()
