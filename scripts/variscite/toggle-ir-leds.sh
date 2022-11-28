#!/bin/bash

# GPIO1_IO00
line_nr="gpiochip0"
pin_nr="0"

echo "Setting infrared lights to $1"

gpioset "$line_nr" "$pin_nr"="$1"
