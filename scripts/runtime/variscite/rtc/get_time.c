#include "mcp7940.h"
// © 2024 Luxembourg Institute of Science and Technology

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
