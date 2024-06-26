#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

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
