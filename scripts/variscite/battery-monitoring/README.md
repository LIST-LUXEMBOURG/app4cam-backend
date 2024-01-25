# Battery monitoring Scripts

This is an i2c MCP3221 reading application written in C.

## Chip

The [MCP3221](https://www.microchip.com/en-us/product/mcp3221) is a successive approximation A/D converter with 12-bit resolution.  
The scripts are configured to be used on NewtCam HW boards developed by Quimesis. For HW details read the available wiki [variscite-guide](https://git.list.lu/host/mechatronics/app4cam-frontend/-/wikis/variscite-guide).

## Build

```
make
```

## Execute

```
./wifi_control
```

## Clean

```
make clean
```

## Output

The output is a 1 decimal value corresponding to input supply voltage. Measured with approximately ±0.1V accuracy.
