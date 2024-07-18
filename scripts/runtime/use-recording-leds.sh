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

if [ "$1" = "Variscite" ]
then
  base_dir="$(dirname "$0")/variscite"
elif [ "$1" = "RaspberryPi" ]
then  
  base_dir="$(dirname "$0")/raspberry-pi"
fi

light_type=$(curl "http://127.0.0.1:3000/settings/cameraLight")
echo "response: $light_type"

infrared_leds_flag=0
if [ "$light_type" = "infrared" ]
then
  infrared_leds_flag=1
fi

visible_leds_flag=$((1-infrared_leds_flag))

"$base_dir"/light/toggle-ir-leds.sh $infrared_leds_flag
"$base_dir"/light/toggle-visible-leds.sh $visible_leds_flag
