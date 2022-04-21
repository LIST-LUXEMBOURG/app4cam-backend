import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import * as bodyParser from 'body-parser'

const PAYLOAD_LIMIT = '1mb'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      exposedHeaders: ['Content-Disposition'],
    },
  })
  app.useGlobalPipes(new ValidationPipe())
  app.getHttpAdapter().getInstance().disable('x-powered-by')
  const configService = app.get(ConfigService)
  const port = configService.get<number>('port')
  app.use(bodyParser.json({ limit: PAYLOAD_LIMIT }))
  app.use(bodyParser.urlencoded({ limit: PAYLOAD_LIMIT }))
  await app.listen(port)
}
bootstrap()
