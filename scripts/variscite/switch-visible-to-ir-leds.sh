#!/bin/bash

base_dir="$(dirname "$0")"

"$base_dir"/toggle-visible-leds.sh 0
"$base_dir"/toggle-ir-leds.sh 1
