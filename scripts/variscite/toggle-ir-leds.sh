#!/bin/bash
# © 2022-2024 Luxembourg Institute of Science and Technology

# GPIO5_IO24
line_nr="gpiochip4"
pin_nr="24"

echo "Setting infrared lights to $1"

gpioset "$line_nr" "$pin_nr"="$1"
