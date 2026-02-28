import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
};

// Employee tab navigator
export type EmployeeTabParamList = {
  Home: undefined;
  Devices: NavigatorScreenParams<DeviceStackParamList>;
  MyBorrows: NavigatorScreenParams<BorrowStackParamList>;
  Profile: undefined;
};

// Admin tab navigator
export type AdminTabParamList = {
  Home: undefined;
  Devices: NavigatorScreenParams<DeviceStackParamList>;
  Requests: NavigatorScreenParams<AdminRequestStackParamList>;
  History: undefined;
  Profile: undefined;
};

// Device stack
export type DeviceStackParamList = {
  DeviceList: undefined;
  DeviceDetail: { deviceId: string };
};

// Borrow stack
export type BorrowStackParamList = {
  MyBorrowList: undefined;
  BorrowDetail: { borrowId: string };
  CreateBorrow: { deviceId?: string };
  CreateReturn: { borrowId: string };
};

// Admin request stack
export type AdminRequestStackParamList = {
  PendingRequests: undefined;
  RequestDetail: { requestId: string };
  ReturnConfirm: { returnId: string };
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  EmployeeMain: NavigatorScreenParams<EmployeeTabParamList>;
  AdminMain: NavigatorScreenParams<AdminTabParamList>;
};

// Screen props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type DeviceStackScreenProps<T extends keyof DeviceStackParamList> =
  NativeStackScreenProps<DeviceStackParamList, T>;

export type BorrowStackScreenProps<T extends keyof BorrowStackParamList> =
  NativeStackScreenProps<BorrowStackParamList, T>;

export type AdminRequestStackScreenProps<T extends keyof AdminRequestStackParamList> =
  NativeStackScreenProps<AdminRequestStackParamList, T>;
