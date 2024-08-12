# App4Cam Backend

## Table of Contents

1. [Development](#development)
   - [Prerequisites](#prerequisites)
   - [Setup](#setup)
   - [Running the app](#running-the-app)
   - [Test](#test)
   - [API documentation](#api-documentation)
   - [License notice](#license-notice)
2. [Deployment](#deployment)
   - [1. Installing dependencies, creating user, folders and setting permissions](#1-installing-dependencies-creating-user-folders-and-setting-permissions)
     - [Hostname configuration: sudo host](#-hostname-configuration-sudo-host)
   - [2. Installing Motion](#2-installing-motion)
     - [Configuring Motion](#-configuring-motion)
     - [Running Motion as service](#-running-motion-as-service)
     - ["libcamerify" Motion](#-libcamerify-motion)
   - [3. Setting up network behavior](#3-setting-up-network-behavior)
     - [On Raspberry Pi](#-on-raspberry-pi)
     - [On Variscite](#-on-variscite)
   - [4. Installing ExifTool](#4-installing-exiftool)
   - [5. Enabling user services and USB auto-mounting](#5-enabling-user-services-and-usb-auto-mounting)
     - [Checking USB auto-mounting](#-checking-usb-auto-mounting)
   - [6. Make sure automatic time synchronisaton is disabled](#6-make-sure-automatic-time-synchronisaton-is-disabled)
   - [7. Installing Witty Pi 3 (Raspberry Pi only)](#7-installing-witty-pi-3-raspberry-pi-only)
   - [8. Adding FTP access (Raspberry Pi only)](#8-adding-ftp-access-raspberry-pi-only)
   - [9. Hardware Configuration (Quimesis interface board only)](#9-hardware-configuration-quimesis-interface-board-only)
   - [10. Deploying the application](#10-deploying-the-application)
   - [11. For continuous deployment (CD) only](#11-for-continuous-deployment-cd-only)
3. [Release procedure](#release-procedure)

## Development

### Prerequisites

- \>= Node.js 18.x

### Setup

1. Run: `npm install`
2. Copy config file `config/sample.env` to `config/development.env`.
3. Set `DISABLE_ACCESS_CONTROL_ALLOW_ORIGIN` to `false`.
4. Optionally edit further options as needed.

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### API documentation

An OpenAPI Specification (OAS) is available under `/api`.

### License notice

The following license notice must be included as a comment at the beginning of every source code file:

```
Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology

App4Cam is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

App4Cam is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
```

## Deployment

This software requires the following tools to be installed:

### 1. Installing dependencies, creating user, folders and setting permissions

Execute the setup script with root permissions:

```shell
sudo scripts/setup/set-up-environment.sh
```

#### - Hostname configuration: sudo host

If you type `sudo` in the terminal and get the error message `sudo: unable to resolve host` it means there is an issue with the system's hostname configuration. To fix it:

1. Verify the current hostname of your system (for NewtCAM is `imx8mm-var-dart`):

```shell
hostname
```

2. Check if it exists on the /etc/hosts file:

```shell
nano /etc/hosts
```

3. Update Hostname (if necessary):

(For NewtCam) Add `imx8mm-var-dart` after `localhost`

### 2. Installing Motion

**Motion** is a configurable software that monitors video signals from different types of cameras and create videos and/or saves pictures of the activity. Motion is installed from the release deb files which provides a more recent version than the one available via apt.
The most recent versions can be downloaded here [Motion releases](https://github.com/Motion-Project/motion/releases).

**Raspberry Pi** (Architecture: armhf-pi / OS: bullseye)

> pi_bullseye_motion_x.x.x-x_armhf.deb

**Variscite NewtCam** (Architecture: arm64/ OS: bullseye)

> bullseye_motion_x.x.x-x_arm64.deb

After determining the deb file name appropriate for our distribution and platform we open up a terminal window and type (example for the RPi - Motion 4.5.1-1):

```bash
wget https://github.com/Motion-Project/motion/releases/download/release-4.5.1/pi_bullseye_motion_4.5.1-1_armhf.deb
```

Next, install the retrieved deb package. The gdebi tool will automatically retrieve any dependency packages.

```bash
sudo apt-get install gdebi-core
sudo gdebi pi_bullseye_motion_4.5.1-1_armhf.deb
```

#### - Configuring Motion

1. Open Motion service file: `sudo nano /lib/systemd/system/motion.service`
2. Add the argument to the following line, with `<device-type>` being either `DiMON` or `NewtCAM`:

```
ExecStart=/usr/bin/motion -c /home/app4cam/app4cam-backend/motion/config/<device-type>/motion.conf
```

3. Reload systemd: `sudo systemctl daemon-reload`
4. Add `motion` user to `app4cam` user group so that they can change the motion config file: `sudo useradd –G app4cam motion`
5. If you use auto-deployment, add motion service start and stop scripts: `sudo /home/app4cam/app4cam-backend/scripts/setup/create-motion-scripts.sh`

The configuration are described in detail at https://motion-project.github.io/4.5.0/motion_config.html.

#### - Running Motion as service

Motion needs to be run as a service so that it automatically starts whenever the device is started.

1. Enable service: `sudo systemctl enable motion`
2. Start service: `sudo systemctl start motion`
3. Verify that the service is running: `sudo systemctl status motion`

During development, you may need to stop Motion: `sudo systemctl stop motion`

#### - "libcamerify" Motion

libcamerify is needed for libcamera support (used with the newer RPi cameras). In these specific cases we need to
libcamerify Motion as suggested [here](https://forum.arducam.com/t/getting-an-arducam-imx519-16mp-autofocus-working-with-motion/4248).

1. Make sure libcamera-tools are installed `sudo apt install libcamera-tools`

2. Modify the motion service `sudo nano /lib/systemd/system/motion.service` changing the ExecStart line to  
   `ExecStart=libcamerify /usr/bin/motion`

3. Save and close. Follow with:  
   `sudo systemctl daemon-reload`  
   `sudo systemctl start motion.service`

**IMPORTANT:** When using pivariety cameras (e.g. 64MP Hawkeye) do not update libcamera.

### 3. Setting up network behavior

#### - On Raspberry Pi

We want to configure the Raspberry Pi in a way that it will **connect to a previously configured Wifi** network when the Pi is in range of the router (Laboratory conditions) or **Automatically setup a Raspberry Pi access point** when a known wifi network is not in range (Field conditions). For this purpose we will use the script **Autohotspot** developed by RaspberryConnect.com.  
On a new terminal, run the setup script with root privileges:

```bash
sudo scripts/setup/raspberry-pi/autohotspot/autohotspot-setup.sh
```

You will be presented with these options:

```bash
 1 = Install Autohotspot with eth0 access for Connected Devices
 2 = Install Autohotspot with No eth0 for connected devices
 3 = Install a Permanent Access Point with eth0 access for connected devices
 4 = Uninstall Autohotspot or permanent access point
 5 = Add a new wifi network to the Pi (SSID) or update the password for an existing one.
 6 = Autohotspot: Force to an access point or connect to WiFi network if a known SSID is in range
 7 = Change the access points SSID and password
 8 = Exit
```

We should go for **Option 2: Install Autohotspot with No eth0 for connected devices.**

Once installed and after a reboot the Raspberry Pi will connect to a router that has previously been connected to and is listed in `/etc/wpa_supplicant/wpa_supplicant.conf`. If no router is in range then it will generate a WiFi access point. The Pi can use the eth0 connection and also be accessed from a device on the etho network.  
The default SSID of **App4Cam** and password of **0123456789** will be used.
Once a connection to the access point has been made you can access the Raspberry Pi via ssh & VNC.

```bash
ssh pi@10.0.0.5
vnc: 10.0.0.5::5900
```

If no error messages was presented, just exit the script and reboot your device. The "network behavior" should be well configured.

#### - On Variscite

1. Run **with root privileges** the script: `/home/app4cam/app4cam-backend/scripts/setup/variscite/setup-access-point.sh`
2. Verify that the connection is running: `nmcli connection show`
3. Check the Wi-Fi's broadcast IP address: `ifconfig`

### 4. Installing ExifTool

ExifTool is needed to add the device ID to the metadata of each shot file.

1. Download latest version from [website](https://exiftool.org/): `wget <download-url>`
2. Unpack the distribution file: `gzip -dc Image-ExifTool-<latest-number>.tar.gz | tar -xf -`
3. Change into directory: `cd Image-ExifTool-<latest-number>`
4. Prepare make file: `perl Makefile.PL`
5. Optionally, run tests to verify system compatibility: `make test`
6. Install for all users: `sudo make install`

### 5. Enabling user services and USB auto-mounting

Execute the setup script with root permissions:

```shell
sudo scripts/setup/set-up-user-services.sh
```

#### - Checking USB auto-mounting

Only perform this checks if you have enabled this functionality in the setup script before.

1. Make sure that there is no udev rule configured for USB auto-mounting. The OS images of Variscite devices may come with a preconfigured rule in `/etc/udev/rules.d/automount.rules` that needs to be commented out.
2. Log in as user: `su - app4cam`
3. Verify that the service is running: `systemctl --user status udiskie`
4. Logout: `exit`

### 6. Make sure automatic time synchronisaton is disabled

Verify the result line `NTP service` of running: `timedatectl`

If it is still active, run: `timedatectl set-ntp 0`

### 7. Installing Witty Pi 3 (Raspberry Pi only)

**Witty Pi** is a realtime clock (RTC) and power management **board** added to the Raspberry Pi. It also allows to define ON/OFF sequences.
On Raspberry Pi, run these two commands in your home directory:

```bash
wget http://www.uugear.com/repo/WittyPi3/install.sh
sudo sh install.sh
```

A more extensive tutorial can be found at https://www.uugear.com/product/witty-pi-3-realtime-clock-and-power-management-for-raspberry-pi/.

### 8. Adding FTP access (Raspberry Pi only)

The FTP access can be used as an alternative way to download multiple files without the need to archive files.

1. Install FTP server: `sudo apt install vsftpd`
2. Modify the configuration: `sudo nano /etc/vsftpd.conf`

   Make sure the following settings are present, i.e. uncommented or added:

   ```
   anonymous_enable=NO
   local_enable=YES
   local_umask=022
   chroot_local_user=YES
   user_sub_token=$USER
   local_root=/home/app4cam/data
   allow_writeable_chroot=YES
   ```

3. Restart the server: `sudo systemctl restart vsftpd`

Now, you can connect via an FTP client with the device's IP address, port 21, the username created and the corresponding password.

### 9. Hardware Configuration (Quimesis interface board only)

To get a complete overview of the hardware available please read the wiki [variscite-guide](https://git.list.lu/host/mechatronics/app4cam-frontend/-/wikis/variscite-guide).

- **WiFi Control** - Follow the local guide available here [WiFi Control](https://git.list.lu/host/mechatronics/app4cam-backend/-/blob/main/scripts/runtime/variscite/wi-fi-control/README.md).
- **Battery Monitoring** - Follow the local guide available here [Battery Monitoring](https://git.list.lu/host/mechatronics/app4cam-backend/-/blob/main/scripts/runtime/variscite/battery-monitoring/README.md).
- **RTC control** - Follow the local guide available here [RTC control](https://git.list.lu/host/mechatronics/app4cam-backend/-/blob/main/scripts/runtime/variscite/rtc/README.md).
- **Hardware initialisation** - Follow the local guide available here [Hardware initialization](https://git.list.lu/host/mechatronics/app4cam-backend/-/blob/main/scripts/runtime/variscite/hardware-initialisation/README.md).

### 10. Deploying the application

Before starting, install the following dependency: `sudo apt install gpiod`

#### Option 1: Download the artifact archive from Gitlab:

1. Download and extract the archive into the home folder.
2. Change into the directory: `cd app4cam-backend`
3. Install the production dependencies: `npm ci --omit=dev --ignore-scripts`

#### Option 2: Build it yourself:

1. Make sure Git is installed.
2. Clone this repository into the home folder: `git clone --single-branch --branch main https://git.list.lu/host/mechatronics/app4cam-backend.git`
3. Change into the directory: `cd app4cam-backend`
4. Install dependencies: `npm ci`
5. Build: `npm run build`
6. Set a configuration file. For instance, use the sample file: `cp config/sample.env config/production.env`

#### Final steps

1. Adapt the configuration file if needed: `nano config/production.env`
2. Start service: `systemctl --user start app4cam-backend`
3. Verify the service is running: `systemctl --user status app4cam-backend`

You can check the service logs with the following command: `journalctl --user -u app4cam-backend -e`

### 11. For continuous deployment (CD) only

If you have set up the frontend already, you can just follow its [setup guide](https://git.list.lu/host/mechatronics/app4cam-frontend#3-for-continuous-deployment-cd-only).

## Release procedure

1. Run the following script with the real version number in a Git Bash:

   ```shell
   scripts/release/release-version.sh "<version-number>"
   ```

2. Push the pre-version commit to the remote repository once it should be shared:

   ```shell
   git push
   ```
