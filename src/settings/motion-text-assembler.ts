const DATE_TIME_FILENAME_PART = '%Y%m%dT%H%M%S'

export class MotionTextAssembler {
  static createFilename(
    siteName: string,
    deviceId: string,
    timeZone: string,
  ): string {
    let name = ''
    if (siteName) {
      name += siteName + '_'
    }
    if (deviceId) {
      name += deviceId + '_'
    }
    name += DATE_TIME_FILENAME_PART
    if (timeZone) {
      name += '_' + timeZone.replaceAll('/', '-')
    }
    return name
  }

  static createImageText(siteName: string, deviceId: string) {
    let text = ''
    if (siteName) {
      text += siteName
      if (deviceId) {
        text += ' '
      }
    }
    if (deviceId) {
      text += deviceId
    }
    return text
  }
}
