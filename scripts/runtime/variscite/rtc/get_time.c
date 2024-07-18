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
    @usage:  ./get_time
    @brief   prints the current RTC date/time e.g.: Sat 03 Feb 2024 02:45:36
*/
int main(int argc, char **argv)
{
    int file_bus = init_i2c_bus();

    MCP7940_now(file_bus);

    i2c_close(file_bus);

    return 0;
}
