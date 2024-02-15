#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

CONNECTION_NAME=WIFI_AP

nmcli --show-secrets connection show "$CONNECTION_NAME" | grep 802-11-wireless-security.psk:
