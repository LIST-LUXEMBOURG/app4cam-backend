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
type VideoParameters = Record<string, number>

export class MotionVideoParametersWorker {
  static convertStringToObject(input: string): VideoParameters {
    if (!input || input === '(null)') {
      return {}
    }
    return input
      .split(/,+(?=(?:(?:[^"]*"){2})*[^"]*$)/g)
      .reduce((result, parameterString) => {
        const parts = parameterString.split('=')
        const key = parts[0].trim().replaceAll('"', '')
        const value = parseInt(parts[1].trim())
        result[key] = value
        return result
      }, {})
  }

  static convertObjectToString(input: VideoParameters): string {
    const newVideoParameters = []
    for (const key in input) {
      let escapedKey = key
      if (key.includes(' ')) {
        escapedKey = `"${key}"`
      }
      const value = input[key]
      newVideoParameters.push(`${escapedKey}=${value}`)
    }
    return newVideoParameters.join(',')
  }
}
