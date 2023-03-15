#!/bin/bash

# GPIO5_IO13
line_nr="gpiochip4"
pin_nr="13"

echo "Setting infrared lights to $1"

gpioset "$line_nr" "$pin_nr"="$1"
