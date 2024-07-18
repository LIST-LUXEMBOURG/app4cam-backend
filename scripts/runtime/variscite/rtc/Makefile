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

PROJ=rtc
CNS=App4Cam-backend
CC=cc
LINK=-I/home/app4cam/rtc
CFLAGS=-O -D CONSUMER=\"$(CNS)\"

all: set_time get_time sleep_until

set_time: mcp7940.c set_time.c
	$(CC) $(LINK) mcp7940.c set_time.c $(CFLAGS) -o set_time

get_time: mcp7940.c get_time.c
	$(CC) $(LINK) mcp7940.c get_time.c $(CFLAGS) -o get_time

sleep_until: mcp7940.c sleep_until.c
	$(CC) $(LINK) mcp7940.c sleep_until.c $(CFLAGS) -o sleep_until

clean:
	rm $(PROJ)
