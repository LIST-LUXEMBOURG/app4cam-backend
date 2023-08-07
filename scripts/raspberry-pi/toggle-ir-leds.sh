#!/bin/bash

pin_nr="27"
raspi-gpio set "$pin_nr" op

echo "Setting infrared lights to $1"

if [ "$1" = "1" ]
then
  state="dl"
elif [ "$1" = "0" ]
then
  state="dh"
fi

raspi-gpio set "$pin_nr" "$state"
