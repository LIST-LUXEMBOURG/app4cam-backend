#!/bin/bash
# Copyright (C) 2024  Luxembourg Institute of Science and Technology
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

# Make sure that Apache2 binary exists.
if ! command -v apache2 > /dev/null 2>&1; then
    echo "Error: Apache2 is not installed or not in PATH. Please see the frontend project for installation details." >&2
    exit 1
fi

# Enable proxy and proxy http modules.
a2enmod proxy
a2enmod proxy_http

# Add configuration lines.
sed -i '/<\/VirtualHost>/i \\t\tProxyPass /api http://localhost:3000\n\t\tProxyPassReverse /api http://localhost:3000' /etc/apache2/sites-available/default-ssl.conf

# Restart Apache.
systemctl restart apache2
