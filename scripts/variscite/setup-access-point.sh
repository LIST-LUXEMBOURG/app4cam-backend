if [ -z "$1" ] || [ -z "$2" ]
then
  echo "Two parameters are required."
  echo "The first parameter is the name of the Wi-Fi network aka. SSID."
  echo "The second parameter is the password of the Wi-Fi network."
  exit 1
fi

name="$1"
password="$2"

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
