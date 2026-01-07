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

if [ "$3" ]; then
  is_alternating_light_mode_enabled="$3"
else
  is_alternating_light_mode_enabled=$(curl "http://127.0.0.1:3000/settings/isAlternatingLightModeEnabled")
  echo "response: $is_alternating_light_mode_enabled"
fi

# Exit when alternating light mode is enabled because light should not change.
if [ "$is_alternating_light_mode_enabled" = "true" ]; then
  exit 0
fi

if [ "$1" = "Variscite" ]; then
  base_dir="$(dirname "$0")/variscite"
elif [ "$1" = "RaspberryPi" ]; then
  base_dir="$(dirname "$0")/raspberry-pi"
fi

if [ "$2" ]; then
  light_type="$2"
else
  light_type=$(curl "http://127.0.0.1:3000/settings/triggeringLight")
  echo "response: $light_type"
fi

infrared_leds_flag=0
if [ "$light_type" = "infrared" ]; then
  infrared_leds_flag=1
fi

visible_leds_flag=$((1 - infrared_leds_flag))

# Pause motion to prevent triggering another event by the light switch
# when the light type is not passed, i.e. it is called by Motion.
url=http://127.0.0.1:8080/0/detection
if [ ! "$2" ]; then
  echo "Pausing motion..."
  curl $url/pause
fi

"$base_dir"/light/toggle-ir-leds.sh $infrared_leds_flag
"$base_dir"/light/toggle-visible-leds.sh $visible_leds_flag

# Wait until the image is not changing anymore and resume motion
# when the light type is not passed.
if [ ! "$2" ]; then
  sleep 15
  echo "Resuming motion..."
  curl $url/start
fi
