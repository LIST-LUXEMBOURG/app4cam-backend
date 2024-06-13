#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

echo "full filename: $1"

/home/app4cam/app4cam-backend/scripts/write-device-id-to-mp4-file.sh "$1"

type=$(sed -n 's/.*DEVICE_TYPE=\([^ ]*\).*/\1/p' /home/app4cam/app4cam-backend/config/production.env)
echo "device type: $type"

if [ "$type" = "RaspberryPi" ]
then
    temp=$(/home/app4cam/app4cam-backend/scripts/raspberry-pi/air-temperature/read_air_temp)
    echo "Air temperature: $temp"

    /home/app4cam/app4cam-backend/scripts/raspberry-pi/air-temperature/write-air-temperature-to-mp4-file.sh "$1" "$temp"
fi
