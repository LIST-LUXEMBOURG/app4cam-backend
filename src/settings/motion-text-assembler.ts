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
