#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

echo "full filename: $1"
echo "Air temperature: $2"

exiftool "$1" -Keys:Information="AmbientTemperature=$2"

rm "$1_original"
