import { MotionVideoParametersWorker } from './motion-video-parameters-worker'

describe(MotionVideoParametersWorker.name, () => {
  describe(MotionVideoParametersWorker.convertStringToObject.name, () => {
    it('converts an average string', () => {
      expect(
        MotionVideoParametersWorker.convertStringToObject(
          '"Focus, Auto"=0,"Focus (absolute)"=200, Brightness=16',
        ),
      ).toStrictEqual({
        'Focus, Auto': 0,
        'Focus (absolute)': 200,
        Brightness: 16,
      })
    })
  })

  describe(MotionVideoParametersWorker.convertObjectToString.name, () => {
    it('converts an average object', () => {
      expect(
        MotionVideoParametersWorker.convertObjectToString({
          'Focus, Auto': 0,
          'Focus (absolute)': 200,
          Brightness: 16,
        }),
      ).toBe('"Focus, Auto"=0,"Focus (absolute)"=200,Brightness=16')
    })
  })
})
