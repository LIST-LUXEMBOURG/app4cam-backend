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
import { MimeTypeDeterminer } from './mime-type-determiner'

describe('MimeTypeDeterminer', () => {
  describe('getContentType', () => {
    it('returns content type for .txt', () => {
      expect(MimeTypeDeterminer.getContentType('.txt')).toEqual('text/plain')
    })

    it('returns content type for txt', () => {
      expect(MimeTypeDeterminer.getContentType('txt')).toEqual('text/plain')
    })

    it('returns content type for jpeg', () => {
      expect(MimeTypeDeterminer.getContentType('jpeg')).toEqual('image/jpeg')
    })

    it('returns content type for jpg', () => {
      expect(MimeTypeDeterminer.getContentType('jpg')).toEqual('image/jpeg')
    })

    it('returns content type for mp4', () => {
      expect(MimeTypeDeterminer.getContentType('mp4')).toEqual('video/mp4')
    })

    it('returns content type for mkv', () => {
      expect(MimeTypeDeterminer.getContentType('mkv')).toEqual(
        'video/x-matroska',
      )
    })
  })
})
