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

coordinates=$(curl "http://127.0.0.1:3000/settings/coordinates")
echo "response: $coordinates"

accuracy=$(echo "$coordinates" | jq -r '.accuracy')
echo "accuracy: $accuracy"

latitude=$(echo "$coordinates" | jq -r '.latitude')
echo "latitude: $latitude"

longitude=$(echo "$coordinates" | jq -r '.longitude')
echo "longitude: $longitude"

if [ ! "$accuracy" ] || [ "$accuracy" = "null" ] || [ ! "$latitude" ] || [ "$latitude" = "null" ] || [ ! "$longitude" ] || [ "$longitude" = "null" ]; then
  echo "The coordinates are not (completely) set."
  exit 1
fi

exiftool -overwrite_original -preserve "$1" -GPSCoordinates="$latitude $longitude" -LocationAccuracyHorizontal="$accuracy"
