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
    const body = response.data as string
    const bodyPartsSplitByEqualSign = body.split('=')
    const partWithValue = bodyPartsSplitByEqualSign[1].trim()
    const valuePartPartsSplitBySpace = partWithValue.split(' ')
    const output = valuePartPartsSplitBySpace[0] as MovieOutputValue
    return output
  }

  static async setMovieOutput(value: MovieOutputValue) {
    await axios.get(CONFIG_SET_URL + 'movie_output=' + value)
    await axios.get(WRITE_URL)
  }

  static async getPictureOutput(): Promise<PictureOutputValue> {
    const response = await axios.get(CONFIG_GET_URL + 'query=picture_output')
    const body = response.data as string
    const bodyPartsSplitByEqualSign = body.split('=')
    const partWithValue = bodyPartsSplitByEqualSign[1].trim()
    const valuePartPartsSplitBySpace = partWithValue.split(' ')
    const output = valuePartPartsSplitBySpace[0] as PictureOutputValue
    return output
  }

  static async setPictureOutput(value: PictureOutputValue) {
    await axios.get(CONFIG_SET_URL + 'picture_output=' + value)
    await axios.get(WRITE_URL)
  }

  static async takeSnapshot(): Promise<void> {
    await axios.get(ACTION_URL + 'snapshot')
  }
}
