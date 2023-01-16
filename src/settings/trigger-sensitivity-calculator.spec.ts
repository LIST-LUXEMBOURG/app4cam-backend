import { TriggerSensitivityCalculator } from './trigger-sensitivity-calculator'

describe(TriggerSensitivityCalculator.name, () => {
  describe(
    TriggerSensitivityCalculator.convertThresholdToTriggerSensitivity.name,
    () => {
      it('returns highest sensitivity 10 for 5 % of pixels', () => {
        expect(
          TriggerSensitivityCalculator.convertThresholdToTriggerSensitivity(
            5,
            10,
            10,
          ),
        ).toBe(10)
      })

      it('returns sensitivity 9 for 10 % of pixels', () => {
        expect(
          TriggerSensitivityCalculator.convertThresholdToTriggerSensitivity(
            10,
            10,
            10,
          ),
        ).toBe(9)
      })

      it('returns lowest sensitivity 1 for 50 % of pixels', () => {
        expect(
          TriggerSensitivityCalculator.convertThresholdToTriggerSensitivity(
            50,
            10,
            10,
          ),
        ).toBe(1)
      })

      it('returns lowest sensitivity 1 for 90 % of pixels', () => {
        expect(
          TriggerSensitivityCalculator.convertThresholdToTriggerSensitivity(
            90,
            10,
            10,
          ),
        ).toBe(1)
      })
    },
  )

  describe(
    TriggerSensitivityCalculator.convertTriggerSensitivityToThreshold.name,
    () => {
      it('returns 50 to 5 as % of pixels for sensitivity 1 to 10', () => {
        for (let s = 1; s <= 10; s++) {
          expect(
            TriggerSensitivityCalculator.convertTriggerSensitivityToThreshold(
              s,
              10,
              10,
            ),
          ).toBe(55 - 5 * s)
        }
      })
    },
  )
})
