#!/bin/bash
# Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
#
# App4Cam is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# App4Cam is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.

name="App4Cam"
password="0123456789"

# Add the MAC address aka. device ID to the Wi-Fi network name aka. SSID name.
mac_address=$(cat /sys/class/net/*/address | grep -m 1 -P '(?:[a-zA-Z0-9]{2}[:]){5}[a-zA-Z0-9]{2}')
echo "MAC address found: $mac_address"
if [ "$mac_address" ]; then
  name="$name $mac_address"
fi

nmcli con add type wifi ifname wlan0 mode ap con-name WIFI_AP ssid "$name"
nmcli con modify WIFI_AP 802-11-wireless.band bg
nmcli con modify WIFI_AP 802-11-wireless.channel 1
nmcli con modify WIFI_AP 802-11-wireless-security.key-mgmt wpa-psk
nmcli con modify WIFI_AP 802-11-wireless-security.proto rsn
nmcli con modify WIFI_AP 802-11-wireless-security.group ccmp
nmcli con modify WIFI_AP 802-11-wireless-security.pairwise ccmp
nmcli con modify WIFI_AP 802-11-wireless-security.psk "$password"
nmcli con modify WIFI_AP ipv4.method shared
nmcli con up WIFI_AP
