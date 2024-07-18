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
import { FileNamer } from './file-namer'

const SYSTEM_TIME_ISO = '2022-01-18T13:48:37.000Z'
const SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS = '20220118T144837'
const TIME_ZONE = 'Europe/Luxembourg'

describe(FileNamer.name, () => {
  describe('createFilename', () => {
    it('returns complete name', () => {
      const dateTime = new Date(SYSTEM_TIME_ISO)
      const suffix = 'a'
      expect(
        FileNamer.createFilename(dateTime, 'd', 's', suffix, TIME_ZONE),
      ).toBe('s_d_' + SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS + suffix)
    })

    it('returns name without site name if not set', () => {
      const dateTime = new Date(SYSTEM_TIME_ISO)
      const suffix = 'a'
      expect(
        FileNamer.createFilename(dateTime, 'd', '', suffix, TIME_ZONE),
      ).toBe('d_' + SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS + suffix)
    })

    it('returns name without device name if not set', () => {
      const dateTime = new Date(SYSTEM_TIME_ISO)
      const suffix = 'a'
      expect(
        FileNamer.createFilename(dateTime, '', 's', suffix, TIME_ZONE),
      ).toBe('s_' + SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS + suffix)
    })
  })
})
