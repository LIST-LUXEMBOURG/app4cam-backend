#define _XOPEN_SOURCE 700
#include <time.h>
#include "mcp7940.h"

#define PULSE_SEC 3

/*!
    @usage:  ./sleep_until " 06 Feb 2024 09:37:00"
    @brief   set the wake up time to the RTC and shutdown the device
*/
int main(int argc, char **argv)
{
    struct tm alarm0, alarm1;
    uint8_t matchAll = 7, alarm_nr_0 = 0, alarm_nr_1 = 1;
    const char dict_month[12][4] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

    strptime(argv[1], "%d %b %Y %T", &alarm1);
    alarm0 = alarm1;
    alarm0.tm_sec -= PULSE_SEC;
    mktime(&alarm0);

    printf("Setting next wakeup to: %02d %s - %02d:%02d:%02d\n",
           alarm1.tm_mday,
           dict_month[alarm1.tm_mon],
           alarm1.tm_hour,
           alarm1.tm_min,
           alarm1.tm_sec);

    int file_bus = init_i2c_bus();

    MCP7940_clear_alarm(file_bus, alarm_nr_0);
    MCP7940_clear_alarm(file_bus, alarm_nr_1);

    MCP7940_set_alarm_polarity(file_bus, 0);

    MCP7940_set_alarm(file_bus, alarm_nr_0, matchAll, alarm0, 1);
    MCP7940_set_alarm(file_bus, alarm_nr_1, matchAll, alarm1, 1);

    i2c_close(file_bus);

    system("shutdown -h now");

    return 0;
}
