/**
 * Copyright (C) 2024  Luxembourg Institute of Science and Technology
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
import path = require('path')
import { Injectable, Logger } from '@nestjs/common'
import { MotionClient } from '../motion-client'
import { UpgradeFileCheckResultDto } from './dto/upgrade-file-check-result.dto'
import { FileSystemInteractor } from './interactors/file-system-interactor'
import { UpgradeInteractor } from './interactors/upgrade-interactor'
import { UpgradeFileFlagHandler } from './upgrade-file-handler'

const EXTRACTION_FOLDER_PATH = 'temp/upgrade'
const PACKAGED_CHECKSUM_FILENAME = 'checksums.sha256'
const PACKAGED_SCRIPT_FILENAME = 'upgrade.sh'
const UPGRADE_FILENAME = 'App4Cam-upgrade.zip'

@Injectable()
export class UpgradesService {
  private flagHandler = new UpgradeFileFlagHandler('')
  private readonly logger = new Logger(UpgradesService.name)

  async isUpgradeInProgress(): Promise<boolean> {
    return this.flagHandler.isFlagSet()
  }

  async performUpgrade(): Promise<void> {
    await this.flagHandler.setFlag()
    const devicePath = await MotionClient.getTargetDir()
    const upgradeFilePath = path.join(devicePath, UPGRADE_FILENAME)
    await FileSystemInteractor.extractZipArchive(
      upgradeFilePath,
      EXTRACTION_FOLDER_PATH,
    )
    await UpgradeInteractor.triggerUpgrade()
    // Unsetting the flag and emptying the tempy folder needs to be done by the
    // upgrade script as the server might be shut down.
  }

  async verifyUpgradeFile(): Promise<UpgradeFileCheckResultDto> {
    const devicePath = await MotionClient.getTargetDir()
    const upgradeFilePath = path.join(devicePath, UPGRADE_FILENAME)

    try {
      await FileSystemInteractor.checkWhetherFileExists(upgradeFilePath)
    } catch (error) {
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'The upgrade archive does not exist.',
        error,
      )
    }
    try {
      await FileSystemInteractor.checkWhetherFileIsReadable(upgradeFilePath)
    } catch (error) {
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'The upgrade archive is not readable.',
        error,
      )
    }

    try {
      await FileSystemInteractor.extractZipArchive(
        upgradeFilePath,
        EXTRACTION_FOLDER_PATH,
      )
    } catch (error) {
      await FileSystemInteractor.emptyFolder(EXTRACTION_FOLDER_PATH)
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'The upgrade archive could not be extracted.',
        error,
      )
    }

    const upgradeScriptPath = path.join(
      EXTRACTION_FOLDER_PATH,
      PACKAGED_SCRIPT_FILENAME,
    )
    try {
      await FileSystemInteractor.checkWhetherFileExists(upgradeScriptPath)
    } catch (error) {
      await FileSystemInteractor.emptyFolder(EXTRACTION_FOLDER_PATH)
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'The upgrade script does not exist.',
        error,
      )
    }
    try {
      await FileSystemInteractor.checkWhetherFileIsReadable(upgradeScriptPath)
    } catch (error) {
      await FileSystemInteractor.emptyFolder(EXTRACTION_FOLDER_PATH)
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'The upgrade script is not readable.',
        error,
      )
    }

    const checksumFilePath = path.join(
      EXTRACTION_FOLDER_PATH,
      PACKAGED_CHECKSUM_FILENAME,
    )
    try {
      await FileSystemInteractor.checkWhetherFileExists(checksumFilePath)
    } catch (error) {
      await FileSystemInteractor.emptyFolder(EXTRACTION_FOLDER_PATH)
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'The checksum file does not exist.',
        error,
      )
    }
    try {
      await FileSystemInteractor.checkWhetherFileIsReadable(checksumFilePath)
    } catch (error) {
      await FileSystemInteractor.emptyFolder(EXTRACTION_FOLDER_PATH)
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'The checksum file is not readable.',
        error,
      )
    }
    try {
      await FileSystemInteractor.verifyChecksums(
        PACKAGED_CHECKSUM_FILENAME,
        EXTRACTION_FOLDER_PATH,
      )
    } catch (error) {
      await FileSystemInteractor.emptyFolder(EXTRACTION_FOLDER_PATH)
      return this.logAndCreateNegativeUpgradeFileCheckResult(
        'Not all checksums are valid.',
        error,
      )
    }

    await FileSystemInteractor.emptyFolder(EXTRACTION_FOLDER_PATH)
    return {
      isOkay: true,
      message: '',
    }
  }

  private logAndCreateNegativeUpgradeFileCheckResult(
    message: string,
    error: any,
  ): UpgradeFileCheckResultDto {
    this.logger.error(message, error)
    return {
      isOkay: false,
      message,
    }
  }
}
