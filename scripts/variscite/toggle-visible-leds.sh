#!/bin/bash

# GPIO5_IO3
line_nr="gpiochip4"
pin_nr="3"

echo "Setting visible lights to $1"

gpioset "$line_nr" "$pin_nr"="$1"
