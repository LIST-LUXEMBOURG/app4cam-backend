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
import { MotionVideoParametersWorker } from './motion-video-parameters-worker'

describe(MotionVideoParametersWorker.name, () => {
  describe(MotionVideoParametersWorker.convertStringToObject.name, () => {
    it('converts an average string', () => {
      expect(
        MotionVideoParametersWorker.convertStringToObject(
          '"Focus, Auto"=0,"Focus (absolute)"=200, Brightness=16',
        ),
      ).toStrictEqual({
        'Focus, Auto': 0,
        'Focus (absolute)': 200,
        Brightness: 16,
      })
    })

    it('converts an empty string', () => {
      expect(
        MotionVideoParametersWorker.convertStringToObject(''),
      ).toStrictEqual({})
    })

    it('converts a motion null value', () => {
      expect(
        MotionVideoParametersWorker.convertStringToObject('(null)'),
      ).toStrictEqual({})
    })
  })

  describe(MotionVideoParametersWorker.convertObjectToString.name, () => {
    it('converts an average object', () => {
      expect(
        MotionVideoParametersWorker.convertObjectToString({
          'Focus, Auto': 0,
          'Focus (absolute)': 200,
          Brightness: 16,
        }),
      ).toBe('"Focus, Auto"=0,"Focus (absolute)"=200,Brightness=16')
    })
  })
})
