import { Controller, Get } from '@nestjs/common'
import { VersionDto } from './version.dto'
import { VersionService } from './version.service'

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  getVersion(): Promise<VersionDto> {
    return this.versionService.getVersion()
  }
}
