# Hardware initialization

This service is responsible for running a shell script which initializes Newtcam HW in the default state.  
For the HW details read the available wiki [variscite-guide](https://git.list.lu/host/mechatronics/app4cam-frontend/-/wikis/variscite-guide).

## Script

The scripts were developed to be used on NewtCam HW boards developed together with Quimesis.
The initialization procedures are the following:

### 1. Synchronize the system time

Read the RTC date and time and then write it to the device.

### 2. Turn off unused status LEDs

Deactivates unused, spare 1 and spare 2, LEDs.

## Service

To enable the initialization service and make it run at boot:

1. Create the system service with the following content: `nano /etc/systemd/system/newtcam-init-hw.service`

```
[Unit]
Description=Service that initializes Newtcam HW
After=default.target

[Service]
Type=simple
ExecStart=/home/app4cam/app4cam-backend/scripts/runtime/variscite/scripts/hardware-initialisation/newtcam-hw-initialization.sh

[Install]
WantedBy=default.target
```

2. Reload systemctl: `systemctl daemon-reload`
3. Enable service: `systemctl enable newtcam-init-hw.service`
4. Start the service: `systemctl start newtcam-init-hw.service`
