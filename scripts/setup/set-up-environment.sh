#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

USERNAME='app4cam'
PASSWORD='app4cam'

MINIMUM_NODE_VERSION='18'

# Turn echo on.
set -x

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

# Make sure to have Node.js installed in version >= 18.x.
if ! command -v node &> /dev/null || node -v != v"$MINIMUM_NODE_VERSION"* 
then
  sudo apt install curl -y
  curl -sL https://deb.nodesource.com/setup_"$MINIMUM_NODE_VERSION".x | sudo bash -
  sudo apt install nodejs -y
fi

# Install more packages needed.
sudo apt install gpiod -y

# Create the new user if it does not exist already.
if id "$USERNAME" >/dev/null 2>&1; then
  echo "The user $USERNAME exists already."
else
  sudo useradd -m -s /bin/bash -p "$(openssl passwd -6 $PASSWORD)" "$USERNAME"
fi

# Allow the new user and the motion user to execute some commands as sudo.
echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/timedatectl" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/use-triggering-leds.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "motion ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/use-recording-leds.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "motion ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/use-triggering-leds.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'

if [ "$device_type" = '1' ]
then
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/raspberry-pi/create-working-hours-schedule.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/raspberry-pi/get-input-voltage.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/raspberry-pi/remove-working-hours-schedule.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/raspberry-pi/set-camera-focus.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/raspberry-pi/write-system-time-to-rtc.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/v4l2-ctl" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
elif [ "$device_type" = '2' ]
then
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/variscite/access-point/change-access-point-name-or-password.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/variscite/access-point/get-access-point-password.sh" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/variscite/battery-monitoring/battery_monitoring" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/variscite/rtc/set_time" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
  echo "$USERNAME ALL=(ALL) NOPASSWD: /home/$USERNAME/app4cam-backend/scripts/variscite/rtc/sleep_until" | sudo su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
fi

# Create data and motion log folders.
sudo mkdir "/home/$USERNAME/data" "/home/$USERNAME/motion"

# Attribute new folders to new user and group.
sudo chown "$USERNAME":"$USERNAME" "/home/$USERNAME/data" "/home/$USERNAME/motion"

# Give new user group write access to new folders.
sudo chmod g+w "/home/$USERNAME/data" "/home/$USERNAME/motion"

# Add motion user to new user group.
sudo usermod -a -G "$USERNAME" motion
