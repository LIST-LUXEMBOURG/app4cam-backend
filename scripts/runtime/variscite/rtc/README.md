# RTC control Scripts

These are MCP7940N controlling scripts written in C. They took inspiration in the arduino's CPP libraries [Zanduino/MCP7940](https://github.com/Zanduino/MCP7940/).

## Chip

The [MCP7940N](https://ww1.microchip.com/downloads/en/DeviceDoc/20005010H.pdf) is a Battery-Backed I2C Real-Time Clock/Calendar with SRAM.  
The scripts are configured to be used on NewtCam HW boards developed by Quimesis. For HW details read the available wiki [variscite-guide](https://git.list.lu/host/mechatronics/app4cam-frontend/-/wikis/variscite-guide).

## Build

```
make
```

## Output scripts

### get_time

Usage is `./get_time`. This will return the current time set on the RTC chip e.g. `Tue 06 Feb 2024 16:05:19`.

### set_time

Usage is `./set_time "Tue 06 Feb 2024 16:05:19"`. This will set the RTC time to the provided date & time and start the RTC clock.

### sleep_until

Usage is `./sleep_until "06 Feb 2024 08:00:00"`. Shutdowns the device after setting an RTC alarm that outputs a signal that will turn on the device at the configure date & time.
