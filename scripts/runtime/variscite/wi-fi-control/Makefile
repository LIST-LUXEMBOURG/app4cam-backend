# © 2024 Luxembourg Institute of Science and Technology
PROJ=wifi_control
CNS=App4Cam-backend
CC=cc
SRC=main.c
LIBS=-lgpiod
CFLAGS=-D CONSUMER=\"$(CNS)\"

all:
	$(CC) $(SRC) $(LIBS) $(CFLAGS) -o $(PROJ)

clean:
	rm $(PROJ)
