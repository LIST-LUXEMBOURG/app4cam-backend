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
import { UnknownMimeTypeException } from './exception/UnknownMimeTypeException'

export class MimeTypeDeterminer {
  static getContentType(fileExtension: string): string {
    if (fileExtension.startsWith('.')) {
      fileExtension = fileExtension.substring(1)
    }
    switch (fileExtension) {
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg'
      case 'json':
        return 'application/json'
      case 'mkv':
        return 'video/x-matroska'
      case 'mp4':
        return 'video/mp4'
      case 'txt':
        return 'text/plain'
      case 'zip':
        return 'application/zip'
      default:
        throw new UnknownMimeTypeException(
          `MIME type not found for file extension: '${fileExtension}'`,
        )
    }
  }
}
