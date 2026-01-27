# Light Control Scripts

A dedicated GPIO controller for visible and infrared illumination.

## Overview

The scripts are configured to be used on NewtCam HW boards developed by Quimesis. For HW details read the available wiki [variscite-guide](https://git.list.lu/host/mechatronics/app4cam-frontend/-/wikis/variscite-guide).

**The scripts are written in C language and consist of a dedicated daemon that:**

- owns the GPIO lines permanently
- prevents external interference
- exposes a clean API for switching lights and for state reporting

**And respective client that allows:**

- setting the ligths state
- getting the current state

**Two components are included:**

- lightd - the daemon that controls the GPIO hardware
- lightctl - a client tool used by external services to control and monitor the lights

## GPIO Mapping

| Light Type | gpiochip  | Line | Description            |
| ---------- | --------- | ---- | ---------------------- |
| visible    | gpiochip4 | 3    | Activates visible LEDs |
| infrared   | gpiochip4 | 24   | Activates IR LEDs      |

## Components

### lightd (daemon)

- Runs as a background service
- Owns both GPIO lines permanently
- Listens on a UNIX domain socket:  
  `/run/app4cam/lightd.sock`
- Accepts the following commands:
  - `SET visible` — enables visible LEDs and disables infrared
  - `SET infrared` — enables infrared LEDs and disables visible
  - `GET` — returns the currently active light mode
- Ensures only one light type is active at a time

### lightctl (client)

- Command‑line tool used to communicate with `lightd`
- Sends commands over the UNIX socket
- Usage:
  - `lightctl set visible`
  - `lightctl set infrared`
  - `lightctl get`
- Provides a simple interface used by motion service

## Build

To compile both the daemon `lightd` and the client `lightctl`, simply run:

```
make
```

This produces two binaries in the project directory:

- `lightd` - the background service that controls the GPIO lines
- `lightctl` - the command‑line client used to communicate with the daemon

## Installation

### 1. Insure the binaries are executable

```
sudo chmod 755 /home/app4cam/app4cam-backend/scripts/runtime/variscite/light-control/lightd
sudo chmod 755 /home/app4cam/app4cam-backend/scripts/runtime/variscite/light-control/lightctl
```

### 2. Create the runtime directory

`lightd` uses a UNIX socket located at:

```
/run/app4cam/lightd.sock
```

Create the directory (the daemon will also ensure this exists):

```
mkdir -p /run/app4cam
```

### 3. Install the systemd service

1. Create the system service with the bellow content:`nano /etc/systemd/system/lightd.service`

```
[Unit]
Description=App4Cam Light Control Daemon
After=network.target
RequiresMountsFor=/run/app4cam

[Service]
Type=simple
ExecStartPre=/bin/mkdir -p /run/app4cam
ExecStart=/home/app4cam/app4cam-backend/scripts/runtime/variscite/light-control/lightd
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
```

2. Reload systemctl: `systemctl daemon-reload`
3. Enable service: `systemctl enable lightd.service`
4. Start the service: `systemctl start lightd.service`
5. Check the service: `systemctl status lightd.service`

## Usage

### Set visible lights

Use the command to enable the **visible LED** line and disable the infrared LED line.

```
lightctl set visible
```

### Set infrared lights

Use the command to enable the **infrared LED** line and disable the visible LED line.

```
lightctl set infrared
```

### Query the current active mode

```
lightctl get
```

Output will either `visible` or `infrared`.

### Notes

- Only one light mode is active at a time.
- All commands communicate with the `lightd` daemon through the UNIX socket at:

```
/run/app4cam/lightd.sock
```

- If the daemon is not running, commands will fail with a connection error.
