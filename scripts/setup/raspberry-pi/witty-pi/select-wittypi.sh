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

# check if sudo is used
if [ "$(id -u)" != 0 ]; then
  echo 'Sorry, you need to run this script with sudo'
  exit 1
fi

USER_HOME="/home/pi"
WITTYPI_DIR="$USER_HOME/wittypi"

# Check if Witty Pi 3 is connected at 0x69
if i2cdetect -y 1 | grep -q "69"; then
  VERSION=3
# Check if Witty Pi 4 is connected at 0x08
elif i2cdetect -y 1 | grep -q "08"; then
  VERSION=4
else
  echo "No Witty Pi detected!"
  exit 1
fi

echo "Detected Witty Pi $VERSION"

if [ -d "$WITTYPI_DIR" ]; then
  echo 'Deleting existing Witty Pi folder...'
  rm -r "$WITTYPI_DIR"
fi

mkdir -p "$WITTYPI_DIR"

# The archives of both versions are available in the home folder.
unzip wittyPi"$VERSION".zip -d "$WITTYPI_DIR" || ((ERR++))
