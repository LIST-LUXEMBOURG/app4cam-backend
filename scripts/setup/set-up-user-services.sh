#!/bin/bash
# Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
#
# App4Cam is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# App4Cam is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.

USERNAME='app4cam'

cat << EOF
/------------------------/
/ Enabling user services /
/------------------------/
EOF

# Enable user service logging.
# shellcheck disable=SC2016
sed -i -e '/^#\?\(\s*Storage\s*=\s*\).*/{s//\1persistent/;:a;n;ba;q}' -e '$aStorage=persistent' /etc/systemd/journald.conf

# Restart journald service.
systemctl restart systemd-journald

# Enable user lingering.
loginctl enable-linger "$USERNAME"

# Create directories for user services.
su "$USERNAME" -c 'mkdir -p ~/.config/systemd/user/'

cat << EOF
/------------------------------/
/ Setting up USB auto-mounting /
/------------------------------/
EOF

echo 'Do you want to set up USB auto-mounting? Type y or yes if you agree.'
read -r usb_auto_mounting
if [ "$usb_auto_mounting" = 'y' ] || [ "$usb_auto_mounting" = 'yes' ]; then
  echo 'Setting up USB auto-mounting...'

  apt install curl udisks2 udiskie -y

  # Enable permissions for udisks2 in polkit.
  tee /etc/polkit-1/localauthority/50-local.d/10-udiskie.pkla << EOL
[udisks2]
Identity=unix-group:$USERNAME
Action=org.freedesktop.udisks2.*
ResultAny=yes
EOL

  # Mount the drives to /media directly.
  tee /etc/udev/rules.d/99-udisks2.rules << "EOL"
# UDISKS_FILESYSTEM_SHARED
# ==1: mount filesystem to a shared directory (/media/VolumeName)
# ==0: mount filesystem to a private directory (/run/media/$USER/VolumeName)
# See udisks(8)
ENV{ID_FS_USAGE}=="filesystem|other|crypto", ENV{UDISKS_FILESYSTEM_SHARED}="1"
# Additionally allowed mount options:
ENV{UDISKS_MOUNT_OPTIONS_ALLOW}="errors"
EOL

  # Clean stale mountpoints at every boot.
  echo 'D /media 0755 root root 0 -' > /etc/tmpfiles.d/media.conf

  # Create config file for udiskie.
  su "$USERNAME" -c 'mkdir -p ~/.config/udiskie'
  su "$USERNAME" -c 'touch ~/.config/udiskie/config.yml'
  tee /home/"$USERNAME"/.config/udiskie/config.yml << "EOL"
device_config:
- options: [umask=0,errors=continue]
EOL

  # Create user service.
  su "$USERNAME" -c 'touch ~/.config/systemd/user/udiskie.service'
  tee /home/"$USERNAME"/.config/systemd/user/udiskie.service << EOL
[Unit]
Description=Handle automounting of usb devices
StartLimitIntervalSec=0

[Service]
Type=simple
ExecStart=/usr/bin/udiskie -N -f '' --notify-command "/home/$USERNAME/app4cam-backend/scripts/runtime/update-shots-folder.sh '{event}' '{mount_path}'"
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOL

  # Reload systemctl.
  su "$USERNAME" -c 'systemctl --user daemon-reload'

  # Enable service.
  su "$USERNAME" -c 'systemctl --user enable udiskie'

  # Start service.
  su "$USERNAME" -c 'systemctl --user start udiskie'
else
  echo 'Skipped USB auto-mounting setup.'
fi

cat << EOF
/------------------------------------/
/ Setting up App4Cam backend service /
/------------------------------------/
EOF

# Create user service.
su "$USERNAME" -c 'touch ~/.config/systemd/user/app4cam-backend.service'
tee /home/"$USERNAME"/.config/systemd/user/app4cam-backend.service << EOL
[Unit]
Description=Service that keeps running app4cam-backend from startup
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Environment="NODE_ENV=production"
ExecStart=node dist/main
WorkingDirectory=/home/$USERNAME/app4cam-backend
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOL

# Reload systemctl.
su "$USERNAME" -c 'systemctl --user daemon-reload'

# Enable service.
su "$USERNAME" -c 'systemctl --user enable app4cam-backend'

cat << EOF
/-----------------------------------------/
/ Making sure environment variable is set /
/-----------------------------------------/
EOF

if [[ -z $(su - "$USERNAME" -c 'printenv XDG_RUNTIME_DIR') ]]; then
  echo 'The environment variable XDG_RUNTIME_DIR is undefined. Adding it to the profile file...'
  # shellcheck disable=SC2016
  echo 'export XDG_RUNTIME_DIR=/run/user/`id -u`' >> /home/"$USERNAME"/.profile
  echo 'Added to the profile file. All good!'
else
  echo 'The environment variable XDG_RUNTIME_DIR is set. All good!'
fi
