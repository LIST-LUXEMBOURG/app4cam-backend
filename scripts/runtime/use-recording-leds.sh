#!/bin/bash
# Copyright (C) 2022-2026  Luxembourg Institute of Science and Technology
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

# Exit when alternating light mode is enabled because light should not change.
is_alternating_light_mode_enabled=$(curl "http://127.0.0.1:3000/settings/isAlternatingLightModeEnabled")
if [ "$is_alternating_light_mode_enabled" = "true" ]; then
  exit 0
fi

if [ "$1" = "Variscite" ]; then
  base_dir="$(dirname "$0")/variscite"
elif [ "$1" = "RaspberryPi" ]; then
  base_dir="$(dirname "$0")/raspberry-pi"
fi

light_type=$(curl "http://127.0.0.1:3000/settings/cameraLight")
echo "response: $light_type"

"$base_dir"/light-control/lightctl set "$light_type"
