#!/bin/bash

# GPIO3_IO16
line_nr="gpiochip2"
pin_nr="16"

echo "Setting visible lights to $1"

gpioset "$line_nr" "$pin_nr"="$1"
