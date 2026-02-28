import { Platform } from 'react-native';

// On Android emulator, localhost maps to the emulator itself, not the host machine.
// Use 10.0.2.2 to reach the host machine from Android emulator.
// On a physical device, replace with your machine's LAN IP (e.g., 192.168.x.x).
const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const Config = {
  AUTH_API_URL: `https://${LOCALHOST}:44301`,
  MACHINE_TOOLS_API_URL: `https://${LOCALHOST}:44302`,
};
