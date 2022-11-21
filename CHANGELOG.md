# Changelog

## Upcoming version

### Added

- Reintroduce `device ID` as property returning first MAC address
- Introduce setting `shot types` to indicate whether pictures or videos should be taken
- Enforce alphabetical order of imports
- Automatically deploy to Variscite test device
- Introduce setting `trigger sensitivity`
- Automatic addition of device ID as metadata to shots after saving them
- New config option `DEVICE_TYPE` to define the device to run on
- Add OpenAPI Specification (OAS) using Swagger under `/api`

### Changed

- Move code build from Pi to CI/CD runner
- Extract version number and commit hash to file `version.txt` upon build from where they are read
- Rename `device ID` to `device name`
- Rename `version` to `properties/version` endpoint
- Update dependencies
- Set body parser's `urlencoded` option `extended` to `false`
- Allow `site name` to be empty
- Upgrade NestJS to version 9.x
- Restructure settings' object
- Switch video format `mkv` to `mp4`
- Use dedicated command when deleting all files by passing `*` as single filename to not having to loop through all files

### Deprecated

### Removed

### Fixed

### Security

## Sprint 5 - version 1.1.1

### Fixed

- Require Node.js 16 or later
- Increase waiting time from 1/3 to 1/2 s of workaround to load latest snapshot for Raspberry Pi 3

## Sprint 5 - version 1.1.0

### Added

- Start changelog
- Add Static Application Security Testing (SAST) as manual job to gitlab CI/CD

### Changed

- Use device ID as left text on image
- Rename config file `aurinion.env` to `app4cam.env`
- Prepend site name to device ID for left text on image

### Fixed

- Ignore tags for CI/CD
- Remove unnecessary underscores in filenames
- Workaround loading previous snapshot instead of the one when taking a snapshot by waiting 1/3s

## Sprint 4 - version 1.0.0

_See commits_

## Sprint 3

_See commits_

## Sprint 2

_See commits_

## Sprint 1

_See commits_

The format is based on [Keep a Changelog](https://keepachangelog.com/).
