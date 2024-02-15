// © 2022-2024 Luxembourg Institute of Science and Technology
import { DateTime } from 'luxon'

export class DateConverter {
  static convertIsoToYMDHMSFormat(isoTime: string): string {
    const dateTime = DateTime.fromISO(isoTime)
    const formattedTime = dateTime.toFormat('yyyy-LL-dd HH:mm:ss')
    return formattedTime
  }

  static convertTimedatectlFormatToIso(universalTime: string): string {
    const parts = universalTime.split(' ')
    const date = parts[1]
    const time = parts[2]
    return `${date}T${time}Z`
  }
}
