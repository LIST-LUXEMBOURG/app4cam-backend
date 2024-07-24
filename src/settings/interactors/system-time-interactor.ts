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
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@nestjs/common'
import { DateTime } from 'luxon'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'
import { DateConverter } from '../date-converter'

const exec = promisify(execSync)

export class SystemTimeInteractor {
  static async getSystemTimeInIso8601Format(): Promise<string> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stdout, stderr } = await exec('timedatectl | grep "Universal time"')
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const line = stdout.trim()
    const lineParts = line.split(': ')
    const universalTime = lineParts[1]
    const isoTime = DateConverter.convertTimedatectlFormatToIso(universalTime)
    return isoTime
  }

  static async setSystemAndRtcTimeInIso8601Format(
    time: string,
    deviceType: string,
    logger: Logger,
  ): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const systemTimeTransformed = DateConverter.convertIsoToYMDHMSFormat(time)
    const { stderr } = await exec(
      `sudo timedatectl set-time "${systemTimeTransformed}"`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }

    let rtcSettingPathAndCommand = 'scripts/runtime/'
    if (deviceType === 'RaspberryPi') {
      rtcSettingPathAndCommand += 'raspberry-pi/write-system-time-to-rtc.sh'
    } else if (deviceType === 'Variscite') {
      const dateTime = DateTime.fromISO(time)
      const settingRtcTimeString = dateTime.toFormat('ccc dd LLL yyyy HH:mm:ss')
      logger.log(`Setting RTC time: ${settingRtcTimeString}`)
      rtcSettingPathAndCommand += `variscite/rtc/set_time "${settingRtcTimeString}"`
    } else {
      logger.error(
        `No script for setting RTC time for device type ${deviceType} configured.`,
      )
      return Promise.resolve()
    }
    const currentWorkingDirectory = process.cwd()
    const { stderr: rtcStderr } = await exec(
      `sudo ${currentWorkingDirectory}/${rtcSettingPathAndCommand}`,
    )
    if (rtcStderr) {
      throw new CommandExecutionException(rtcStderr)
    }
  }

  static async getTimeZone(): Promise<string> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stdout, stderr } = await exec('timedatectl show | grep "^Timezone"')
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const line = stdout.trim()
    const lineParts = line.split('=')
    const timeZone = lineParts[1]
    return timeZone
  }

  static async setTimeZone(timeZone: string): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec(`sudo timedatectl set-timezone "${timeZone}"`)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
