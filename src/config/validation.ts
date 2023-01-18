import { plainToClass } from 'class-transformer'
import { IsNotEmpty, IsPositive, IsString, validateSync } from 'class-validator'

class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  DEVICE_TYPE: 'RaspberryPi' | 'Variscite'

  DISABLE_ACCESS_CONTROL_ALLOW_ORIGIN: boolean

  NODE_ENV: string

  @IsNotEmpty()
  @IsPositive()
  PORT: number

  @IsNotEmpty()
  @IsString()
  SERVICE_NAME: string
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}
