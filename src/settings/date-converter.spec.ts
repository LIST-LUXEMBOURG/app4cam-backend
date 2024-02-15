// © 2022-2024 Luxembourg Institute of Science and Technology
import { Settings } from 'luxon'
import { DateConverter } from './date-converter'

describe(DateConverter.name, () => {
  beforeAll(() => {
    Settings.defaultZone = 'utc+1'
  })

  describe(DateConverter.convertIsoToYMDHMSFormat.name, () => {
    it('formats a date time', () => {
      expect(
        DateConverter.convertIsoToYMDHMSFormat('2022-11-02T10:41:11+01:00'),
      ).toBe('2022-11-02 10:41:11')
    })
  })

  describe(DateConverter.convertTimedatectlFormatToIso.name, () => {
    it('formats a date time', () => {
      expect(
        DateConverter.convertTimedatectlFormatToIso(
          'Wed 2022-11-02 10:44:21 UTC',
        ),
      ).toBe('2022-11-02T10:44:21Z')
    })
  })
})
