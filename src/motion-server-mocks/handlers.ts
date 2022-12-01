import { rest } from 'msw'

const ALLOWED_GET_CONFIG_OPTIONS = [
  'height',
  'movie_output',
  'movie_quality',
  'picture_output',
  'picture_quality',
  'target_dir',
  'threshold',
  'width',
]
const ALLOWED_SET_CONFIG_OPTIONS = [
  'movie_filename',
  'movie_output',
  'movie_quality',
  'picture_filename',
  'picture_output',
  'picture_quality',
  'snapshot_filename',
  'target_dir',
  'text_left',
  'threshold',
]

const baseUrl = (path: string) =>
  new URL(path, 'http://127.0.0.1:8080').toString()

export const handlers = [
  rest.get(baseUrl('action/config/write'), (_req, res, ctx) =>
    res(ctx.status(200)),
  ),

  rest.get(baseUrl('0/action/snapshot'), (_req, res, ctx) =>
    res(ctx.status(200)),
  ),

  rest.get(baseUrl('0/config/get'), (req, res, ctx) => {
    const queryParameterValues = Array.from(req.url.searchParams.values())
    if (queryParameterValues.length !== 1) {
      return res(ctx.status(400))
    }
    if (!ALLOWED_GET_CONFIG_OPTIONS.includes(queryParameterValues[0])) {
      return res(ctx.status(404))
    }

    let body
    switch (queryParameterValues[0]) {
      case 'movie_output':
      case 'picture_output':
        body = `Camera 0 ${queryParameterValues[0]} = on Done`
        break
      case 'target_dir':
        body = `Camera 0 ${queryParameterValues[0]} = /a/b/c Done`
        break
      default:
        body = `Camera 0 ${queryParameterValues[0]} = 1 Done`
        break
    }
    return res(ctx.status(200), ctx.body(body))
  }),

  rest.get(baseUrl('0/config/set'), (req, res, ctx) => {
    const queryParameterKeys = Array.from(req.url.searchParams.keys())
    if (queryParameterKeys.length !== 1) {
      return res(ctx.status(400))
    }
    if (!ALLOWED_SET_CONFIG_OPTIONS.includes(queryParameterKeys[0])) {
      return res(ctx.status(404))
    }
    return res(ctx.status(200))
  }),

  rest.get(baseUrl('0/detection/pause'), (_req, res, ctx) =>
    res(ctx.status(200)),
  ),

  rest.get(baseUrl('0/detection/start'), (_req, res, ctx) =>
    res(ctx.status(200)),
  ),

  rest.get(baseUrl('0/detection/status'), (_req, res, ctx) => {
    return res(ctx.status(200), ctx.body('Camera 0 Detection status ACTIVE'))
  }),
]
