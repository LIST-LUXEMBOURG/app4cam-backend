// © 2022-2024 Luxembourg Institute of Science and Technology
const DATE_TIME_FILENAME_PART = '%Y%m%dT%H%M%S'

export class MotionTextAssembler {
  static createFilename(
    siteName: string,
    deviceName: string,
    timeZone: string,
  ): string {
    let name = ''
    if (siteName) {
      name += siteName + '_'
    }
    if (deviceName) {
      name += deviceName + '_'
    }
    name += DATE_TIME_FILENAME_PART
    if (timeZone) {
      name += '_' + timeZone.replaceAll('/', '-')
    }
    return name
  }

  static createImageText(siteName: string, deviceName: string) {
    let text = ''
    if (siteName) {
      text += siteName
      if (deviceName) {
        text += ' '
      }
    }
    if (deviceName) {
      text += deviceName
    }
    return text
  }
}
