/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
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
import { describe, expect, it } from 'vitest'
import { buildAttachmentContentDisposition } from './content-disposition.js'

describe('buildAttachmentContentDisposition', () => {
  it('handles a plain ASCII filename', () => {
    expect(buildAttachmentContentDisposition('file.zip')).toBe(
      "attachment; filename*=UTF-8''file.zip",
    )
  })

  it('percent-encodes spaces', () => {
    expect(buildAttachmentContentDisposition('my file.zip')).toBe(
      "attachment; filename*=UTF-8''my%20file.zip",
    )
  })

  it('percent-encodes non-ASCII characters', () => {
    expect(buildAttachmentContentDisposition('caméra.zip')).toBe(
      "attachment; filename*=UTF-8''cam%C3%A9ra.zip",
    )
  })

  it('percent-encodes double quotes, preventing header injection', () => {
    const result = buildAttachmentContentDisposition('bad"name.zip')
    expect(result).not.toContain('"bad"name.zip"')
    expect(result).toBe("attachment; filename*=UTF-8''bad%22name.zip")
  })
})
