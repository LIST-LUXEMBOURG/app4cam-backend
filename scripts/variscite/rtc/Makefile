
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
