export type MovieOutputValue = 'on' | 'off'
export type PictureOutputValue = 'on' | 'off' | 'first' | 'best'

export interface IMotionClientService {
  getHeight: () => Promise<number>
  getMovieOutput: () => Promise<MovieOutputValue>
  getMovieQuality: () => Promise<number>
  getPictureOutput: () => Promise<PictureOutputValue>
  getPictureQuality: () => Promise<number>
  getTargetDir: () => Promise<string>
  getThreshold: () => Promise<number>
  getVideoDevice: () => Promise<string>
  getVideoParams: () => Promise<string>
  getWidth: () => Promise<number>
  setLeftTextOnImage: (text: string) => Promise<void>
  setFilename: (filename: string) => Promise<void>
  setMovieOutput: (value: MovieOutputValue) => Promise<void>
  setMovieQuality: (value: number) => Promise<void>
  setPictureOutput: (value: PictureOutputValue) => Promise<void>
  setPictureQuality: (value: number) => Promise<void>
  setTargetDir: (value: string) => Promise<void>
  setThreshold: (value: number) => Promise<void>
  setVideoParams: (value: string) => Promise<void>
  isCameraConnected: () => Promise<boolean>
  isDetectionStatusActive: () => Promise<boolean>
  pauseDetection: () => Promise<void>
  startDetection: () => Promise<void>
  takeSnapshot: () => Promise<void>
}
