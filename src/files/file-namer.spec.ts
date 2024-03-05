// © 2024 Luxembourg Institute of Science and Technology
import { FileNamer } from './file-namer'

const SYSTEM_TIME_ISO = '2022-01-18T13:48:37.000Z'
const SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS = '20220118T144837'
const TIME_ZONE = 'Europe/Luxembourg'

describe(FileNamer.name, () => {
  describe('createFilename', () => {
    it('returns complete name', () => {
      const dateTime = new Date(SYSTEM_TIME_ISO)
      const suffix = 'a'
      expect(
        FileNamer.createFilename(dateTime, 'd', 's', suffix, TIME_ZONE),
      ).toBe('s_d_' + SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS + suffix)
    })

    it('returns name without site name if not set', () => {
      const dateTime = new Date(SYSTEM_TIME_ISO)
      const suffix = 'a'
      expect(
        FileNamer.createFilename(dateTime, 'd', '', suffix, TIME_ZONE),
      ).toBe('d_' + SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS + suffix)
    })

    it('returns name without device name if not set', () => {
      const dateTime = new Date(SYSTEM_TIME_ISO)
      const suffix = 'a'
      expect(
        FileNamer.createFilename(dateTime, '', 's', suffix, TIME_ZONE),
      ).toBe('s_' + SYSTEM_TIME_ISO_WITHOUT_SPECIAL_CHARS + suffix)
    })
  })
})
