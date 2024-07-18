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
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <unistd.h>

// Function to read the temperature from the sensor
float read_temperature(const char *sensor_id) {
    char path[50];
    sprintf(path, "/sys/bus/w1/devices/%s/w1_slave", sensor_id);

    FILE *fp = fopen(path, "r");
    if (fp == NULL) {
        perror("Failed to open sensor file");
        return -1;
    }

    char line[100];
    char *temp_str;
    float temperature = -1;

    // Read the first line
    if (fgets(line, sizeof(line), fp) != NULL) {
        if (strstr(line, "YES") != NULL) {
            // Read the second line
            if (fgets(line, sizeof(line), fp) != NULL) {
                // Look for the temperature in the line
                temp_str = strstr(line, "t=");
                if (temp_str != NULL) {
                    temp_str += 2; // Move past "t="
                    temperature = atof(temp_str) / 1000.0; // Convert to Celsius
                }
            }
        }
    }

    fclose(fp);
    return temperature;
}

// Function to find first connected DS18B20 sensor
void find_sensor_get_temperature() {
    struct dirent *entry;
    DIR *dp = opendir("/sys/bus/w1/devices/");

    if (dp == NULL) {
        perror("opendir");
        return -1;
    }

    while ((entry = readdir(dp))) {
        if (strstr(entry->d_name, "28-") == entry->d_name) {
            float temperature = read_temperature(entry->d_name);
            if (temperature != -1) {
                printf("%.2f", temperature);
                break;
            } else {
                printf("Failed to read temperature for sensor ID: %s\n", entry->d_name);
            }
        }
    }

    closedir(dp);
}

int main() {
    find_sensor_get_temperature();
    return 0;
}
