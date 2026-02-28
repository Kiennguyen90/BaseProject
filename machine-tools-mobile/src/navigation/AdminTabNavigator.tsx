import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {
  AdminTabParamList,
  DeviceStackParamList,
  AdminRequestStackParamList,
} from '../types/navigation.types';

import HomeScreen from '../screens/home/HomeScreen';
import DeviceListScreen from '../screens/devices/DeviceListScreen';
import DeviceDetailScreen from '../screens/devices/DeviceDetailScreen';
import PendingRequestsScreen from '../screens/admin/PendingRequestsScreen';
import RequestDetailScreen from '../screens/admin/RequestDetailScreen';
import ReturnConfirmScreen from '../screens/admin/ReturnConfirmScreen';
import AllHistoryScreen from '../screens/admin/AllHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Device stack
const DeviceStack = createNativeStackNavigator<DeviceStackParamList>();
const DeviceStackNavigator: React.FC = () => (
  <DeviceStack.Navigator>
    <DeviceStack.Screen name="DeviceList" component={DeviceListScreen} options={{ title: 'Thiết bị' }} />
    <DeviceStack.Screen name="DeviceDetail" component={DeviceDetailScreen} options={{ title: 'Chi tiết' }} />
  </DeviceStack.Navigator>
);

// Admin request stack
const RequestStack = createNativeStackNavigator<AdminRequestStackParamList>();
const RequestStackNavigator: React.FC = () => (
  <RequestStack.Navigator>
    <RequestStack.Screen name="PendingRequests" component={PendingRequestsScreen} options={{ title: 'Chờ duyệt' }} />
    <RequestStack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Chi tiết' }} />
    <RequestStack.Screen name="ReturnConfirm" component={ReturnConfirmScreen} options={{ title: 'Xác nhận trả' }} />
  </RequestStack.Navigator>
);

// Admin tab navigator
const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1677ff',
      tabBarInactiveTintColor: '#999',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        tabBarLabel: 'Trang chủ',
      }}
    />
    <Tab.Screen
      name="Devices"
      component={DeviceStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="tools" color={color} size={size} />,
        tabBarLabel: 'Thiết bị',
      }}
    />
    <Tab.Screen
      name="Requests"
      component={RequestStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="clipboard-check" color={color} size={size} />,
        tabBarLabel: 'Yêu cầu',
      }}
    />
    <Tab.Screen
      name="History"
      component={AllHistoryScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="history" color={color} size={size} />,
        tabBarLabel: 'Lịch sử',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="account" color={color} size={size} />,
        tabBarLabel: 'Hồ sơ',
      }}
    />
  </Tab.Navigator>
);

export default AdminTabNavigator;
