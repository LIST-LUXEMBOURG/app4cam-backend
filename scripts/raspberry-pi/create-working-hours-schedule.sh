#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

WITTY_PI_PATH="/home/pi/wittypi"

if [ ! -d "$WITTY_PI_PATH" ]
then
  echo "Witty Pi path $WITTY_PI_PATH not found!"
  exit 1
fi

begin_value="$1"
end_value="$2"
on_value="$3"
off_value="$4"

if [ -z "$begin_value" ] || [ -z "$end_value" ] || [ -z "$on_value" ] || [ -z "$off_value" ]
then
  echo "One of the 4 values is missing!"
  exit 1
fi

sudo tee "$WITTY_PI_PATH/schedule.wpi" > /dev/null << EOL
BEGIN $begin_value
END   $end_value
ON    $on_value
OFF   $off_value
EOL

"$WITTY_PI_PATH"/runScript.sh
