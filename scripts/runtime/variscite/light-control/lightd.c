/**
 * Copyright (C) 2022-2026  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
#include <gpiod.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <errno.h>
#include <signal.h>

#define CHIP_NAME     "gpiochip4"
#define LINE_VISIBLE  3
#define LINE_IR       24
#define CONSUMER      "app4cam-lightd"
#define SOCKET_PATH   "/run/app4cam/lightd.sock"

enum light_mode {
    LIGHT_VISIBLE,
    LIGHT_INFRARED
};

static struct gpiod_chip *chip = NULL;
static struct gpiod_line *line_visible = NULL;
static struct gpiod_line *line_ir = NULL;
static enum light_mode current_mode = LIGHT_VISIBLE;
static int server_fd = -1;

static void cleanup(void)
{
    if (server_fd >= 0) {
        close(server_fd);
        unlink(SOCKET_PATH);
    }
    if (line_visible)
        gpiod_line_release(line_visible);
    if (line_ir)
        gpiod_line_release(line_ir);
    if (chip)
        gpiod_chip_close(chip);
}

static void handle_signal(int sig)
{
    (void)sig;
    cleanup();
    exit(0);
}

static int gpio_init(void)
{
    chip = gpiod_chip_open_by_name(CHIP_NAME);
    if (!chip) {
        perror("gpiod_chip_open_by_name");
        return -1;
    }

    line_visible = gpiod_chip_get_line(chip, LINE_VISIBLE);
    line_ir      = gpiod_chip_get_line(chip, LINE_IR);

    if (!line_visible || !line_ir) {
        perror("gpiod_chip_get_line");
        return -1;
    }

    if (gpiod_line_request_output(line_visible, CONSUMER, 0) < 0) {
        perror("gpiod_line_request_output visible");
        return -1;
    }

    if (gpiod_line_request_output(line_ir, CONSUMER, 0) < 0) {
        perror("gpiod_line_request_output infrared");
        return -1;
    }

    /* Default: visible ON, infrared OFF */
    if (gpiod_line_set_value(line_visible, 1) < 0) {
        perror("gpiod_line_set_value visible");
        return -1;
    }
    if (gpiod_line_set_value(line_ir, 0) < 0) {
        perror("gpiod_line_set_value infrared");
        return -1;
    }

    current_mode = LIGHT_VISIBLE;
    return 0;
}

static int set_mode(enum light_mode mode)
{
    if (mode == LIGHT_VISIBLE) {
        if (gpiod_line_set_value(line_visible, 1) < 0) {
            perror("gpiod_line_set_value visible");
            return -1;
        }
        if (gpiod_line_set_value(line_ir, 0) < 0) {
            perror("gpiod_line_set_value infrared");
            return -1;
        }
    } else {
        if (gpiod_line_set_value(line_visible, 0) < 0) {
            perror("gpiod_line_set_value visible");
            return -1;
        }
        if (gpiod_line_set_value(line_ir, 1) < 0) {
            perror("gpiod_line_set_value infrared");
            return -1;
        }
    }

    current_mode = mode;
    return 0;
}

static int setup_socket(void)
{
    struct sockaddr_un addr;

    unlink(SOCKET_PATH);

    server_fd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket");
        return -1;
    }

    memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;
    strncpy(addr.sun_path, SOCKET_PATH, sizeof(addr.sun_path) - 1);

    if (bind(server_fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind");
        return -1;
    }

    if (listen(server_fd, 5) < 0) {
        perror("listen");
        return -1;
    }

    return 0;
}

static void handle_client(int client_fd)
{
    char buf[64];
    ssize_t n = read(client_fd, buf, sizeof(buf) - 1);
    if (n <= 0)
        return;

    buf[n] = '\0';

    if (strncmp(buf, "GET", 3) == 0) {
        if (current_mode == LIGHT_VISIBLE)
            write(client_fd, "visible\n", 8);
        else
            write(client_fd, "infrared\n", 9);
    } else if (strncmp(buf, "SET", 3) == 0) {
        if (strstr(buf, "visible")) {
            if (set_mode(LIGHT_VISIBLE) == 0)
                write(client_fd, "OK\n", 3);
            else
                write(client_fd, "ERR\n", 4);
        } else if (strstr(buf, "infrared")) {
            if (set_mode(LIGHT_INFRARED) == 0)
                write(client_fd, "OK\n", 3);
            else
                write(client_fd, "ERR\n", 4);
        } else {
            write(client_fd, "ERR\n", 4);
        }
    } else {
        write(client_fd, "ERR\n", 4);
    }
}

int main(void)
{
    signal(SIGINT, handle_signal);
    signal(SIGTERM, handle_signal);

    if (gpio_init() < 0) {
        cleanup();
        return 1;
    }

    if (setup_socket() < 0) {
        cleanup();
        return 1;
    }

    printf("lightd: listening on %s\n", SOCKET_PATH);

    for (;;) {
        int client_fd = accept(server_fd, NULL, NULL);
        if (client_fd < 0) {
            if (errno == EINTR)
                continue;
            perror("accept");
            break;
        }
        handle_client(client_fd);
        close(client_fd);
    }

    cleanup();
    return 0;
}
