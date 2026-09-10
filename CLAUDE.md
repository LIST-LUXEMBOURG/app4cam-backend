# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Unit tests
npm run test

# Unit tests (watch)
npm run test:watch

# Run a single test file
npx vitest run --project unit src/settings/date-converter.spec.ts

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Setup

Copy `config/sample.env` to `config/development.env` and set:

- `DISABLE_ACCESS_CONTROL_ALLOW_ORIGIN=false`
- `IS_CAMERA_FOCUS_FIXED=true` or `false` depending on hardware

Config is loaded from `config/${NODE_ENV}.env`. Supported `DEVICE_TYPE` values: `Variscite`, `RaspberryPi`.

## Architecture

This is a **NestJS** backend for App4Cam, a wildlife camera trap system that runs on embedded Linux hardware (Raspberry Pi with Witty Pi 4, or Variscite NewtCAM board). It controls the **Motion** camera software via its HTTP API and manages device settings.

### Module structure

Each feature area is a NestJS module under `src/`:

- `settings` — camera, triggering, and general settings; reads/writes `settings.json` via `SettingsFileProvider`; proxies camera params to Motion
- `files` — manages shot files (pictures/videos) in the shots folder
- `snapshots` — on-demand snapshot capture via Motion
- `properties` — read-only device properties (version, battery, MAC address, time zones, sunrise/sunset)
- `storage` — disk usage reporting
  `upgrades` — firmware/app upgrade file handling
- `log-files` — access to application log files
- `motion-interactor` — scheduled jobs that interact with Motion (detection pause/resume)

### Key dependencies

**Motion** is the camera process running locally at `http://127.0.0.1:8080/`. `MotionClientService` wraps all HTTP calls to it. Many settings operations (focus, quality, threshold, shot types, filenames) are delegated to Motion via this client.

**`settings.json`** (at the repo root) is the persistent settings file, read and written by `SettingsFileProvider`. It stores camera light type, site/device names, coordinates, sleep/wake times, etc. At startup, the newest mounted USB path is auto-set as the shots folder.

### Service interfaces

Every `*.service.ts` has a corresponding `*.service.interface.ts`. Controllers depend on the interface, not the concrete class, so mocks can be swapped in tests via NestJS DI.

### Platform-specific behavior

Many interactors (sleep, system time, access point, light control, focus) invoke shell commands that only exist on Linux. On Windows they throw `CommandUnavailableOnWindowsException`, which is caught and gracefully handled throughout the codebase. This lets the server start on Windows for development without hardware.

Device-type branching (`RaspberryPi` vs `Variscite`) appears throughout `SettingsService` and `InitialisationInteractor` — Raspberry Pi uses Witty Pi for sleep scheduling and has different focus/light behavior.

### Scheduled jobs (cron)

`SettingsService` has two cron jobs:

- `sleepWhenItIsTime` (every minute) — triggers device sleep on Variscite at the configured or sunset time
- `doAlternatingLightModeChange` (daily at noon) — switches IR/visible light if alternating mode is on

### License

Every source file must include the GPL-3.0 copyright header (Luxembourg Institute of Science and Technology). See the header in any existing `.ts` file for the exact text.
