import { UpgradeFileCheckResultDto } from './dto/upgrade-file-check-result.dto'

export interface IUpgradesService {
  isUpgradeInProgress: () => Promise<boolean>
  performUpgrade: () => Promise<void>
  verifyUpgradeFile: () => Promise<UpgradeFileCheckResultDto>
}
