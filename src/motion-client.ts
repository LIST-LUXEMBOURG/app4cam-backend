// © 2022-2024 Luxembourg Institute of Science and Technology
import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8080/'
const ACTION_URL = BASE_URL + '0/action/'
const CONFIG_BASE_URL = BASE_URL + '0/config/'
const CONFIG_GET_URL = CONFIG_BASE_URL + 'get'
const CONFIG_SET_URL = CONFIG_BASE_URL + 'set'
const DETECTION_URL = BASE_URL + '0/detection/'
const WRITE_URL = BASE_URL + 'action/config/write'

const POST_PICTURE_FILENAME = '_%q'
const POST_SNAPSHOT_FILENAME = '_snapshot'

type MovieOutputValue = 'on' | 'off'
type PictureOutputValue = 'on' | 'off' | 'first' | 'best'

export class MotionClient {
  static async getHeight(): Promise<number> {
    const value = await this.getConfigurationOption('height')
    return parseFloat(value)
  }

  static async getMovieOutput(): Promise<MovieOutputValue> {
    const value = await this.getConfigurationOption('movie_output')
    return value as MovieOutputValue
  }

  static async getMovieQuality(): Promise<number> {
    const value = await this.getConfigurationOption('movie_quality')
    return parseInt(value)
  }

  static async getPictureOutput(): Promise<PictureOutputValue> {
    const value = await this.getConfigurationOption('picture_output')
    return value as PictureOutputValue
  }

  static async getPictureQuality(): Promise<number> {
    const value = await this.getConfigurationOption('picture_quality')
    return parseInt(value)
  }

  static async getTargetDir(): Promise<string> {
    const value = await this.getConfigurationOption('target_dir')
    return value
  }

  static async getThreshold(): Promise<number> {
    const value = await this.getConfigurationOption('threshold')
    return parseInt(value)
  }

  static async getVideoDevice(): Promise<string> {
    const value = await this.getConfigurationOption('video_device')
    return value
  }

  static async getVideoParams(): Promise<string> {
    const value = await this.getConfigurationOption('video_params')
    return value
  }

  static async getWidth(): Promise<number> {
    const value = await this.getConfigurationOption('width')
    return parseFloat(value)
  }

  static async setLeftTextOnImage(text: string): Promise<void> {
    await this.setConfigurationOption('text_left', text)
  }

  static async setFilename(filename: string): Promise<void> {
    const moveFilename = filename
    const pictureFilename = filename + POST_PICTURE_FILENAME
    const snapshotFilename = filename + POST_SNAPSHOT_FILENAME
    await axios.get(CONFIG_SET_URL + '?movie_filename=' + moveFilename)
    await axios.get(CONFIG_SET_URL + '?picture_filename=' + pictureFilename)
    await axios.get(CONFIG_SET_URL + '?snapshot_filename=' + snapshotFilename)
    await axios.get(WRITE_URL)
  }

  static async setMovieOutput(value: MovieOutputValue): Promise<void> {
    await this.setConfigurationOption('movie_output', value)
  }

  static async setMovieQuality(value: number): Promise<void> {
    await this.setConfigurationOption('movie_quality', value.toString())
  }

  static async setPictureOutput(value: PictureOutputValue): Promise<void> {
    await this.setConfigurationOption('picture_output', value)
  }

  static async setPictureQuality(value: number): Promise<void> {
    await this.setConfigurationOption('picture_quality', value.toString())
  }

  static async setTargetDir(value: string): Promise<void> {
    await this.setConfigurationOption('target_dir', value)
  }

  static async setThreshold(value: number): Promise<void> {
    await this.setConfigurationOption('threshold', value.toString())
  }

  static async setVideoParams(value: string): Promise<void> {
    await this.setConfigurationOption('video_params', value)
  }

  static async isDetectionStatusActive(): Promise<boolean> {
    const response = await axios.get(DETECTION_URL + 'status')
    const body = response.data as string
    const bodyTrimmed = body.trim()
    const bodyPartsSplitBySpace = bodyTrimmed.split(' ')
    const value = bodyPartsSplitBySpace[bodyPartsSplitBySpace.length - 1]
    return value === 'ACTIVE'
  }

  static async pauseDetection(): Promise<void> {
    await axios.get(DETECTION_URL + 'pause')
  }

  static async startDetection(): Promise<void> {
    await axios.get(DETECTION_URL + 'start')
  }

  static async takeSnapshot(): Promise<void> {
    await axios.get(ACTION_URL + 'snapshot')
  }

  private static extractValueFromResponseBody(body: string): string {
    const firstEqualSignPosition = body.indexOf('=')
    const lastSpacePosition = body.trimEnd().lastIndexOf(' ')
    const value = body
      .substring(firstEqualSignPosition + 1, lastSpacePosition)
      .trim()
    return value
  }

  private static async getConfigurationOption(
    optionName: string,
  ): Promise<string> {
    const response = await axios.get(`${CONFIG_GET_URL}?query=${optionName}`)
    return this.extractValueFromResponseBody(response.data as string)
  }

  private static async setConfigurationOption(
    optionName: string,
    value: string,
  ) {
    await axios.get(`${CONFIG_SET_URL}?${optionName}=${value}`)
    await axios.get(WRITE_URL)
  }
}
