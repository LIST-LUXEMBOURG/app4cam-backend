
#!/bin/bash

if [ "$1" = "Variscite" ]
then
  base_dir="$(dirname "$0")/variscite"
elif [ "$1" = "RaspberryPi" ]
then  
  base_dir="$(dirname "$0")/raspberry-pi"
fi

if [ "$2" ]
then
  light_type="$2"
else
  light_type=$(curl "http://127.0.0.1:3000/settings/triggeringLight")
  echo "response: $light_type"
fi

ir_triggering=0
if [ "$light_type" = "infrared" ]
then
  ir_triggering=1
fi

visible_leds=$((1-ir_triggering))

"$base_dir"/toggle-ir-leds.sh $ir_triggering
"$base_dir"/toggle-visible-leds.sh $visible_leds
