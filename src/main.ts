import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { json, urlencoded } from 'body-parser'
import { AppModule } from './app.module'

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
  app.use(json({ limit: PAYLOAD_LIMIT }))
  app.use(urlencoded({ extended: false, limit: PAYLOAD_LIMIT }))
  await app.listen(port)
}
bootstrap()
