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
#include "mcp7940.h"

/*!
    @usage:  ./clear_alarms
    @brief   Clears the alarms from the RTC to allo the device to boot normally
*/
int main(int argc, char **argv)
{    
    uint8_t error = 0;
    int file_bus = init_i2c_bus();

    error = MCP7940_clear_alarm(file_bus, 0); // clear alarm 0
    if (error != 0){
        printf("Failed to clear alarm 0 - %d\n", error);
        i2c_close(file_bus);
        
        return error;
    }
        
    error = MCP7940_clear_alarm(file_bus, 1); // clear alarm 1
    if (error != 0){
        printf("Failed to clear alarm 1 - %d\n", error);
        i2c_close(file_bus);
        
        return error;
    }

    i2c_close(file_bus);
    
    printf("Successfully cleared RTC sleep alarms!\n");

    return 0;
}
