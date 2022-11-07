#!/bin/bash

echo "full filename: $1"

id=`cat /home/app4cam/app4cam-backend/device-id.txt`
echo "device ID: $id"

exiftool "$1" -IFD0:CameraSerialNumber="$id"

rm "$1_original"