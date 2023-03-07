#!/bin/bash

if [ -z "$1" ]
then
  echo "The name of the Wi-Fi network aka. SSID is required as parameter."
  exit 1
fi

name="$1"

nmcli con down WIFI_AP
nmcli con modify WIFI_AP ssid "$name"
nmcli con up WIFI_AP
