// © 2022-2024 Luxembourg Institute of Science and Technology
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }
}
