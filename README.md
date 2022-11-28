# App4Cam Backend

## Prerequisites

- Git
- \>= Node.js 16.x

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

### API documentation

An OpenAPI Specification (OAS) is available under `/api`.

## Deployment

This software requires the following tools to be installed:

- **Motion** is a configurable software that monitors video signals from differen types of cameras and create videos and/or saves pictures of the activity.
- **Witty Pi** is a realtime clock (RTC) and power management **board** added to the Raspberry Pi. It also allows to define ON/OFF sequences.

### 1. Setting up Motion

#### 1.1. Installing Motion

Motion is installed from the release deb files which provided a more recent version than the one available via apt.
The version installed is the 4.4.0-1.

> https://github.com/Motion-Project/motion/releases/download/release-4.4.0/pi_buster_motion_4.4.0-1_armhf.deb

> https://github.com/Motion-Project/motion/releases/download/release-4.4.0/bullseye_motion_4.4.0-1_arm64.deb (variscite)

After determining the deb file name appropriate for our distribution and platform we open up a terminal window and type (example for the RPi):

```bash
wget https://github.com/Motion-Project/motion/releases/download/release-4.4.0/pi_buster_motion_4.4.0-1_armhf.deb
```

Next, install the retrieved deb package. The gdebi tool will automatically retrieve any dependency packages.

```bash
sudo apt-get install gdebi-core
sudo gdebi pi_buster_motion_4.4.0-1_armhf.deb
```

#### 1.2. Creating user and data folder and setting permissions

1. If you have not already during frontend setup, create a new user, `app4cam` e.g., with a password you remember: `sudo adduser <user>`
2. Allow new user to use some commands as sudo by adding the following content to the newly created file: `sudo visudo -f /etc/sudoers.d/app4cam`

   ```
   <user> ALL=(ALL) NOPASSWD: /usr/bin/timedatectl
   ```

3. On Raspberry Pi, add the following line:

   ```
   <user> ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/raspberry-pi-write-system-time-to-rtc.sh
   ```

4. On Variscite, add the following line:

   ```
   app4cam ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/variscite/initialise-leds.sh
   motion ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/variscite/switch-ir-to-visible-leds.sh
   motion ALL=(ALL) NOPASSWD: /home/app4cam/app4cam-backend/scripts/variscite/switch-visible-to-ir-leds.sh
   ```

5. Add `motion` user to `<user>` group: `sudo usermod -a -G <user> motion`
6. Log in as user: `su - <user>`
7. Create directories: `mkdir -p app4cam/data`
8. Give `<user>` group write access to folder: `chmod -R 775 /home/app4cam/app4cam`
9. Logout: `exit`

#### 1.3. Configuring Motion

1. Open Motion config file: `sudo nano /etc/motion/motion.conf`
2. In order of appearance, the following parameters which are configured differently:

   On Raspberry Pi:

   ```bash
   daemon on

   mmalcam_name vc.ril.camera

   mmalcam_control_params -ex auto

   locate_motion_mode on

   locate_motion_style redbox

   event_gap 2

   on_event_end sudo /home/app4cam/app4cam-backend/scripts/variscite/switch-visible-to-ir-leds.sh

   on_motion_detected sudo /home/app4cam/app4cam-backend/scripts/variscite/switch-ir-to-visible-leds.sh
   ```

   On Variscite:

   ```bash
   daemon off

   event_gap 5
   ```

   On both:

   ```bash
   setup_mode off

   log_file /home/<user>/app4cam/motion.log

   log_level 5

   target_dir /home/<user>/app4cam/data/

   width 1920

   height 1080

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

   webcontrol_parms 1

   stream_localhost on

   snapshot_filename %Y%m%dT%H%M%S_snapshot
   ```

   For development:

   ```
   stream_port 8081
   ```

3. Comment out the `text_left` property with a semicolon.
4. Save the config file.
5. Change the ownership of the configuration file: `sudo chown motion:motion /etc/motion/motion.conf`
6. On Raspberry Pi, make sure `start_motion_daemon = yes` is set in `/etc/default/motion` file.

A more described configuration can be found at https://motion-project.github.io/4.4.0/motion_config.html.

#### 1.4. Running Motion as service

Motion should be set up to run as a service, which means that it will start automatically whenever the device is started.
This should be done only after all the standard configuration has been completed.
As a service Motion uses the systemctl and option daemon must be set to `on`

Next enable motion by entering the following at the command line: `sudo systemctl enable motion`

The following commands now control the Motion service.

- Start the Motion `sudo systemctl start motion`
- Stop the Motion `sudo systemctl stop motion`

**Make sure to start the Motion service.**

### 2. Installing Witty Pi 3

Run these two commands on your Raspberry Pi:

```bash
wget http://www.uugear.com/repo/WittyPi3/install.sh
sudo sh install.sh
```

A more extensive tutorial can be found at https://www.uugear.com/product/witty-pi-3-realtime-clock-and-power-management-for-raspberry-pi/.

### 3. Setting up RPi network behavior

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

### 4. Installing ExifTool

ExifTool is needed to add the device ID to the metadata of each shot file.

1. Download latest version from [website](https://exiftool.org/): `wget <download-url>`
2. Unpack the distribution file: `gzip -dc Image-ExifTool-<latest-number>.tar.gz | tar -xf -`
3. Change into directory: `cd Image-ExifTool-<latest-number>`
4. Prepare make file: `perl Makefile.PL`
5. Optionally, run tests to verify system compatibility: `make test`
6. Install for all users: `sudo make install`

### 5. Creating a user service

1. Open `journald` config file: `sudo nano /etc/systemd/journald.conf`
2. Enable user service logging by setting `Storage=persistent`, and save file.
3. Restart `journald` service: `sudo systemctl restart systemd-journald`
4. Log in as user: `su - <user>`
5. Enable user lingering: `loginctl enable-linger <user>`
6. Create directories: `mkdir -p ~/.config/systemd/user/`
7. Create user service with the following content: `nano ~/.config/systemd/user/app4cam-backend.service`

   ```
   [Unit]
   Description=Service that keeps running app4cam-backend from startup
   After=network.target

   [Install]
   WantedBy=default.target

   [Service]
   Type=simple
   Environment="NODE_ENV=production"
   ExecStart=node dist/main
   WorkingDirectory=/home/<user>/app4cam-backend
   Restart=always
   RestartSec=5
   ```

8. Reload systemctl: `systemctl --user daemon-reload`
9. Enable service: `systemctl --user enable app4cam-backend`

If the last two commands result in `Failed to connect to bus: No such file or directory`, check as user: `printenv XDG_RUNTIME_DIR`.
If it is empty, set the environment variable at the beginning of the same lines:

```
XDG_RUNTIME_DIR=/run/user/`id -u`
```

### 6. Deploying the application

First, log in as user: `su - <user>`

#### Option 1: Download the artifact archive from Gitlab:

1. Download and extract the archive into the home folder.
2. Change into the directory: `cd app4cam-backend`
3. Install the production dependencies: `npm ci --omit=dev --ignore-scripts`

#### Option 2: Build it yourself:

1. Clone this repository into the home folder: `git clone --single-branch --branch main https://git.list.lu/host/mechatronics/app4cam-backend.git`
2. Change into the directory: `cd app4cam-backend`
3. Install dependencies: `npm ci`
4. Build: `npm run build`
5. Set a configuration file. For instance, use the sample file: `cp config/sample.env config/production.env`

#### Final steps

1. Adapt the configuration file if needed: `nano config/production.env`
2. Start service: `systemctl --user start app4cam-backend`
3. Verify the service is running: `systemctl --user status app4cam-backend`

### 7. For continuous deployment (CD) only

If you have set up the frontend already, you just need to do step 4.

1. Log in as user: `su - <user>`
2. Generate a public/private key pair without passphrase: `ssh-keygen -t ed25519`
3. Copy public key to `.ssh/authorized_keys` file.
4. Define the following variables in Gitlab:

   - `RASPBERRY_PI_HOST`: IP address of Raspberry Pi
   - `RASPBERRY_PI_PRIVATE_KEY`: private key of Raspberry Pi user
   - `RASPBERRY_PI_USER`: user of Raspberry Pi
   - `VARISCITE_HOST`: IP address of Variscite
   - `VARISCITE_PRIVATE_KEY`: private key of Variscite user
   - `VARISCITE_USER`: user of Variscite

5. Delete private key file: `rm .ssh/id_ed25519`
6. Remove all "group" and "other" permissions for the `.ssh` directory: `chmod -R go= ~/.ssh`
7. Logout: `exit`
8. Open SSH config file: `sudo nano /etc/ssh/sshd_config`
9. Disable password authentication by setting `PasswordAuthentication no`, and save file.
10. Prepend the following line: `Match User <user>`
11. Append the following line: `Match all`
12. Restart `sshd` service: `sudo systemctl restart ssh`
13. Install rsync: `sudo apt install rsync -y`

### 8. Adding FTP access

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
