# Define the compiler and the compiler flags
CC = gcc
CFLAGS = -Wall -Wextra -O2

# Define the target executable
TARGET = read_air_temp

# Define the source files
SRCS = read_air_temp.c

# Define the object files
OBJS = $(SRCS:.c=.o)

# Default target to build the executable
all: $(TARGET)

# Rule to build the target executable
$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)

# Rule to build the object files
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Clean up the build files
clean:
	rm -f $(TARGET) $(OBJS)

# Phony targets
.PHONY: all clean

