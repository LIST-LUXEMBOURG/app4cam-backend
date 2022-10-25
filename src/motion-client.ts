import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8080/'
const ACTION_URL = BASE_URL + '0/action/'
const CONFIG_BASE_URL = BASE_URL + '0/config/'
const CONFIG_GET_URL = CONFIG_BASE_URL + 'get?'
const CONFIG_SET_URL = CONFIG_BASE_URL + 'set?'
const WRITE_URL = BASE_URL + 'action/config/write'

const POST_PICTURE_FILENAME = '_%q'
const POST_SNAPSHOT_FILENAME = '_snapshot'

type MovieOutputValue = 'on' | 'off'
type PictureOutputValue = 'on' | 'off' | 'first' | 'best'

export class MotionClient {
  private static extractValueFromResponseBody(body: string): string {
    const bodyPartsSplitByEqualSign = body.split('=')
    const partWithValue = bodyPartsSplitByEqualSign[1].trim()
    const valuePartPartsSplitBySpace = partWithValue.split(' ')
    return valuePartPartsSplitBySpace[0]
  }

  static async getHeight(): Promise<number> {
    const response = await axios.get(CONFIG_GET_URL + 'query=height')
    const value = this.extractValueFromResponseBody(response.data as string)
    return parseFloat(value)
  }

  static async getWidth(): Promise<number> {
    const response = await axios.get(CONFIG_GET_URL + 'query=width')
    const value = this.extractValueFromResponseBody(response.data as string)
    return parseFloat(value)
  }

  static async setFilename(filename: string): Promise<void> {
    const moveFilename = filename
    const pictureFilename = filename + POST_PICTURE_FILENAME
    const snapshotFilename = filename + POST_SNAPSHOT_FILENAME
    await axios.get(CONFIG_SET_URL + 'movie_filename=' + moveFilename)
    await axios.get(CONFIG_SET_URL + 'picture_filename=' + pictureFilename)
    await axios.get(CONFIG_SET_URL + 'snapshot_filename=' + snapshotFilename)
    await axios.get(WRITE_URL)
  }

  static async setLeftTextOnImage(text: string) {
    await axios.get(CONFIG_SET_URL + 'text_left=' + text)
    await axios.get(WRITE_URL)
  }

  static async getMovieOutput(): Promise<MovieOutputValue> {
    const response = await axios.get(CONFIG_GET_URL + 'query=movie_output')
    const value = this.extractValueFromResponseBody(response.data as string)
    return value as MovieOutputValue
  }

  static async setMovieOutput(value: MovieOutputValue) {
    await axios.get(CONFIG_SET_URL + 'movie_output=' + value)
    await axios.get(WRITE_URL)
  }

  static async getPictureOutput(): Promise<PictureOutputValue> {
    const response = await axios.get(CONFIG_GET_URL + 'query=picture_output')
    const value = this.extractValueFromResponseBody(response.data as string)
    return value as PictureOutputValue
  }

  static async setPictureOutput(value: PictureOutputValue) {
    await axios.get(CONFIG_SET_URL + 'picture_output=' + value)
    await axios.get(WRITE_URL)
  }

  static async getThreshold(): Promise<number> {
    const response = await axios.get(CONFIG_GET_URL + 'query=threshold')
    const value = this.extractValueFromResponseBody(response.data as string)
    return parseInt(value)
  }

  static async setThreshold(value: number) {
    await axios.get(CONFIG_SET_URL + 'threshold=' + value)
    await axios.get(WRITE_URL)
  }

  static async takeSnapshot(): Promise<void> {
    await axios.get(ACTION_URL + 'snapshot')
  }
}
