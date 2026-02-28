import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

export const storageService = {
  getAccessToken: () => AsyncStorage.getItem(KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) => AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token),

  getRefreshToken: () => AsyncStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token),

  getUser: async () => {
    const json = await AsyncStorage.getItem(KEYS.USER);
    return json ? JSON.parse(json) : null;
  },
  setUser: (user: object) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),

  clearAuth: async () => {
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]);
  },
};
