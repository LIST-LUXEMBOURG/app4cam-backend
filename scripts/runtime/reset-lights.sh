#!/bin/bash
# Copyright (C) since 2026 Luxembourg Institute of Science and Technology
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

base_dir="$(dirname "$0")"

light_type="$1"
is_alternating_light_mode_enabled="$2"

# If alternating light mode is enabled, set it and nothing else.
if [ "$is_alternating_light_mode_enabled" = "true" ]; then
  device_type=$(sed -n 's/.*DEVICE_TYPE=\([^ ]*\).*/\1/p' /home/app4cam/app4cam-backend/config/production.env)
  "$base_dir"/set-alternating-lights.sh "$device_type"
  exit 0
fi

"$base_dir"/use-triggering-leds.sh "$light_type" "$is_alternating_light_mode_enabled"
