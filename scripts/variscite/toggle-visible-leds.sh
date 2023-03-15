#!/bin/bash

# GPIO5_IO12
line_nr="gpiochip4"
pin_nr="12"

echo "Setting visible lights to $1"

gpioset "$line_nr" "$pin_nr"="$1"
