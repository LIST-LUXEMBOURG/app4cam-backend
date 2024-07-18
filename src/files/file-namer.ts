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
