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
else
  echo 'Invalid or no device type given!'
  exit 1
fi

day_of_year=$(date +%-j)
hour=$(date +%-H)
if [ $((day_of_year % 2)) -eq 0 ]; then
  # even days: infrared from midday on, visible before midday
  if [ "$hour" -ge 12 ]; then
    light_type="infrared"
  else
    light_type="visible"
  fi
else
  # odd days: visible from midday on, infrared before midday
  if [ "$hour" -ge 12 ]; then
    light_type="visible"
  else
    light_type="infrared"
  fi
fi

"$base_dir"/light-control/lightctl set "$light_type"
