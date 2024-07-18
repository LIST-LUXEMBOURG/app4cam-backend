/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import { http, HttpResponse } from 'msw'

const ALLOWED_GET_CONFIG_OPTIONS = [
  'height',
  'log_file',
  'movie_output',
  'movie_quality',
  'picture_output',
  'picture_quality',
  'target_dir',
  'threshold',
  'video_device',
  'video_params',
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
  'video_params',
]

const baseUrl = (path: string) =>
  new URL(path, 'http://127.0.0.1:8080').toString()

export const handlers = [
  http.get(
    baseUrl('action/config/write'),
    () => new HttpResponse(null, { status: 200 }),
  ),

  http.get(
    baseUrl('0/action/snapshot'),
    () => new HttpResponse(null, { status: 200 }),
  ),

  http.get(baseUrl('0/config/get'), ({ request }) => {
    const url = new URL(request.url)
    const queryParameterValues = Array.from(url.searchParams.values())
    if (queryParameterValues.length !== 1) {
      return new HttpResponse(null, { status: 400 })
    }
    if (!ALLOWED_GET_CONFIG_OPTIONS.includes(queryParameterValues[0])) {
      return new HttpResponse(null, { status: 404 })
    }

    let body
    switch (queryParameterValues[0]) {
      // Make sure to add new options to the allow list above too.
      case 'log_file':
        body = `Camera 0 ${queryParameterValues[0]} = /a/b.log Done`
        break
      case 'movie_output':
      case 'picture_output':
        body = `Camera 0 ${queryParameterValues[0]} = on Done`
        break
      case 'target_dir':
        body = `Camera 0 ${queryParameterValues[0]} = /a/b/c Done`
        break
      case 'video_device':
        body = `Camera 0 ${queryParameterValues[0]} = /dev/video0 Done`
        break
      case 'video_params':
        body = `Camera 0 ${queryParameterValues[0]} = "Focus, Auto"=0, "Focus (absolute)"=200, Brightness=16 Done `
        break
      default:
        body = `Camera 0 ${queryParameterValues[0]} = 1 Done`
        break
    }
    return new HttpResponse(body, { status: 200 })
  }),

  http.get(baseUrl('0/config/set'), ({ request }) => {
    const url = new URL(request.url)
    const queryParameterKeys = Array.from(url.searchParams.keys())
    if (queryParameterKeys.length !== 1) {
      return new HttpResponse(null, { status: 400 })
    }
    if (!ALLOWED_SET_CONFIG_OPTIONS.includes(queryParameterKeys[0])) {
      return new HttpResponse(null, { status: 404 })
    }
    return new HttpResponse(null, { status: 200 })
  }),

  http.get(
    baseUrl('0/detection/pause'),
    () => new HttpResponse(null, { status: 200 }),
  ),

  http.get(
    baseUrl('0/detection/start'),
    () => new HttpResponse(null, { status: 200 }),
  ),

  http.get(
    baseUrl('0/detection/status'),
    () => new HttpResponse('Camera 0 Detection status ACTIVE', { status: 200 }),
  ),
]
