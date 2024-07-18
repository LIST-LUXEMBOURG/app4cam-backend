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
import { NumberUtils } from './number-utils'

describe(NumberUtils.name, () => {
  it('cuts off correctly', () => {
    expect(NumberUtils.roundNumberByDigits(0, 2)).toBe(0)
    expect(NumberUtils.roundNumberByDigits(0.1, 2)).toBe(0.1)
    expect(NumberUtils.roundNumberByDigits(0.12, 2)).toBe(0.12)
  })

  it('rounds correctly', () => {
    expect(NumberUtils.roundNumberByDigits(0.123, 2)).toBe(0.12)
    expect(NumberUtils.roundNumberByDigits(0.987, 2)).toBe(0.99)
  })
})
