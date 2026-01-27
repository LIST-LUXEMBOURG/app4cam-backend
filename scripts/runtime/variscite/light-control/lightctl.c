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
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>

#define SOCKET_PATH "/run/app4cam/lightd.sock"

static int send_command(const char *cmd)
{
    int fd = socket(AF_UNIX, SOCK_STREAM, 0);
    if (fd < 0) {
        perror("socket");
        return 1;
    }

    struct sockaddr_un addr;
    memset(&addr, 0, sizeof(addr));
    addr.sun_family = AF_UNIX;
    strncpy(addr.sun_path, SOCKET_PATH, sizeof(addr.sun_path) - 1);

    if (connect(fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("connect");
        close(fd);
        return 1;
    }

    if (write(fd, cmd, strlen(cmd)) < 0) {
        perror("write");
        close(fd);
        return 1;
    }

    char buf[64];
    ssize_t n = read(fd, buf, sizeof(buf) - 1);
    if (n > 0) {
        buf[n] = '\0';
        fputs(buf, stdout);
    }

    close(fd);
    return 0;
}

int main(int argc, char *argv[])
{
    if (argc == 2 && strcmp(argv[1], "get") == 0) {
        return send_command("GET\n");
    } else if (argc == 3 && strcmp(argv[1], "set") == 0) {
        if (strcmp(argv[2], "visible") == 0) {
            return send_command("SET visible\n");
        } else if (strcmp(argv[2], "infrared") == 0) {
            return send_command("SET infrared\n");
        } else {
            fprintf(stderr, "Invalid mode: %s (expected 'visible' or 'infrared')\n", argv[2]);
            return 1;
        }
    }

    fprintf(stderr, "Usage:\n");
    fprintf(stderr, "  %s get\n", argv[0]);
    fprintf(stderr, "  %s set <visible|infrared>\n", argv[0]);
    return 1;
}
