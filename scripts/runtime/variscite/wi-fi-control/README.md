# WiFi Control Scripts

This is an event input pin reading application with libgpiod written in C. This can be compiled and executed on Linux based systems if there is GPIO.

## Wiring

The scripts are configured to be used on NewtCam HW boards developed by Quimesis. For HW details read the available wiki [variscite-guide](https://git.list.lu/host/mechatronics/app4cam-frontend/-/wikis/variscite-guide).

```
GPIO chip0 pin  0 - connects the on/off push button.
GPIO chip3 pin 17 - connects the indication led.
```

## Build

```
make
```

## Execute

```
./wifi_control
```

## Clean

```
make clean
```

## Service

1. Create the system service with the following content: `nano /etc/systemd/system/wifi_control.service`

```
[Unit]
Description=Service that interfaces wifi button & LED
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
ExecStart=/home/app4cam/app4cam-backend/scripts/runtime/variscite/wi-fi-control/wifi_control
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

2. Reload systemctl: `systemctl daemon-reload`
3. Enable service: `systemctl enable wifi_control.service`
4. Start the service: `systemctl start wifi_control.service`
5. Check the service: `systemctl status wifi_control.service`
