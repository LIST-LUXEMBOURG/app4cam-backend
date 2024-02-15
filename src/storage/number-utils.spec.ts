// © 2022-2024 Luxembourg Institute of Science and Technology
import { NumberUtils } from './number-utils'

describe(NumberUtils.name, () => {
  it('cuts off correctly', () => {
    expect(NumberUtils.roundNumberByDigits(0, 2)).toBe(0)
    expect(NumberUtils.roundNumberByDigits(0.1, 2)).toBe(0.1)
    expect(NumberUtils.roundNumberByDigits(0.12, 2)).toBe(0.12)
  })

  it('rounds correctly', () => {
    expect(NumberUtils.roundNumberByDigits(0.123, 2)).toBe(0.12)
    expect(NumberUtils.roundNumberByDigits(0.987, 2)).toBe(0.99)
  })
})
