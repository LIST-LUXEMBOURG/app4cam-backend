#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

WITTY_PI_PATH="/home/pi/wittypi"

if [ ! -d "$WITTY_PI_PATH" ]
then
  echo "Witty Pi path $WITTY_PI_PATH not found!"
  exit 1
fi

# shellcheck source=/dev/null
source "$WITTY_PI_PATH/utilities.sh"

# Call method in utilities.sh.
get_input_voltage
