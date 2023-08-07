#!/bin/bash

if [ "$1" = "Variscite" ]
then
  base_dir="$(dirname "$0")/variscite"
elif [ "$1" = "RaspberryPi" ]
then  
  base_dir="$(dirname "$0")/raspberry-pi"
fi

"$base_dir"/toggle-ir-leds.sh 0
"$base_dir"/toggle-visible-leds.sh 1
