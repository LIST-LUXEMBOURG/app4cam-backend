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
import TriggeringTime from '../shared/entities/triggering-time'
import { SunriseAndSunsetDto } from './dto/sunrise-and-sunset.dto'

const DAYS_PER_ORDINARY_YEAR = 365
const DAYS_PER_LEAP_YEAR = 366
const MINUTES_PER_HOUR = 60
/**
 * Approximate correction for atmospheric refraction at sunrise and sunset and the size of the solar disk, in degree
 */
const SUNRISE_AND_SUNSET_ZENITH = 90.833

export class SunriseSunsetCalculator {
  static calculateSunriseAndSunset(
    date: Date,
    latitude: number,
    longitude: number,
  ): SunriseAndSunsetDto {
    const dateTime = DateTime.fromJSDate(date)
    const daysPerYear = dateTime.isInLeapYear
      ? DAYS_PER_LEAP_YEAR
      : DAYS_PER_ORDINARY_YEAR

    const fractionalYearInRad = (dateTime.ordinal / daysPerYear) * 2 * Math.PI

    const timeEquationInMin =
      229.18 *
      (0.000075 +
        0.001868 * Math.cos(fractionalYearInRad) -
        0.032077 * Math.sin(fractionalYearInRad) -
        0.014615 * Math.cos(2 * fractionalYearInRad) -
        0.040849 * Math.sin(2 * fractionalYearInRad))

    const solarDeclinationAngleInRad =
      0.006918 -
      0.399912 * Math.cos(fractionalYearInRad) +
      0.070257 * Math.sin(fractionalYearInRad) -
      0.006758 * Math.cos(2 * fractionalYearInRad) +
      0.000907 * Math.sin(2 * fractionalYearInRad) -
      0.002697 * Math.cos(3 * fractionalYearInRad) +
      0.00148 * Math.sin(3 * fractionalYearInRad)

    const latitudeInRad = (latitude * Math.PI) / 180
    const hourAngleInRad = Math.acos(
      Math.cos((SUNRISE_AND_SUNSET_ZENITH * Math.PI) / 180) /
        (Math.cos(latitudeInRad) * Math.cos(solarDeclinationAngleInRad)) -
        Math.tan(latitudeInRad) * Math.tan(solarDeclinationAngleInRad),
    )

    const hourAngleInDeg = (hourAngleInRad * 180) / Math.PI
    const sunriseMinutes =
      720 - 4 * (longitude + hourAngleInDeg) - timeEquationInMin
    const sunsetMinutes =
      720 - 4 * (longitude - hourAngleInDeg) - timeEquationInMin

    const offsetHours = DateTime.local().offset / 60

    const sunrise: TriggeringTime = {
      hour: Math.floor(sunriseMinutes / MINUTES_PER_HOUR) + offsetHours,
      minute: Math.floor(sunriseMinutes % MINUTES_PER_HOUR),
    }
    const sunset: TriggeringTime = {
      hour: Math.floor(sunsetMinutes / MINUTES_PER_HOUR) + offsetHours,
      minute: Math.floor(sunsetMinutes % MINUTES_PER_HOUR),
    }

    return {
      sunrise,
      sunset,
    }
  }
}
