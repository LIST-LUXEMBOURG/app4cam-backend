type VideoParameters = Record<string, number>

export class MotionVideoParametersWorker {
  static convertStringToObject(input: string): VideoParameters {
    if (!input || input === '(null)') {
      return {}
    }
    return input
      .split(/,+(?=(?:(?:[^"]*"){2})*[^"]*$)/g)
      .reduce((result, parameterString) => {
        const parts = parameterString.split('=')
        const key = parts[0].trim().replaceAll('"', '')
        const value = parseInt(parts[1].trim())
        result[key] = value
        return result
      }, {})
  }

  static convertObjectToString(input: VideoParameters): string {
    const newVideoParameters = []
    for (const key in input) {
      let escapedKey = key
      if (key.includes(' ')) {
        escapedKey = `"${key}"`
      }
      const value = input[key]
      newVideoParameters.push(`${escapedKey}=${value}`)
    }
    return newVideoParameters.join(',')
  }
}
