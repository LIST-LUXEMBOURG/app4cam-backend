# App4Cam Backend

## Prerequisites

- Git
- \>= Node.js 14.x

## Development

### Setup

1. Run: `npm install`
2. Copy config file `config/sample.env` to `config/development.env`.
3. Edit the latter config file as needed.

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

## Deployment

This software requires the following tools to be installed:

- **Motion** is a configurable software that monitors video signals from differen types of cameras and create videos and/or saves pictures of the activity.
- **Witty Pi** is a realtime clock (RTC) and power management **board** added to the Raspberry Pi. It also allows to define ON/OFF sequences.

### 1.1 Installing Motion

Motion is installed from the release deb files which provided a more recent version than the one available via apt.
The version installed is the 4.3.2-1.

> https://github.com/Motion-Project/motion/releases/download/release-4.3.2/pi_buster_motion_4.3.2-1_armhf.deb

After determining the deb file name appropriate for our distribution and platform we open up a terminal window and type:

```bash
wget https://github.com/Motion-Project/motion/releases/download/release-4.3.2/pi_buster_motion_4.3.2-1_armhf.deb
```

Next, install the retrieved deb package. The gdebi tool will automatically retrieve any dependency packages.

```bash
sudo apt-get install gdebi-core
sudo gdebi pi_buster_motion_4.3.2-1_armhf.deb
```

### 1.2 Configuring Motion

After successfull installation, we need to configure motion according to our specifications. This configuration assumes a local folder available at Pi's Desktop, which is typically named as the project. It is referenced on the configuration as `{project_folder}`.  
The default configuration file should be located at:

> /etc/motion/motion.conf

In order of appearence the parameters which are configured differently are:

```bash
# Start in daemon (background) mode and release terminal.
daemon on

# Start in Setup-Mode, daemon disabled.
setup_mode off

# File to write logs messages into.  If not defined stderr and syslog is used.
log_file /home/pi/Desktop/{project_folder}/motion.log

# Level of log messages [1..9] (EMG, ALR, CRT, ERR, WRN, NTC, INF, DBG, ALL).
log_level 4

# Target directory for pictures, snapshots and movies
target_dir /home/pi/Desktop/{project_folder}/data/

# Name of mmal camera (e.g. vc.ril.camera for pi camera).
mmalcam_name vc.ril.camera

# Camera control parameters (see raspivid/raspistill tool documentation)
mmalcam_control_params -ex auto
locate_motion_mode on
locate_motion_style redbox

# Image width in pixels.
width 1920

# Image height in pixels.
height 1080

# Gap in seconds of no motion detected that triggers the end of an event.
event_gap 2

# The number of pre-captured (buffered) pictures from before motion.
pre_capture 5

# Output pictures when motion is detected
picture_output best

# File name(without extension) for pictures relative to target directory
picture_filename _%Y%m%dT%H%M%S-%q

# Create movies of motion events.
movie_output on

# Maximum length of movie in seconds.
movie_max_time 60

# File name(without extension) for movies relative to target directory
movie_filename _%Y%m%dT%H%M%S

# Restrict webcontrol connections to the localhost.
webcontrol_localhost off

# Type of configuration options to allow via the webcontrol.
webcontrol_parms 1

# Restrict stream connections to the localhost.
stream_localhost off
```

A more described configuration can be found at https://motion-project.github.io/motion_config.html.

### 1.3 Creating local folder

In order for Motion to run successfully the `{project_folder}` configured before must exist on the device, and to have the right permissions.

First thing is to just create at `/home/pi/Desktop` a new folder and name it after the project. Then you should allow motion ("motion user" created by the service)
to change it's content.  
This can be done by right clicking on the folder and going to tab permissions. Then set to `Anyone` view and change permissions.

### 1.4 Adapting permissions

1. Change the ownership of the target folder to pi: `sudo chown pi /home/pi/Desktop/{project_folder}/data`
2. Give write permissions to motion group: `sudo chmod 775 /home/pi/Desktop/{project_folder}/data`
3. Change the ownership of the configuration file: `sudo chown motion:motion /etc/motion/motion.conf`

### 1.5 Running Motion as service

Motion should be set up to run as a service, which means that it will start automatically whenever the raspberry is started.
This should be done only after all the standard configuration has been completed.
As a service Motion uses the systemctl and option daemon must be set to `on`

Next enable motion by entering the following at the command line: `sudo systemctl enable motion`  
The following commands now control the Motion service.

- Start the Motion `sudo service motion start`
- Stop the Motion `sudo service motion stop`

**Make sure to start the Motion service.**

### 2.1 Installing Witty Pi 3

Run these two commands on your Raspberry Pi:

```bash
wget http://www.uugear.com/repo/WittyPi3/install.sh
sudo sh install.sh
```

A more extensive tutorial can be found at https://www.uugear.com/product/witty-pi-3-realtime-clock-and-power-management-for-raspberry-pi/.

### 3.1 Setting up RPi network behavior

We want to configure the Raspberry Pi in a way that it will **connect to a previously configured Wifi** network when the Pi is in range of the router (Laboratory conditions) or **Automatically setup a Raspberry Pi access point** when a known wifi network is not in range (Field conditions). For this purpose we will use the script **Autohotspot** developed by RaspberryConnect.com.  
For this we just need to run with root privileges the script `scripts/autohotspot-setup.sh`. On a new terminal:

```bash
# Mark the script as executable.
sudo chmod +x scripts/autohotspot-setup.sh

# Run the script with root privileges.
sudo scripts/autohotspot-setup.sh
```

You will presented with a menu with these options:

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
This will have an SSID of **App4Cam** and password of **0123456789**.
Once a connection to the access point has been made you can access the Raspberry Pi via ssh & VNC.

```bash
ssh pi@10.0.0.5
vnc: 10.0.0.5::5900
```

If no error messages was presented, just exit the script and reboot your device. The "network behavior" should be well configured.

### Creating a service

1. Create the app4cam-backend service by creating the following file: `/etc/systemd/system/app4cam-backend.service`

```
[Unit]
Description=Service that keeps running app4cam-backend from startup
After=network.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
ExecStart=npm run start:prod
WorkingDirectory=/home/pi/app4cam-backend
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=%n
```

2. Run: `sudo systemctl daemon-reload`
3. Run: `sudo systemctl enable app4cam-backend`

### Final steps

1. If you want to deploy via Gitlab automtically in the future, execute once the following command: `ssh-keyscan -t ed25519 git.list.lu >> ~/.ssh/known_hosts`
2. See final necessary commands sent via SSH to server in `.gitlab-ci.yml`.
