/**
 * Copyright (C) 2024  Luxembourg Institute of Science and Technology
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
import { TriggeringTimeHelper } from './triggering-time-helper'

describe(TriggeringTimeHelper.name, () => {
  describe(TriggeringTimeHelper.areTimesEqual.name, () => {
    it('returns true on equal times', () => {
      expect(
        TriggeringTimeHelper.areTimesEqual(
          { hour: 1, minute: 2 },
          { hour: 1, minute: 2 },
        ),
      ).toBeTruthy()
    })

    it('returns false on non-equal times with different hours', () => {
      expect(
        TriggeringTimeHelper.areTimesEqual(
          { hour: 1, minute: 2 },
          { hour: 3, minute: 2 },
        ),
      ).toBeFalsy()
    })

    it('returns false on non-equal times with different minutes', () => {
      expect(
        TriggeringTimeHelper.areTimesEqual(
          { hour: 1, minute: 2 },
          { hour: 1, minute: 3 },
        ),
      ).toBeFalsy()
    })
  })

  describe(TriggeringTimeHelper.convertToString.name, () => {
    it('returns a time without padding', () => {
      expect(
        TriggeringTimeHelper.convertToString({ hour: 12, minute: 34 }),
      ).toBe('12:34')
    })

    it('returns a time with padding on both', () => {
      expect(TriggeringTimeHelper.convertToString({ hour: 1, minute: 2 })).toBe(
        '01:02',
      )
    })
  })

  describe(TriggeringTimeHelper.isFirstTimeEarlier.name, () => {
    it('returns true when first time comes earlier with same minutes', () => {
      expect(
        TriggeringTimeHelper.isFirstTimeEarlier(
          { hour: 7, minute: 0 },
          { hour: 19, minute: 0 },
        ),
      ).toBeTruthy()
    })

    it('returns false when first time is later with same minutes', () => {
      expect(
        TriggeringTimeHelper.isFirstTimeEarlier(
          { hour: 19, minute: 0 },
          { hour: 7, minute: 0 },
        ),
      ).toBeFalsy()
    })

    it('returns true when first time comes earlier with different minutes', () => {
      expect(
        TriggeringTimeHelper.isFirstTimeEarlier(
          { hour: 1, minute: 2 },
          { hour: 1, minute: 3 },
        ),
      ).toBeTruthy()
    })

    it('returns false when first time is later with different minutes', () => {
      expect(
        TriggeringTimeHelper.isFirstTimeEarlier(
          { hour: 1, minute: 3 },
          { hour: 1, minute: 2 },
        ),
      ).toBeFalsy()
    })
  })
})
