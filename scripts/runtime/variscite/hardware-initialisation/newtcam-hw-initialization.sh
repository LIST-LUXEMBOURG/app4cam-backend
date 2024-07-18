#!/bin/bash
# Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
#
# App4Cam is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# App4Cam is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.

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
