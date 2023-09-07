# App4Cam Backend

## Development

### Prerequisites

- \>= Node.js 18.x

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

### API documentation

An OpenAPI Specification (OAS) is available under `/api`.

## Deployment

This software requires the following tools to be installed:

- **Motion** is a configurable software that monitors video signals from differen types of cameras and create videos and/or saves pictures of the activity.
- **Witty Pi** is a realtime clock (RTC) and power management **board** added to the Raspberry Pi. It also allows to define ON/OFF sequences.

### Prerequisites

- `curl`
- `gpiod`
- \>= Node.js 18.x

### 1. Creating user and adding permissions

If you have not already during frontend setup, you will create a new user. The username `app4cam` will be used in the following.

1. Create a new user, with a password you remember: `sudo adduser app4cam`
2. Allow the new user to use some commands as sudo by adding the following content to the newly created file: `sudo visudo -f /etc/sudoers.d/app4cam`

   ```
   app4cam ALL=(ALL) NOPASSWD: /usr/bin/timedatectl
   app4cam ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/switch-off-recording-leds.sh
   motion ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/switch-on-recording-leds.sh
   motion ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/switch-off-recording-leds.sh
   ```

3. On **Raspberry Pi**, also add the following line:

   ```
   app4cam ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/raspberry-pi-write-system-time-to-rtc.sh
   ```

4. On **Variscite**, also add the following line:

   ```
   app4cam ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/variscite/access-point/change-access-point-name.sh
   app4cam ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/variscite/go-to-sleep.sh
   ```

### 2. Setting up Motion

#### 2.1. Installing Motion

Motion is installed from the release deb files which provided a more recent version than the one available via apt.
The most recent versions can be downloaded here https://github.com/Motion-Project/motion/releases/

**Raspberry Pi** (armhf-pi architecture)

> https://github.com/Motion-Project/motion/releases/download/release-4.5.0/pi_bullseye_motion_4.5.0-1_armhf.deb

**Variscite MX8** (arm64 architecture)

> https://github.com/Motion-Project/motion/releases/download/release-4.5.1/bullseye_motion_4.5.1-1_arm64.deb

**Variscite MX6** (armhf architecture)

> https://github.com/Motion-Project/motion/releases/download/release-4.5.1/bullseye_motion_4.5.1-1_armhf.deb

After determining the deb file name appropriate for our distribution and platform we open up a terminal window and type (example for the RPi):

```bash
wget https://github.com/Motion-Project/motion/releases/download/release-4.5.0/pi_bullseye_motion_4.5.0-1_armhf.deb
```

Next, install the retrieved deb package. The gdebi tool will automatically retrieve any dependency packages.

```bash
sudo apt-get install gdebi-core
sudo gdebi pi_bullseye_motion_4.5.0-1_armhf.deb
```

#### 2.2. Creating data folder and setting permissions

1. Add `motion` user to `app4cam` group: `sudo usermod -a -G app4cam motion`
2. Log in as `app4cam` user: `su - app4cam`
3. Create directories: `mkdir -p app4cam/data`
4. Give `app4cam` group write access to folder: `chmod -R g+w /home/app4cam/app4cam`
5. Logout: `exit`

#### 2.3. Configuring Motion

1. Open Motion config file: `sudo nano /etc/motion/motion.conf`
2. Configure the following parameters in order of appearance:

   On Raspberry Pi (for the Raspberry camera):

   ```
   mmalcam_name vc.ril.camera

   mmalcam_control_params -ex auto

   on_event_end sudo /home/app4cam/app4cam-backend/scripts/switch-off-recording-leds.sh RaspberryPi

   on_motion_detected sudo /home/app4cam/app4cam-backend/scripts/switch-on-recording-leds.sh RaspberryPi
   ```

   On Variscite (enable led ilumination):

   ```
   on_event_end sudo /home/app4cam/app4cam-backend/scripts/switch-off-recording-leds.sh Variscite

   on_motion_detected sudo /home/app4cam/app4cam-backend/scripts/switch-on-recording-leds.sh Variscite
   ```

   On all devices:

   ```
   daemon off

   setup_mode off

   log_file /home/app4cam/app4cam/motion.log

   log_level 5

   target_dir /home/app4cam/app4cam/data/

   event_gap 2

   pre_capture 5

   on_picture_save /home/app4cam/app4cam-backend/scripts/write-device-id-to-jpg-file.sh %f

   on_movie_end /home/app4cam/app4cam-backend/scripts/write-device-id-to-mp4-file.sh %f

   picture_output best

   picture_quality 80

   picture_filename %Y%m%dT%H%M%S_%q

   movie_output on

   movie_max_time 60

   movie_quality 80

   movie_codex mp4

   movie_filename %Y%m%dT%H%M%S

   webcontrol_localhost on

   webcontrol_parms 2

   stream_localhost on

   snapshot_filename %Y%m%dT%H%M%S_snapshot
   ```

   Make sure to adapt the height and width to the maximum resolution your camera supports, for example:

   ```
   width 1920

   height 1080
   ```

   USB camera settings (disable auto-focus, fix focus value, fix brigthness value):

   ```
   video_params "Focus, Auto"=0, "Focus (absolute)"=350, Brightness=16
   ```

   For development:

   ```
   stream_port 8081
   ```

3. Comment out the `text_left` property with a semicolon.
4. Save the config file.
5. Change the ownership of the configuration file: `sudo chown motion:motion /etc/motion/motion.conf`
6. On the **Raspberry Pi** make sure `start_motion_daemon = yes` is set in `/etc/default/motion` file.

A more described configuration can be found at https://motion-project.github.io/4.5.0/motion_config.html.

#### 2.4. Running Motion as service

Motion needs to be run as a service so that it automatically starts whenever the device is started.

1. Enable service: `sudo systemctl enable motion`
2. Start service: `sudo systemctl start motion`
3. Verify that the service is running: `sudo systemctl status motion`

During development, you may need to stop Motion: `sudo systemctl stop motion`

### 3. Installing Witty Pi 3 (Raspberry Pi only)

On Raspberry Pi, run these two commands in your home directory:

```bash
wget http://www.uugear.com/repo/WittyPi3/install.sh
sudo sh install.sh
```

A more extensive tutorial can be found at https://www.uugear.com/product/witty-pi-3-realtime-clock-and-power-management-for-raspberry-pi/.

### 4. Setting up network behavior

#### On Raspberry Pi

We want to configure the Raspberry Pi in a way that it will **connect to a previously configured Wifi** network when the Pi is in range of the router (Laboratory conditions) or **Automatically setup a Raspberry Pi access point** when a known wifi network is not in range (Field conditions). For this purpose we will use the script **Autohotspot** developed by RaspberryConnect.com.  
For this we just need to run with root privileges the script `scripts/autohotspot/autohotspot-setup.sh`. On a new terminal:

```bash
# Run the script with root privileges.
sudo scripts/autohotspot/autohotspot-setup.sh
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

#### On Variscite

1. Run **with root privileges** the script: `/home/app4cam/app4cam-backend/scripts/variscite/access-point/setup-access-point.sh`
2. Verify that the connection is running: `nmcli connection show`
3. Check the Wi-Fi's broadcast IP address: `ifconfig`

### 5. Installing ExifTool

ExifTool is needed to add the device ID to the metadata of each shot file.

1. Download latest version from [website](https://exiftool.org/): `wget <download-url>`
2. Unpack the distribution file: `gzip -dc Image-ExifTool-<latest-number>.tar.gz | tar -xf -`
3. Change into directory: `cd Image-ExifTool-<latest-number>`
4. Prepare make file: `perl Makefile.PL`
5. Optionally, run tests to verify system compatibility: `make test`
6. Install for all users: `sudo make install`

### 6. Enabling user services

1. Open `journald` config file: `sudo nano /etc/systemd/journald.conf`
2. Enable user service logging by setting `Storage=persistent`, and save file.
3. Restart `journald` service: `sudo systemctl restart systemd-journald`
4. Log in as user: `su - app4cam`
5. Enable user lingering: `loginctl enable-linger app4cam`
6. Create directories: `mkdir -p ~/.config/systemd/user/`
7. Logout: `exit`

### 7. Enabling USB auto-mounting

1. Install `udisks2`: `sudo apt install udisks2`
2. Install `udiskie`: `sudo apt install udiskie -y`
3. Enable permissions for udisks2 in polkit by creating file with the following content: `sudo nano /etc/polkit-1/localauthority/50-local.d/10-udiskie.pkla`

   ```
   [udisks2]
   Identity=unix-group:app4cam
   Action=org.freedesktop.udisks2.*
   ResultAny=yes
   ```

4. Mount the drives to `/media` directly by creating file with the following content: `sudo nano /etc/udev/rules.d/99-udisks2.rules`

   ```
   # UDISKS_FILESYSTEM_SHARED
   # ==1: mount filesystem to a shared directory (/media/VolumeName)
   # ==0: mount filesystem to a private directory (/run/media/$USER/VolumeName)
   # See udisks(8)
   ENV{ID_FS_USAGE}=="filesystem|other|crypto", ENV{UDISKS_FILESYSTEM_SHARED}="1"
   # Additionally allowed mount options:
   ENV{UDISKS_MOUNT_OPTIONS_ALLOW}="errors"
   ```

5. Clean stale mountpoints at every boot by creating file with the following content: `sudo nano /etc/tmpfiles.d/media.conf`

   ```
   D /media 0755 root root 0 -
   ```

6. Log in as user: `su - app4cam`
7. `mkdir .config/udiskie`
8. `nano .config/udiskie/config.yml`

   ```
   device_config:
   - options: [umask=0,errors=continue]
   ```

9. Create user service with the following content: `nano ~/.config/systemd/user/udiskie.service`

   ```
   [Unit]
   Description=Handle automounting of usb devices
   StartLimitIntervalSec=0

   [Service]
   Type=simple
   ExecStart=/usr/bin/udiskie -N -f '' --notify-command "/home/app4cam/app4cam-backend/scripts/update-shots-folder.sh '{event}' '{mount_path}'"
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=default.target
   ```

10. Reload systemctl: `systemctl --user daemon-reload`
11. Enable service: `systemctl --user enable udiskie`
12. Start service: `systemctl --user start udiskie`
13. Verify that the service is running: `systemctl --user status udiskie`
14. Logout: `exit`

### 8. Make sure automatic time synchronisaton is disabled

Verify the result line `NTP service` of running: `timedatectl`

If it is still active, run: `timedatectl set-ntp 0`

### 9. Deploying the application

Before starting, install the following dependency: `sudo apt install gpiod`

#### 1. Creating a user service

1. Log in as user: `su - app4cam`
2. Make sure that the following environmental variable is set: `printenv XDG_RUNTIME_DIR`
3. If not, let it be set on each login by adding the following line: `nano ~/.profile`

   ```
   export XDG_RUNTIME_DIR=/run/user/`id -u`
   ```

4. Create user service with the following content: `nano ~/.config/systemd/user/app4cam-backend.service`

   ```
   [Unit]
   Description=Service that keeps running app4cam-backend from startup
   After=network.target
   StartLimitIntervalSec=0

   [Service]
   Type=simple
   Environment="NODE_ENV=production"
   ExecStart=node dist/main
   WorkingDirectory=/home/app4cam/app4cam-backend
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=default.target
   ```

5. Reload systemctl: `systemctl --user daemon-reload`
6. Enable service: `systemctl --user enable app4cam-backend`

#### 2. Getting application

###### Option 1: Download the artifact archive from Gitlab:

1. Download and extract the archive into the home folder.
2. Change into the directory: `cd app4cam-backend`
3. Install the production dependencies: `npm ci --omit=dev --ignore-scripts`

###### Option 2: Build it yourself:

1. Make sure Git is installed.
2. Clone this repository into the home folder: `git clone --single-branch --branch main https://git.list.lu/host/mechatronics/app4cam-backend.git`
3. Change into the directory: `cd app4cam-backend`
4. Install dependencies: `npm ci`
5. Build: `npm run build`
6. Set a configuration file. For instance, use the sample file: `cp config/sample.env config/production.env`

#### 3. Final steps

1. Adapt the configuration file if needed: `nano config/production.env`
2. Start service: `systemctl --user start app4cam-backend`
3. Verify the service is running: `systemctl --user status app4cam-backend`

You can check the service logs with the following command: `journalctl --user -u app4cam-backend -e`

### 10. For continuous deployment (CD) only

If you have set up the frontend already, you just need to do step 4.

1. Log in as user: `su - app4cam`
2. Generate a public/private key pair without passphrase: `ssh-keygen -t ed25519`
3. Copy public key to authorized keys file: `cp .ssh/id_ed25519.pub .ssh/authorized_keys`
4. Define the following variables in Gitlab:

   - `RASPBERRY_PI_HOST`: IP address of Raspberry Pi
   - `RASPBERRY_PI_PRIVATE_KEY`: private key of Raspberry Pi user
   - `RASPBERRY_PI_USER`: user of Raspberry Pi
   - `VARISCITE_MX6_HOST`: IP address of Variscite MX6
   - `VARISCITE_MX6_PRIVATE_KEY`: private key of Variscite MX6 user
   - `VARISCITE_MX8M_HOST`: IP address of Variscite MX8M
   - `VARISCITE_MX8M_PRIVATE_KEY`: private key of Variscite MX8M user
   - `VARISCITE_USER`: user of Variscite devices

5. Delete private key file: `rm .ssh/id_ed25519`
6. Remove all "group" and "other" permissions for the `.ssh` directory: `chmod -R go= ~/.ssh`
7. Logout: `exit`
8. Open SSH config file: `sudo nano /etc/ssh/sshd_config`
9. Disable password authentication by setting `PasswordAuthentication no`.
10. Prepend the following line: `Match User app4cam`
11. Append the following line: `Match all`
12. Restart `sshd` service: `sudo systemctl restart ssh`
13. Install rsync: `sudo apt install rsync -y`

### 11. Adding FTP access (Raspberry Pi only)

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
   local_root=/home/app4cam/app4cam
   allow_writeable_chroot=YES
   ```

3. Restart the server: `sudo systemctl restart vsftpd`

Now, you can connect via an FTP client with the device's IP address, port 21, the username created and the corresponding password.
