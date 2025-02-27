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

WITTY_PI_PATH="/home/pi/wittypi"

if [ ! -d "$WITTY_PI_PATH" ]; then
  echo "Witty Pi path $WITTY_PI_PATH not found!"
  exit 1
fi

# shellcheck source=/dev/null
source "$WITTY_PI_PATH/utilities.sh"

# Call method in utilities.sh.
get_input_voltage
