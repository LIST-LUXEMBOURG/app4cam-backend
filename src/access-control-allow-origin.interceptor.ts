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
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { Observable } from 'rxjs'

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
