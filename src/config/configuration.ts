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
export const configuration = () => ({
  deviceType: process.env.DEVICE_TYPE,
  disableAccessControlAllowOrigin:
    (process.env.DISABLE_ACCESS_CONTROL_ALLOW_ORIGIN &&
      process.env.DISABLE_ACCESS_CONTROL_ALLOW_ORIGIN == 'true') ||
    false,
  NODE_ENV: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  serviceName: process.env.SERVICE_NAME,
})
