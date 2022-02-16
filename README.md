# PolliCAM Backend

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

- Motion is a configurable software that monitors video signals from differen types of cameras and create videos and/or saves pictures of the activity.
- Witty Pi is a realtime clock (RTC) and power management board added to the Raspberry Pi. It also allows to define ON/OFF sequences.

### Installing Motion

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

### Configuring Motion

After successfull installation, we need to configure motion according to our specifications. This configuration assumes a public folder available at Pi's Desktop, which is typically named as the project. The default configuration file should be located at:

> /etc/motion/motion.conf

In order of appearence the parameters which are configured differently are:

```bash
# Start in daemon (background) mode and release terminal.
daemon on

# File to write logs messages into.  If not defined stderr and syslog is used.
log_file /home/pi/Desktop/{project_folder}/motion.log

# Target directory for pictures, snapshots and movies
target_dir /home/pi/Desktop/{project_folder}

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
picture_filename %Y_%m_%d_{device_name}/%Y%m%d%H%M%S-%q

# Create movies of motion events.
movie_output on

# Maximum length of movie in seconds.
movie_max_time 60

# File name(without extension) for movies relative to target directory
movie_filename %Y_%m_%{device_name}/%t-%v-%Y%m%d%H%M%S
```

A more described configuration can be found at https://motion-project.github.io/motion_config.html.

### Installing Witty Pi 3

Run these two commands on your Raspberry Pi:

```bash
wget http://www.uugear.com/repo/WittyPi3/install.sh
sudo sh install.sh
```

A more extensive tutorial can be found at https://www.uugear.com/product/witty-pi-3-realtime-clock-and-power-management-for-raspberry-pi/.

### Creating a service

1. Create the pollicam-backend service by creating the following file: `/etc/systemd/system/pollicam-backend.service`

```
[Unit]
Description=Service that keeps running pollicam-backend from startup
After=network.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
ExecStart=npm run start:prod
WorkingDirectory=/home/pi/pollicam-backend
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=%n
```

2. Run: `sudo systemctl daemon-reload`

### Final steps

1. If you want to deploy via Gitlab automtically in the future, execute once the following command: `ssh-keyscan -t ed25519 git.list.lu >> ~/.ssh/known_hosts`
2. See final necessary commands sent via SSH to server in `.gitlab-ci.yml`.
