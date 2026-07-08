export interface IMotionInteractorService {
  pauseDetectionIfActive: () => Promise<void>
  startDetectionIfNotActive: () => Promise<void>
  pauseOrResumeDetectionDependingOnDiskSpaceUsageAndTemperature: () => Promise<void>
}
