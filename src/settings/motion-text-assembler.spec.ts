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
import { MotionTextAssembler } from './motion-text-assembler'

describe(MotionTextAssembler.name, () => {
  describe(MotionTextAssembler.createFilename.name, () => {
    it('returns a simple filename', () => {
      expect(MotionTextAssembler.createFilename('a', 'b', 'c')).toBe(
        'a_b_%Y%m%dT%H%M%S_c',
      )
    })

    it('replaces slash in timezone with dash', () => {
      expect(MotionTextAssembler.createFilename('a', 'b', 'c/d')).toBe(
        'a_b_%Y%m%dT%H%M%S_c-d',
      )
    })

    it('returns no prepended underscore if site name is empty', () => {
      expect(MotionTextAssembler.createFilename('', 'd', 't')).toBe(
        'd_%Y%m%dT%H%M%S_t',
      )
    })

    it('returns no two consecutive underscores if device ID is empty', () => {
      expect(MotionTextAssembler.createFilename('s', '', 't')).toBe(
        's_%Y%m%dT%H%M%S_t',
      )
    })

    it('returns no prepended underscores if site name and device ID are empty', () => {
      expect(MotionTextAssembler.createFilename('', '', 't')).toBe(
        '%Y%m%dT%H%M%S_t',
      )
    })

    it('returns no appended underscore if timezone is empty', () => {
      expect(MotionTextAssembler.createFilename('s', 'd', '')).toBe(
        's_d_%Y%m%dT%H%M%S',
      )
    })
  })

  describe(MotionTextAssembler.createImageText.name, () => {
    it('returns a simple text', () => {
      expect(MotionTextAssembler.createImageText('a', 'b')).toBe('a b')
    })

    it('only returns device if site name is empty', () => {
      expect(MotionTextAssembler.createImageText('', 'd')).toBe('d')
    })

    it('only returns site name if device ID is empty', () => {
      expect(MotionTextAssembler.createImageText('s', '')).toBe('s')
    })
  })
})
