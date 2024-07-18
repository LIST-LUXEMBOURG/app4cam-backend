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

device_path="$1"
focus="$2"

if [ -z "$begin_value" ]
then
  echo "The device path is not set!"
fi
if [ -z "$focus" ]
then
  echo "The focus is not set!"
fi

echo "Setting camera focus of device on path $device_path to $focus..."

# Set focus in the driver.
v4l2-ctl -d "$device_path" -c focus_absolute="$focus"

# Reset focus on each reboot with a udev rule.
echo "SUBSYSTEM==\"video4linux\", SUBSYSTEMS==\"i2c\", ATTRS{name}==\"dw9817-vcm\", PROGRAM=\"/usr/bin/v4l2-ctl --set-ctrl focus_absolute=$focus --device /dev/%k\"" > /etc/udev/rules.d/99-camera.rules
