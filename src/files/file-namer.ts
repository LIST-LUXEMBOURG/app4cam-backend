// © 2024 Luxembourg Institute of Science and Technology
import { DateTime } from 'luxon'

export class FileNamer {
  static createFilename(
    date: Date,
    deviceName: string,
    siteName: string,
    suffix: string,
    timeZone: string,
  ): string {
    let name = ''
    if (siteName) {
      name += siteName + '_'
    }
    if (deviceName) {
      name += deviceName + '_'
    }
    const dateTime = DateTime.fromJSDate(date).setZone(timeZone)
    const time = dateTime.toFormat("yyyyLLdd'T'HHmmss")
    name += time + suffix
    return name
  }
}
