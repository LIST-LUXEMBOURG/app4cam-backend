#!/bin/bash
# Copyright (C) 2026 Luxembourg Institute of Science and Technology
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

if [ "$1" = "Variscite" ]; then
  base_dir="$(dirname "$0")/variscite"
elif [ "$1" = "RaspberryPi" ]; then
  base_dir="$(dirname "$0")/raspberry-pi"
fi

light_type="infrared"

day_of_year=$(date +%-j)
if [ $((day_of_year % 2)) -eq 0 ]; then
  # Turn on visible light on even days of the year.
  light_type="visible"
fi

"$base_dir"/light-control/lightctl set "$light_type"
