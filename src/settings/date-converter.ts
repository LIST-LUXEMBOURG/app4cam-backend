import { DateTime } from 'luxon'

export class DateConverter {
  static convertIsoToYMDHMSFormat(isoTime: string): string {
    const dateTime = DateTime.fromISO(isoTime)
    const formattedTime = dateTime.toFormat('yyyy-LL-dd HH:mm:ss')
    return formattedTime
  }

  static convertTimedatectlFormatToIso(input: string): string {
    const parts = input.split(' ')
    const date = parts[1]
    const time = parts[2]
    const timeZone = parts[3]
    const dateTime = DateTime.fromISO(`${date}T${time}`, { zone: timeZone })
    const isoTime = dateTime.toISO({ suppressMilliseconds: true })
    return isoTime
  }
}
