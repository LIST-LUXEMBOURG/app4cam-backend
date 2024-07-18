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
import { Settings } from 'luxon'
import { DateConverter } from './date-converter'

describe(DateConverter.name, () => {
  beforeAll(() => {
    Settings.defaultZone = 'utc+1'
  })

  describe(DateConverter.convertIsoToYMDHMSFormat.name, () => {
    it('formats a date time', () => {
      expect(
        DateConverter.convertIsoToYMDHMSFormat('2022-11-02T10:41:11+01:00'),
      ).toBe('2022-11-02 10:41:11')
    })
  })

  describe(DateConverter.convertTimedatectlFormatToIso.name, () => {
    it('formats a date time', () => {
      expect(
        DateConverter.convertTimedatectlFormatToIso(
          'Wed 2022-11-02 10:44:21 UTC',
        ),
      ).toBe('2022-11-02T10:44:21Z')
    })
  })
})
