export class NumberUtils {
  static roundNumberByDigits(number: number, digits: number): number {
    const power = Math.pow(10, digits)
    return Math.round(number * power) / power
  }
}
