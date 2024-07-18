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
#include <unistd.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <linux/i2c-dev.h>
#include <sys/ioctl.h>
#include <fcntl.h>

int main(int argc, char **argv)
{
    char *filename = "/dev/i2c-2";
    int file, addr = 0x4d;
    char buf[2];
    float raw, voltage;

    if ((file = open(filename, O_RDWR)) < 0) {
        perror("Failed to open the i2c bus");
        return -1;
    }

    if (ioctl(file, I2C_SLAVE, addr) < 0) {
        perror("Failed to acquire bus access and/or talk to slave.\n");
        return -1;
    }

    if (read(file, buf, 2) != 2) {
        perror("Failed to read 2 bytes from the i2c bus.\n");
        return -1;
    }

    raw = (float)((buf[0] & 0b00001111)<<8)+buf[1]; // 10 bits
    voltage = 0.003539425 * raw + 0.211151;
    printf("%.1f", voltage);
    return 0;
}
