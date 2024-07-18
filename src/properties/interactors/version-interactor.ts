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
import { readFile } from 'fs/promises'
import { VersionDto } from '../dto/version.dto'

const COMMIT_HASH_FILE = 'version.txt'

export class VersionInteractor {
  static async getVersion(): Promise<VersionDto> {
    const buffer = await readFile(COMMIT_HASH_FILE)
    const content = buffer.toString()
    const contentParts = content.split(':')
    const version = contentParts[0]
    const commitHash = contentParts[1]
    return {
      commitHash,
      version,
    }
  }
}
