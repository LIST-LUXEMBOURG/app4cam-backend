import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AccessControlAllowOriginInterceptor implements NestInterceptor {
  disableAccessControlAllowOrigin: boolean

  constructor(private configService: ConfigService) {
    this.disableAccessControlAllowOrigin = this.configService.get<boolean>(
      'disableAccessControlAllowOrigin',
    )
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.disableAccessControlAllowOrigin === true) {
      const response: Response = context.switchToHttp().getResponse()
      response.setHeader('Access-Control-Allow-Origin', '*')
    }
    return next.handle()
  }
}
