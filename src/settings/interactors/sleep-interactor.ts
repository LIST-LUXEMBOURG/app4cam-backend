// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@nestjs/common'
import { DateTime } from 'luxon'
import { CommandUnavailableOnWindowsException } from '../exceptions/CommandUnavailableOnWindowsException'
import { TriggeringTime } from '../settings'

const exec = promisify(execSync)

const WITTY_PI_END_YEARS_FROM_NOW = 10

export class SleepInteractor {
  private static throwExceptionIfOnWindows(): void {
    if (process.platform === 'win32') {
      throw new CommandUnavailableOnWindowsException()
    }
  }

  static async triggerSleeping(
    wakingUpDateTimeIso: string,
    logger: Logger,
  ): Promise<void> {
    this.throwExceptionIfOnWindows()
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

  static async configureWittyPiSchedule(
    sleepingTime: TriggeringTime,
    wakingUpTime: TriggeringTime,
  ): Promise<void> {
    this.throwExceptionIfOnWindows()
    const currentWorkingDirectory = process.cwd()
    if (!sleepingTime || !wakingUpTime) {
      const { stderr } = await exec(
        `sudo ${currentWorkingDirectory}/scripts/raspberry-pi/remove-working-hours-schedule.sh`,
      )
      if (stderr) {
        throw new Error(stderr)
      }
      return
    }
    const now = DateTime.now()
    const sleepingDateTime = now.set({
      hour: sleepingTime.hour,
      minute: sleepingTime.minute,
    })
    const wakingUpDateTime = now.set({
      hour: wakingUpTime.hour,
      minute: wakingUpTime.minute,
    })
    const beginValue = wakingUpDateTime.toFormat('yyyy-LL-dd HH:mm:00')
    const endValue = `${wakingUpDateTime
      .plus({ years: WITTY_PI_END_YEARS_FROM_NOW })
      .toFormat('yyyy')}-12-31 23:59:59`
    const difference = sleepingDateTime
      // The seconds are only requested to not get the minutes as a decimal.
      .diff(wakingUpDateTime, ['hours', 'minutes', 'seconds'])
      .toObject()
    let onValue = `H${difference.hours}`
    if (difference.minutes) {
      onValue += ` M${difference.minutes}`
    }
    let difference_to_24_h_hours = 24 - difference.hours
    let difference_to_24_h_minutes = 0
    if (difference.minutes !== 0) {
      difference_to_24_h_minutes = 60 - difference.minutes
      difference_to_24_h_hours -= 1
    }
    let offValue = `H${difference_to_24_h_hours}`
    if (difference_to_24_h_minutes) {
      offValue += ` M${difference_to_24_h_minutes}`
    }
    const { stderr } = await exec(
      `sudo ${currentWorkingDirectory}/scripts/raspberry-pi/create-working-hours-schedule.sh "${beginValue}" "${endValue}" "${onValue}" "${offValue}"`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
