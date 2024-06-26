#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

# scripts directory
scripts_dir="/home/app4cam/app4cam-backend/scripts/runtime/variscite"

# read rtc date
time_var="$(sudo $scripts_dir/rtc/get_time)"

# set system date
date -s "$time_var"

# turn off unused spare LED 1
gpioset gpiochip3 11=0

# turn off unused spare LED 2
gpioset gpiochip0  5=0
