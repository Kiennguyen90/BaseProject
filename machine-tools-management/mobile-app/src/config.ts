// API host configuration:
// - Android emulator: use '10.0.2.2' (maps to host machine)
// - Physical device:  use your machine's LAN IP (e.g., 192.168.2.44)
// Use HTTP ports (5001/5002) on physical devices to avoid self-signed cert issues.
const IS_PHYSICAL_DEVICE = true; // set to false when using emulator

const HOST = IS_PHYSICAL_DEVICE ? '192.168.2.44' : '10.0.2.2';
const AUTH_PORT = IS_PHYSICAL_DEVICE ? 5001 : 44301;
const MACHINE_TOOLS_PORT = IS_PHYSICAL_DEVICE ? 5002 : 44302;
const SCHEME = IS_PHYSICAL_DEVICE ? 'http' : 'https';

export const Config = {
  AUTH_API_URL: `${SCHEME}://${HOST}:${AUTH_PORT}`,
  MACHINE_TOOLS_API_URL: `${SCHEME}://${HOST}:${MACHINE_TOOLS_PORT}`,
};
