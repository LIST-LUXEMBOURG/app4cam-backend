// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@nestjs/common'
import { DateTime } from 'luxon'
import { DateConverter } from '../date-converter'

const exec = promisify(execSync)

export class SystemTimeInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async getSystemTimeInIso8601Format(): Promise<string> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout, stderr } = await exec('timedatectl | grep "Universal time"')
    if (stderr) {
      throw new Error(stderr)
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
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve()
    }
    const systemTimeTransformed = DateConverter.convertIsoToYMDHMSFormat(time)
    const { stderr } = await exec(
      `sudo timedatectl set-time "${systemTimeTransformed}"`,
    )
    if (stderr) {
      throw new Error(stderr)
    }

    let rtcSettingPathAndCommand = 'scripts/'
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
      throw new Error(rtcStderr)
    }
  }

  static async getTimeZone(): Promise<string> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout, stderr } = await exec('timedatectl show | grep "^Timezone"')
    if (stderr) {
      throw new Error(stderr)
    }
    const line = stdout.trim()
    const lineParts = line.split('=')
    const timeZone = lineParts[1]
    return timeZone
  }

  static async setTimeZone(timeZone: string): Promise<void> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve()
    }
    const { stderr } = await exec(`sudo timedatectl set-timezone "${timeZone}"`)
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
