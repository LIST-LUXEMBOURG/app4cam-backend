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
#include <time.h>

#include <linux/i2c.h>
#include <linux/i2c-dev.h>

#include <sys/ioctl.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#define MCP7940_ADDRESS 0x6F         //< Fixed I2C address, fixed
#define MCP7940_EUI_ADDRESS 0x57     //< Fixed I2C address for accessing protected ROM
#define MCP7940_RTCSEC 0x00          //< Timekeeping, RTCSEC Register address
#define MCP7940_RTCMIN 0x01          //< Timekeeping, RTCMIN Register address
#define MCP7940_RTCHOUR 0x02         //< Timekeeping, RTCHOUR Register address
#define MCP7940_RTCWKDAY 0x03        //< Timekeeping, RTCWKDAY Register address
#define MCP7940_RTCDATE 0x04         //< Timekeeping, RTCDATE Register address
#define MCP7940_RTCMTH 0x05          //< Timekeeping, RTCMTH Register address
#define MCP7940_RTCYEAR 0x06         //< Timekeeping, RTCYEAR Register address
#define MCP7940_CONTROL 0x07         //< Timekeeping, RTCCONTROL Register address
#define MCP7940_OSCTRIM 0x08         //< Timekeeping, RTCOSCTRIM Register address
#define MCP7940_EEUNLOCK 0x09        //< Virtual unlock register on MCP7940x series
#define MCP7940_ALM0SEC 0x0A         //< Alarm 0, ALM0SEC Register address
#define MCP7940_ALM0MIN 0x0B         //< Alarm 0, ALM0MIN Register address
#define MCP7940_ALM0HOUR 0x0C        //< Alarm 0, ALM0HOUR Register address
#define MCP7940_ALM0WKDAY 0x0D       //< Alarm 0, ALM0WKDAY Register address
#define MCP7940_ALM0DATE 0x0E        //< Alarm 0, ALM0DATE Register address
#define MCP7940_ALM0MTH 0x0F         //< Alarm 0, ALM0MTH Register address
#define MCP7940_ALM1SEC 0x11         //< Alarm 1, ALM1SEC Register address
#define MCP7940_ALM1MIN 0x12         //< Alarm 1, ALM1MIN Register address
#define MCP7940_ALM1HOUR 0x13        //< Alarm 1, ALM1HOUR Register address
#define MCP7940_ALM1WKDAY 0x14       //< Alarm 1, ALM1WKDAY Register address
#define MCP7940_ALM1DATE 0x15        //< Alarm 1, ALM1DATE Register address
#define MCP7940_ALM1MTH 0x16         //< Alarm 1, ALM1MONTH Register address
#define MCP7940_PWRDNMIN 0x18        //< Power-Fail, PWRDNMIN Register address
#define MCP7940_PWRDNHOUR 0x19       //< Power-Fail, PWRDNHOUR Register address
#define MCP7940_PWRDNDATE 0x1A       //< Power-Fail, PWDNDATE Register address
#define MCP7940_PWRDNMTH 0x1B        //< Power-Fail, PWRDNMTH Register address
#define MCP7940_PWRUPMIN 0x1C        //< Power-Fail, PWRUPMIN Register address
#define MCP7940_PWRUPHOUR 0x1D       //< Power-Fail, PWRUPHOUR Register address
#define MCP7940_PWRUPDATE 0x1E       //< Power-Fail, PWRUPDATE Register address
#define MCP7940_PWRUPMTH 0x1F        //< Power-Fail, PWRUPMTH Register address
#define MCP7940_RAM_ADDRESS 0x20     //< NVRAM - Start address for SRAM
#define MCP7940_EUI_RAM_ADDRESS 0xF0 //< EUI - Start address for protected EEPROM
#define MCP7940_ST 7                 //< MCP7940 register bits. RTCSEC reg
#define MCP7940_12_24 6              //< RTCHOUR, PWRDNHOUR & PWRUPHOUR
#define MCP7940_AM_PM 5              //< RTCHOUR, PWRDNHOUR & PWRUPHOUR
#define MCP7940_OSCRUN 5             //< RTCWKDAY register
#define MCP7940_PWRFAIL 4            //< RTCWKDAY register
#define MCP7940_VBATEN 3             //< RTCWKDAY register
#define MCP7940_LPYR 5               //< RTCMTH register
#define MCP7940_OUT 7                //< CONTROL register
#define MCP7940_SQWEN 6              //< CONTROL register
#define MCP7940_ALM1EN 5             //< CONTROL register
#define MCP7940_ALM0EN 4             //< CONTROL register
#define MCP7940_EXTOSC 3             //< CONTROL register
#define MCP7940_CRSTRIM 2            //< CONTROL register
#define MCP7940_SQWFS1 1             //< CONTROL register
#define MCP7940_SQWFS0 0             //< CONTROL register
#define MCP7940_SIGN 7               //< OSCTRIM register
#define MCP7940_ALMPOL 7             //< ALM0WKDAY register
#define MCP7940_ALM0IF 3             //< ALM0WKDAY register
#define MCP7940_ALM1IF 3             //< ALM1WKDAY register

#define SECS_1970_TO_2000 946684800 //< Seconds between year 1970 and 2000

#define BUFFER_LENGTH 32

int init_i2c_bus(void);
void i2c_close(int i2c_fd);

uint8_t i2c_write(int i2c_fd, uint8_t slave_addr, uint8_t reg, uint8_t value);
uint8_t i2c_read(int i2c_fd, uint8_t slave_addr, uint8_t reg, uint8_t size, uint8_t *array);

void MCP7940_now(int i2c_fd);
void MCP7940_adjust(int i2c_fd, struct tm date_time);
uint8_t MCP7940_calibrate(int i2c_fd, int8_t new_trim);

uint8_t MCP7940_deviceStart(int i2c_fd);
uint8_t MCP7940_deviceStatus(int i2c_fd);
uint8_t MCP7940_enable_battery(int i2c_fd);

uint8_t MCP7940_get_MFP(int i2c_fd);
uint8_t MCP7940_get_alarm(int i2c_fd, uint8_t alarm_number);
uint8_t MCP7940_clear_alarm(int i2c_fd, uint8_t alarm_number);
uint8_t MCP7940_set_alarm_polarity(int i2c_fd, uint8_t polarity);
uint8_t MCP7940_set_alarm(int i2c_fd, uint8_t alarm_number, uint8_t alarm_type, struct tm dt, uint8_t state);

uint8_t MCP7940_get_power_fail(int i2c_fd);
uint8_t MCP7940_clear_power_fail(int i2c_fd);
