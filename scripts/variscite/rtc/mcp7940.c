// © 2024 Luxembourg Institute of Science and Technology
#include "mcp7940.h"

#define I2C_BUS_NAME "/dev/i2c-2"

const char dict_day[7][4] = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
const char dict_month[12][4] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

/*!
    @brief     Open i2c bus
 */
int init_i2c_bus(void)
{
    int i2c_fd;
    if ((i2c_fd = open(I2C_BUS_NAME, O_RDWR)) < 0)
    {
        perror("Failed to open the i2c bus.");
        return -1;
    }

    return i2c_fd;
}

/*!
    @brief     Close i2c bus
    @param[in] i2c_fd   i2c file descriptor
*/
void i2c_close(int i2c_fd)
{
    close(i2c_fd);
}

/*!
    @brief     write a single byte to a register
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] slave_addr MCP7940 device address
    @param[in] reg      Register to write
    @param[in] value    value (0-255) to be writen
    @return    0 for "ok" and 1 for "error"
*/
uint8_t i2c_write(int i2c_fd, uint8_t slave_addr, uint8_t reg, uint8_t value)
{
    uint8_t outbuf[2];
    struct i2c_msg msgs[1];
    struct i2c_rdwr_ioctl_data msgset[1];

    outbuf[0] = reg;
    outbuf[1] = value;

    msgs[0].addr = slave_addr;
    msgs[0].flags = 0;
    msgs[0].len = 2;
    msgs[0].buf = outbuf;

    msgset[0].msgs = msgs;
    msgset[0].nmsgs = 1;

    if (ioctl(i2c_fd, I2C_RDWR, &msgset) < 0)
    {
        perror("ioctl(I2C_RDWR) in i2c_write");
        return 1;
    }

    return 0;
}

/*!
    @brief     Read the given I2C slave device's n (size) registers
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] slave_addr MCP7940 device address
    @param[in] reg      Register to write
    @param[in] value    value (0-255) to be writen
    @return    Read value is in *array; 0 for "ok" and 1 for "error"
*/
uint8_t i2c_read(int i2c_fd, uint8_t slave_addr, uint8_t reg, uint8_t size, uint8_t *array)
{
    uint8_t outbuf[1];
    struct i2c_msg msgs[2];
    struct i2c_rdwr_ioctl_data msgset[1];

    msgs[0].addr = slave_addr;
    msgs[0].flags = 0;
    msgs[0].len = 1;
    msgs[0].buf = outbuf;

    msgs[1].addr = slave_addr;
    msgs[1].flags = I2C_M_RD | I2C_M_NOSTART;
    msgs[1].len = size;
    msgs[1].buf = array;

    msgset[0].msgs = msgs;
    msgset[0].nmsgs = 2;

    outbuf[0] = reg;
    array[0] = 0;

    if (ioctl(i2c_fd, I2C_RDWR, &msgset) < 0)
    {
        perror("ioctl(I2C_RDWR) in i2c_read");
        return 1;
    }

    return 0;
}

/*!
    @brief     read a specific bit from a register
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] reg      Register to read from
    @param[in] b        Bit (0-7) to be read
    @return    0 for "false" and 1 for "true"
*/
uint8_t read_register_bit(int i2c_fd, uint8_t slave_addr, uint8_t reg, uint8_t b)
{
    uint8_t read_buffer[1];

    i2c_read(i2c_fd, slave_addr, reg, 1, read_buffer);

    return ((read_buffer[0] >> b) & 1);
}

/*!
    @brief     sets a specified bit in a register on the device
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] reg Register to write to
    @param[in] b   Bit (0-7) to set
*/
uint8_t set_register_bit(int i2c_fd, uint8_t slave_addr, uint8_t reg, uint8_t b)
{
    uint8_t read_buffer[1], value;

    i2c_read(i2c_fd, slave_addr, reg, 1, read_buffer);
    value = read_buffer[0] | (1 << b);

    return i2c_write(i2c_fd, MCP7940_ADDRESS, reg, value);
}

/*!
    @brief     clears a specified bit in a register on the device
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] slave_addr MCP7940 device address
    @param[in] reg Register to write to
    @param[in] b   Bit (0-7) to clear
 */
uint8_t clear_register_bit(int i2c_fd, uint8_t slave_addr, uint8_t reg, uint8_t b)
{
    uint8_t read_buffer[1], value;

    i2c_read(i2c_fd, slave_addr, reg, 1, read_buffer);
    value = read_buffer[0] & ~(1 << b);

    return i2c_write(i2c_fd, MCP7940_ADDRESS, reg, value);
}

/*!
    @brief     converts a BCD encoded value into number representation
    @param[in] bcd Binary-Encoded-Decimal value
    @return    integer representation of BCD value
*/
uint8_t bcd2int(uint8_t bcd)
{
    return ((bcd / 16 * 10) + (bcd % 16));
}

/*!
    @brief     converts an integer to a BCD encoded value
    @param[in] dec Integer value
    @return    BCD representation
*/
uint8_t int2bcd(uint8_t dec)
{
    return ((dec / 10 * 16) + (dec % 10));
}

/*!
    @brief   set the RTC weekday number
    @details This number is user-settable and is incremented when the day shifts. The library uses
    1 for Monday and 7 for Sunday
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] dow Day of week (1-7)
    @return    Values 1-7 for the day set, returns MCP7940 value if "dow" is out of range
*/
uint8_t weekday_write(int i2c_fd, uint8_t slave_addr, int dow)
{
    uint8_t value, readBuffer[1];

    i2c_read(i2c_fd, slave_addr, MCP7940_RTCWKDAY, 1, readBuffer);
    value = (readBuffer[0] & 0b11111000) | dow;

    return i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCWKDAY, value);
}

/*!
    @brief  Start the MCP7940 device
    @details Sets the status register to turn on the device clock
    @param[in] i2c_fd   i2c open file descriptor
    @return Success status true if successful otherwise false
*/
uint8_t device_start(int i2c_fd)
{
    uint8_t oscillator_status = 0;

    set_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCSEC, MCP7940_ST); // set the ST bit.

    for (uint8_t j = 0; j < 255; j++) // Loop until changed or overflow
    {
        oscillator_status =
            read_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCWKDAY, MCP7940_OSCRUN); // Wait for oscillator to start
        if (oscillator_status)
            break; // Exit loop on success
        sleep(1);  // Allow oscillator time to start
    }

    return oscillator_status;
}

/*!
    @brief  Stops the MCP7940 device
    @details Sets the status register to turn off the device clock
    @param[in] i2c_fd   i2c open file descriptor
    @return true if the oscillator is still running, otherwise 0 if the oscillator has stopped
*/
uint8_t device_stop(int i2c_fd)
{
    uint8_t oscillator_status = 0;

    clear_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCSEC, MCP7940_ST); // clear the ST bit.

    for (uint8_t j = 0; j < 255; j++)
    {
        oscillator_status =
            read_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCWKDAY, MCP7940_OSCRUN); // Wait for oscillator to stop
        if (!oscillator_status)
            break;
        sleep(1); // Allow oscillator time to stop
    }             // of for-next oscillator loop

    return oscillator_status;
}

/*!
    @brief  Start the MCP7940 device
    @details Sets the status register to turn on the device clock
    @param[in] i2c_fd   i2c open file descriptor
    @return Success status true if successful otherwise false
*/
uint8_t MCP7940_deviceStart(int i2c_fd)
{
    return device_start(i2c_fd);
}

/*!
    @brief  checks to see if the MCP7940 crystal has been turned on or off
    @brief  Sets the status register to turn on the device clock
    @param[in] i2c_fd   i2c open file descriptor
    @return Success status true if the crystal is on, otherwise false if off
*/
uint8_t MCP7940_deviceStatus(int i2c_fd)
{
    return read_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCSEC, MCP7940_ST);
}

/*!
    @brief     Enable or disable the battery backup
    @details   Has no effect on the MCP7940M, only on the MCP7940N
    @return    0 "ok" 1 for error
*/
uint8_t MCP7940_enable_battery(int i2c_fd)
{
    return set_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCWKDAY, MCP7940_VBATEN);
}

/*!
    @brief   sets the current date/time (overloaded)
    @details This is an overloaded function. With no parameters then the RTC is set to the
    date/time when the program was compiled. Since different core version handle these compiler
    variables differently, the values are copied to temporary strings and then passed to the
    adjust() function
    @param[in] i2c_fd   i2c open file descriptor
*/
void MCP7940_adjust(int i2c_fd, struct tm date_time)
{
    device_stop(i2c_fd);

    i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCSEC, int2bcd(date_time.tm_sec));
    i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCMIN, int2bcd(date_time.tm_min));
    i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCHOUR, int2bcd(date_time.tm_hour));
    weekday_write(i2c_fd, MCP7940_ADDRESS, date_time.tm_wday);
    i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCDATE, int2bcd(date_time.tm_mday));
    i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCMTH, int2bcd(date_time.tm_mon));
    i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCYEAR, date_time.tm_year - 100);

    device_start(i2c_fd);
}

/*!
    @brief   prints the current date/time
    @details If the device is stopped then the stop time is returned
    @param[in] i2c_fd   i2c open file descriptor
*/
void MCP7940_now(int i2c_fd)
{
    uint8_t size = 7, out_buffer[150], *read_buffer;

    read_buffer = (uint8_t *)malloc(size * sizeof(uint8_t));

    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCSEC, size, read_buffer);

    sprintf(out_buffer, "%s %02d %s %4d %02d:%02d:%02d \n",
            dict_day[bcd2int((read_buffer[3] & 0x7)) - 1],  // Day of the week
            bcd2int(read_buffer[4] & 0x3F),                 // Day of the month
            dict_month[bcd2int(read_buffer[5] & 0x1F)],    // Month
            bcd2int(read_buffer[6]) + 2000,                 // Year
            bcd2int(read_buffer[2] & 0x3F),                 // Hours
            bcd2int(read_buffer[1] & 0x7F),                 // Minutes
            bcd2int(read_buffer[0] & 0x7F));                // Seconds
    printf("%s", out_buffer);
}

/*!
    @brief   Calibrate the MCP7940 (overloaded)
    @details When called with one int8 parameter that value is used as the new trim value
    @param[in] newTrim New signed integer value to use for the trim register
    @return  Returns the input "newTrim" value
*/
uint8_t MCP7940_calibrate(int i2c_fd, int8_t new_trim)
{
    int8_t trim = abs(new_trim);

    if (new_trim < 0)
        trim = 0x80 | trim; // set non-excess 128 negative val

    clear_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_CONTROL, MCP7940_CRSTRIM);

    return i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_OSCTRIM, trim);
}

/*!
    @brief   Turns an alarm on or off without changing the alarm condition
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] alarm_number Alarm number 0 or 1
    @param[in] state State to the set the alarm to
    @return False if the alarm_number is out of range, otherwise true
*/
uint8_t set_alarm_state(int i2c_fd, uint8_t alarm_number, uint8_t state)
{
    if (alarm_number > 1)
        return 1;
    if (state)
        set_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_CONTROL, alarm_number ? MCP7940_ALM1EN : MCP7940_ALM0EN);
    else
        clear_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_CONTROL, alarm_number ? MCP7940_ALM1EN : MCP7940_ALM0EN);

    return 0;
}

/*!
    @brief   Gets the MFP (Multifunction Pin) value
    @details On is true and Off is false. This is read from the control register if no alarms are
    enabled, otherwise the two alarm states must be checked.
    @param[in] i2c_fd   i2c open file descriptor
    @return  Returns one of the following values;\n
                0 = pin set LOW.\n
                1 = pin set HIGH.\n
                2 = pin controlled by alarms.\n
                3 = pin controlled by square wave output.\n
*/
uint8_t MCP7940_get_MFP(int i2c_fd)
{
    uint8_t control_register[1];
    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_CONTROL, 1, control_register);

    if (control_register[0] & (1 << MCP7940_SQWEN))
        return 3;
    else if ((control_register[0] & (1 << MCP7940_ALM0EN)) ||
             (control_register[0] & (1 << MCP7940_ALM1EN)))
        return 2;

    return ((control_register[0] >> MCP7940_OUT) & 1);
}

/*!
    @brief   Clears the given alarm
    @param[in] alarm_number Alarm number 0 or 1
    @return False if the alarmNumber is out of range, otherwise true
*/
uint8_t MCP7940_clear_alarm(int i2c_fd, uint8_t alarm_number)
{
    if (alarm_number > 1)
        return 1;
    return clear_register_bit(i2c_fd, MCP7940_ADDRESS,
                              alarm_number ? MCP7940_ALM1WKDAY : MCP7940_ALM0WKDAY,
                              MCP7940_ALM0IF);
}

/*!
    @brief   Sets the alarm polarity
    @details Alarm polarity (see also TABLE 5-10 on p.27 of the datasheet). Note: the MFP pin is
    open collector, it needs an external pull-up resistor.\n If only one alarm is set:\n polarity =
    0: MFP high when no alarm, low when alarm.\n polarity = 1: MFP low when no alarm, high when
    alarm.\n\n If both alarms are set:\n polarity = 0: MFP high when no alarm or one alarm, low
    when both alarms go off.\n polarity = 1: MFP low when no alarm, high when eihter or both alarms
    go off.\n\n In most situations you will want to set polarity to 1 if you have two alarms set,
    to be able to see when an alarm goes off using the MFP pin.
    @param[in] i2c_fd   i2c open file descriptor
    @param[in] polarity value (0 or 1) for polarity
*/
uint8_t MCP7940_set_alarm_polarity(int i2c_fd, uint8_t polarity)
{
    uint8_t error;

    if (polarity)
        error = set_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0WKDAY, MCP7940_ALMPOL);
    else
        error = clear_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0WKDAY, MCP7940_ALMPOL);

    return error;
}

/*!
    @brief   Sets one of the 2 alarms
    @details In order to configure the alarm modules, the following steps need to be performed in
    order:\n
            1. Load the timekeeping registers and enable the oscillator\n
            2. Configure the ALMxMSK<2:0> bits to select the desired alarm mask\n
            3. Set or clear the ALMPOL bit according to the desired output polarity\n
            4. Ensure the ALMxIF flag is cleared\n
            5. Based on the selected alarm mask, load the alarm match value into the appropriate
    register(s)\n
            6. Enable the alarm module by setting the ALMxEN bit\n
            There are two ALMPOL bits - one in the ALM0WKDAY register which can be written, one
    in the ALM1WKDAY register which is read-only and reflects the value of the ALMPOL in ALM0WKDAY.
    @param[in] alarm_number Alarm 0 or Alarm 1
    @param[in] alarm_type   Alarm type from 0 to 7, see detailed description
    @param[in] dt          DateTime alarm value used to set the alarm
    @param[in] state       Alarm state to set to (0 for "off" and 1 for "on")
    @return  Returns 0 for success otherwise 1
*/
uint8_t MCP7940_set_alarm(int i2c_fd, uint8_t alarm_number, uint8_t alarm_type, struct tm dt, uint8_t state)
{
    uint8_t offset, wkday_register[1];
    if (alarm_number < 2 && alarm_type < 8 && alarm_type != 5 && alarm_type != 6 && device_start(i2c_fd))
    {
        clear_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_CONTROL,
                           alarm_number ? MCP7940_ALM1EN : MCP7940_ALM0EN); // Turn off the alarm

        offset = 7 * alarm_number; // Offset to be applied

        i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0WKDAY + offset, 1, wkday_register);

        wkday_register[0] &= ((1 << MCP7940_ALM0IF) | (1 << MCP7940_ALMPOL)); // Keep ALMPOL and ALMxIF bits
        wkday_register[0] |= alarm_type << 4;                                 // Set 3 bits from alarm_type
        wkday_register[0] |= (dt.tm_wday & 0x07);                             // Set 3 bits for dow from date

        i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0WKDAY + offset, wkday_register[0]); // Write alarm mask
        i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0SEC + offset, int2bcd(dt.tm_sec));
        i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0MIN + offset, int2bcd(dt.tm_min));
        i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0HOUR + offset, int2bcd(dt.tm_hour));

        i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0DATE + offset, int2bcd(dt.tm_mday));
        i2c_write(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0MTH + offset, int2bcd(dt.tm_mon));

        set_alarm_state(i2c_fd, alarm_number, state); // Set the requested alarm to state

        return 0;
    }

    perror("Error: Alarm not set!\n");
    return 1;
}

/*!
    @brief   Gets the DateTime for the given alarm
    @details update the alarmType parameter with the alarm type that was set
    @param[in] alarmNumber Alarm number 0 or 1
    @param[out] alarmType See detailed description for list of alarm types 0-7
    @return DateTime value of alarm
*/
uint8_t MCP7940_get_alarm(int i2c_fd, uint8_t alarm_number)
{
    if (alarm_number > 1)
        return 1;

    uint8_t offset, alarm_type[1], sec[1], min[1], hour[1], dd[1], mm[1];
    offset = 7 * alarm_number;

    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0WKDAY + offset, 1, alarm_type);
    alarm_type[0] = (alarm_type[0] >> 4) & 0b111;

    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0SEC + offset, 1, sec);
    sec[0] = bcd2int(sec[0] & 0x7F);

    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0MIN + offset, 1, min);
    min[0] = bcd2int(min[0] & 0x7F);

    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0HOUR + offset, 1, hour);
    hour[0] = bcd2int(hour[0] & 0x3F);

    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0DATE + offset, 1, dd);
    dd[0] = bcd2int(dd[0] & 0x3F);

    i2c_read(i2c_fd, MCP7940_ADDRESS, MCP7940_ALM0MTH + offset, 1, mm);
    mm[0] = bcd2int(mm[0] & 0x1F);

    printf("Alarm %d set to: %02d %s - %02d:%02d:%02d\n", alarm_number, dd[0], dict_month[mm[0]], hour[0], min[0], sec[0]);

    return 0;
}

/*!
    @brief     Return the power failure status
    @return    boolean state of the power failure status. "true" if a power failure has occured,
    otherwise "false"
*/
uint8_t MCP7940_get_power_fail(int i2c_fd)
{
    return read_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCWKDAY, MCP7940_PWRFAIL);
}

/*!
    @brief     Clears the power failure status flag
    @return    1 if error
*/
uint8_t MCP7940_clear_power_fail(int i2c_fd)
{
    return clear_register_bit(i2c_fd, MCP7940_ADDRESS, MCP7940_RTCWKDAY, MCP7940_PWRFAIL);
}
