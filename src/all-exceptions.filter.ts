// © 2024 Luxembourg Institute of Science and Technology
import { Catch, ArgumentsHost, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    super.catch(exception, host)
    if ('stack' in exception) {
      const logger = new Logger(AllExceptionsFilter.name)
      logger.error(exception.stack)
    }
  }
}
