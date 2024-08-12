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

mkdir /root/motion

# Add service start and stop scripts.
tee /root/motion/start-motion-service.sh << EOL
#!/bin/bash
systemctl start motion
EOL
tee /root/motion/stop-motion-service.sh << EOL
#!/bin/bash
systemctl stop motion
EOL

# Make scripts executable.
chmod +x /root/motion/start-motion-service.sh
chmod +x /root/motion/stop-motion-service.sh

# Allow the new user to execute them as sudo.
echo "$USERNAME ALL=(ALL) NOPASSWD: /root/motion/start-motion-service.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
echo "$USERNAME ALL=(ALL) NOPASSWD: /root/motion/stop-motion-service.sh" | su -c 'EDITOR="tee -a" visudo -f /etc/sudoers.d/app4cam'
