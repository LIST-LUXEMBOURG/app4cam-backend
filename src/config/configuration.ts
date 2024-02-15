// © 2022-2024 Luxembourg Institute of Science and Technology
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
