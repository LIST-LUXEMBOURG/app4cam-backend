// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@nestjs/common'
import { DateTime } from 'luxon'

const exec = promisify(execSync)

export class SleepInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async triggerSleeping(
    wakingUpDateTimeIso: string,
    logger: Logger,
  ): Promise<void> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve()
    }
    const currentWorkingDirectory = process.cwd()
    const wakingUpDateTime = DateTime.fromISO(wakingUpDateTimeIso)
    const wakingUpDateTimeString = wakingUpDateTime.toFormat(
      'dd LLL yyyy HH:mm:ss',
    )
    logger.log(`Waking up time: ${wakingUpDateTimeString}`)
    const { stderr } = await exec(
      `sudo ${currentWorkingDirectory}/scripts/variscite/rtc/sleep_until "${wakingUpDateTimeString}"`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
