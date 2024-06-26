// © 2024 Luxembourg Institute of Science and Technology
#define _XOPEN_SOURCE 700
#include <time.h>
#include "mcp7940.h"

/*!
    @usage:  ./set_time "Tue 06 Feb 2024 09:37:00"
    @brief   set the specified time to the RTC
*/
int main(int argc, char **argv)
{
    struct tm date_time;
    const char day[7][4] = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
    const char month[12][4] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

    strptime(argv[1], "%a %d %b %Y %T", &date_time);

    printf("Setting date to: %s %02d %s %d %02d:%02d:%02d\n",
           day[date_time.tm_wday - 1],
           date_time.tm_mday,
           month[date_time.tm_mon],
           date_time.tm_year + 1900,
           date_time.tm_hour,
           date_time.tm_min,
           date_time.tm_sec);

    int file_bus = init_i2c_bus();

    MCP7940_clear_power_fail(file_bus);
    MCP7940_enable_battery(file_bus);
    while (!MCP7940_deviceStatus(file_bus)) // Turn oscillator on if necessary
    {
        printf("Oscillator is off, turning it on.\n");
        unsigned char deviceStatus = MCP7940_deviceStart(file_bus);
        if (!deviceStatus)
        {
            printf("Oscillator did not start, trying again.\n");
            sleep(1);
        }
    }

    MCP7940_adjust(file_bus, date_time);

    i2c_close(file_bus);

    return 0;
}
