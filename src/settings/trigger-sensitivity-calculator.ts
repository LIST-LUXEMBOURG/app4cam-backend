const TRIGGER_SENSITIVITY_FACTOR = 5
const TRIGGER_SENSITIVITY_MAXIMUM = 10
const TRIGGER_SENSITIVITY_MINIMUM = 1
const TRIGGER_SENSITIVITY_PERCENTAGE_MAXIMUM = 50

export class TriggerSensitivityCalculator {
  static convertThresholdToTriggerSensitivity(
    threshold: number,
    height: number,
    width: number,
  ): number {
    const thresholdPercentage = (100 * threshold) / (height * width)
    const sensitivityPercentage = 100 - thresholdPercentage

    // Cap because trigger sensitivity above is too sensitive.
    const sensitivityPercentageCapped =
      sensitivityPercentage - TRIGGER_SENSITIVITY_PERCENTAGE_MAXIMUM

    // Add 1 to shift interval 0-9 to 1-10.
    let sensitivity =
      sensitivityPercentageCapped / TRIGGER_SENSITIVITY_FACTOR + 1

    if (sensitivity > TRIGGER_SENSITIVITY_MAXIMUM) {
      sensitivity = TRIGGER_SENSITIVITY_MAXIMUM
    }
    if (sensitivity < TRIGGER_SENSITIVITY_MINIMUM) {
      sensitivity = TRIGGER_SENSITIVITY_MINIMUM
    }

    return sensitivity
  }

  static convertTriggerSensitivityToThreshold(
    sensitivity: number,
    height: number,
    width: number,
  ): number {
    if (sensitivity < TRIGGER_SENSITIVITY_MINIMUM) {
      sensitivity = TRIGGER_SENSITIVITY_MINIMUM
    }
    if (sensitivity > TRIGGER_SENSITIVITY_MAXIMUM) {
      sensitivity = TRIGGER_SENSITIVITY_MAXIMUM
    }

    const sensitivityPercentage = (sensitivity - 1) * TRIGGER_SENSITIVITY_FACTOR

    const thresholdPercentage =
      100 - sensitivityPercentage - TRIGGER_SENSITIVITY_PERCENTAGE_MAXIMUM
    const threshold = (thresholdPercentage * height * width) / 100
    return threshold
  }
}
