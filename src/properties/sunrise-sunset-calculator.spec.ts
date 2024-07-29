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

import { SunriseSunsetCalculator } from './sunrise-sunset-calculator'

describe(SunriseSunsetCalculator.name, () => {
  describe('calculateSunriseAndSunset', () => {
    it('returns the correct times', () => {
      expect(
        SunriseSunsetCalculator.calculateSunriseAndSunset(
          new Date('2024-07-19T10:42:00'),
          49.50564,
          5.94365,
        ),
      ).toEqual({
        sunrise: {
          hour: 3,
          minute: 51,
        },
        sunset: {
          hour: 19,
          minute: 33,
        },
      })
    })
  })
})
