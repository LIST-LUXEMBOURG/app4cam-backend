#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

WITTY_PI_PATH="/home/pi/wittypi"

if [ ! -d "$WITTY_PI_PATH" ]
then
  echo "Witty Pi path $WITTY_PI_PATH not found!"
  exit 1
fi

sudo rm -f "$WITTY_PI_PATH/schedule.wpi"

# shellcheck source=/dev/null
source "$WITTY_PI_PATH"/utilities.sh

# Call methods in utilities.sh.
clear_startup_time
clear_shutdown_time
