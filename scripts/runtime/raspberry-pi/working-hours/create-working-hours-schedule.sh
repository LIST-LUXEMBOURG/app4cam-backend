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

if [ ! -d "$WITTY_PI_PATH" ]
then
  echo "Witty Pi path $WITTY_PI_PATH not found!"
  exit 1
fi

begin_value="$1"
end_value="$2"
on_value="$3"
off_value="$4"

if [ -z "$begin_value" ] || [ -z "$end_value" ] || [ -z "$on_value" ] || [ -z "$off_value" ]
then
  echo "One of the 4 values is missing!"
  exit 1
fi

sudo tee "$WITTY_PI_PATH/schedule.wpi" > /dev/null << EOL
BEGIN $begin_value
END   $end_value
ON    $on_value
OFF   $off_value
EOL

"$WITTY_PI_PATH"/runScript.sh
