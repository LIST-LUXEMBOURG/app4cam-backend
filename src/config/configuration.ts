export const configuration = () => ({
  disableAccessControlAllowOrigin:
    (process.env.DISABLE_ACCESS_CONTROL_ALLOW_ORIGIN &&
      process.env.DISABLE_ACCESS_CONTROL_ALLOW_ORIGIN == 'true') ||
    false,
  NODE_ENV: process.env.NODE_ENV,
  filesFolderPath: process.env.FILES_FOLDER_PATH,
  port: parseInt(process.env.PORT, 10),
})
