#include <gpiod.h>
#include <stdio.h>
#include <signal.h>
#include <unistd.h>
#include <time.h>

#ifndef	CONSUMER
#define	CONSUMER	"Consumer"
#endif

#define button_timeout_s 5

int main(int argc, char **argv)
{
	char *but_chipname = "gpiochip0";
	char *led_chipname = "gpiochip3";

	unsigned int but_line_num = 0;		// GPIO Pin #0
	unsigned int led_line_num = 17; 	// GPIO Pin #17

	int pushed = 0, error;

	struct timespec ts = {5, 0};
	time_t time0, time1;
	struct gpiod_line_event event;
	struct gpiod_chip *but_chip;
	struct gpiod_chip *led_chip;
	struct gpiod_line *but_line;
	struct gpiod_line *led_line;

	signal(SIGINT, SIG_DFL);
	time(&time0); 

	but_chip = gpiod_chip_open_by_name(but_chipname);
	if (!but_chip)
	{
		perror("Open BUTTON chip failed\n");
		goto end;
	}
	but_line = gpiod_chip_get_line(but_chip, but_line_num);
	if (!but_line)
	{
		perror("Get BUTTON line failed\n");
		goto close_chip;
	}
	error = gpiod_line_request_rising_edge_events(but_line, CONSUMER);
	if (error < 0)
	{
		perror("Request event notification on BUTTON line failed\n");
		error = -1;
		goto release_line;
	}

	led_chip = gpiod_chip_open_by_name(led_chipname);
	if (!led_chip)
	{
		perror("Open LED chip failed\n");
		goto end;
	}
	led_line = gpiod_chip_get_line(led_chip, led_line_num);
	if (!led_line)	
	{
		perror("Get LED line failed\n");
		goto close_chip;
	}
	if (gpiod_line_request_output(led_line, CONSUMER, gpiod_line_get_value(led_line)) < 0)
	{
		perror("Request LED line as output failed\n");
		goto release_line;
	}

	while (1)
	{
		error = gpiod_line_event_wait(but_line, &ts);
		if (error < 0)
		{
			perror("Wait event notification failed\n");
			goto release_line;
		}
		else if (error == 0)
		{
			printf("Wait event notification on line #%u timeout\n", but_line_num);
			continue;
		}

		error = gpiod_line_event_read(but_line, &event);
		if (error < 0)
		{
			perror("Read last event notification failed\n");
			goto release_line;
		}

		pushed = (pushed + 1) % 2;
		printf("Get event notification on line #%u %d\n", but_line_num, pushed);

		if (!pushed)
			continue;
		else
		{
			time(&time1);
			if (difftime(time1, time0) > button_timeout_s)
			{
				time(&time0);
				if (gpiod_line_get_value(led_line) == 0)
				{
					printf("Turninng WiFi ON\n");
					system("nmcli radio wifi on");
				}
				else
				{
					printf("Turninng WiFi OFF\n");
					system("nmcli radio wifi off");
				}

				error = gpiod_line_set_value(led_line, !gpiod_line_get_value(led_line));		
				if (error < 0)
				{
					perror("Set line output failed\n");
					goto release_line;
				}
			}
		}
	}

release_line:
	gpiod_line_release(but_line);
	gpiod_line_release(led_line);
close_chip:
	gpiod_chip_close(but_chip);
	gpiod_chip_close(led_chip);

end:
	return -1;
}
