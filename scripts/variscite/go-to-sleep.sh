#!/bin/bash
# mode: -m flag
# on: debug alternative
# @todo once hw is available change mode to: off

echo "Going to sleep until $1"

rtcwake -m on --date "$1"
