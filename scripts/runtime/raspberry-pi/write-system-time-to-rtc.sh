#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

# include utilities script in same directory
wittpy_dir="/home/pi/wittypi"
wittpy_dir="`( cd \"$wittpy_dir\" && pwd )`"
if [ -z "$wittpy_dir" ] ; then
  exit 1
fi
. $wittpy_dir/utilities.sh

# call method in utilities.sh
system_to_rtc
