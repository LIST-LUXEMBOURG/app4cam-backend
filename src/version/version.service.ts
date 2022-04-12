import { Injectable } from '@nestjs/common'
import { VersionInteractor } from './version-interactor'
import { VersionDto } from './version.dto'

@Injectable()
export class VersionService {
  getVersion(): Promise<VersionDto> {
    return VersionInteractor.getVersion()
  }
}
