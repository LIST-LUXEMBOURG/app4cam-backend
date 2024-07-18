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

echo "full filename: $1"

base_dir="$(dirname "$0")"

"$base_dir"/write-device-id-to-jpg-file.sh "$1"

type=$(sed -n 's/.*DEVICE_TYPE=\([^ ]*\).*/\1/p' /home/app4cam/app4cam-backend/config/production.env)
echo "device type: $type"

if [ "$type" = "RaspberryPi" ]
then
    temp=$("$base_dir"/raspberry-pi/air-temperature/read_air_temp)
    echo "Air temperature: $temp"

    "$base_dir"/raspberry-pi/air-temperature/write-air-temperature-to-jpg-file.sh "$1" "$temp"
fi
