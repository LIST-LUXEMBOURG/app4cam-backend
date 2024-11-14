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
PASSWORD='app4cam'

NODE_VERSION='22'

# Determine device type.
echo 'Specify the device type by specifying the number:'
echo '[1] Raspberry Pi'
echo '[2] Variscite'
read -r device_type
if [ "$device_type" = '1' ]
then
  echo 'Raspberry Pi selected'
elif [ "$device_type" = '2' ]
then
  echo 'Variscite seleted'
else
  echo 'Invalid device type selected. Please restart the script!'
  exit 1
fi

# Make sure to have Node.js installed in the right version.
if ! command -v node &> /dev/null || node -v != v"$NODE_VERSION"*
then
  apt install curl -y
  curl -fsSL https://deb.nodesource.com/setup_"$NODE_VERSION".x -o nodesource_setup.sh
  bash nodesource_setup.sh
  apt install nodejs -y
fi

# Install more packages needed.
apt install gpiod jq -y

# Create the new user if it does not exist already.
if id "$USERNAME" >/dev/null 2>&1; then
  echo "The user $USERNAME exists already."
else
  useradd -m -s /bin/bash -p "$(openssl passwd -6 $PASSWORD)" "$USERNAME"
fi

# Allow the new user and the motion user to execute some commands as sudo.
JOURNALCTL_PATH="$(type -p journalctl)"
echo "$USERNAME ALL=(ALL) NOPASSWD: $JOURNALCTL_PATH" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/timedatectl" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/v4l2-ctl" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/use-triggering-leds.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "motion ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/use-recording-leds.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "motion ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/use-triggering-leds.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'

if [ "$device_type" = '1' ]
then
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/raspberry-pi/working-hours/create-working-hours-schedule.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/raspberry-pi/working-hours/remove-working-hours-schedule.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/raspberry-pi/get-input-voltage.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/raspberry-pi/set-camera-focus.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/raspberry-pi/write-system-time-to-rtc.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
elif [ "$device_type" = '2' ]
then
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/variscite/access-point/change-access-point-name-or-password.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/variscite/access-point/get-access-point-password.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/variscite/battery-monitoring/battery_monitoring" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/variscite/rtc/set_time" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/runtime/variscite/rtc/sleep_until" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
fi

# Create data and folder.
mkdir "/home/$USERNAME/data"

# Attribute new folder to new user and group.
chown "$USERNAME":"$USERNAME" "/home/$USERNAME/data"

# Give new user group write access to new folder.
chmod g+w "/home/$USERNAME/data"

# Add motion user to new user group.
usermod -a -G "$USERNAME" motion
