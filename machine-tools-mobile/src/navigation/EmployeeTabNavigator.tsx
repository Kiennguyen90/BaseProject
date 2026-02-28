import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {
  EmployeeTabParamList,
  DeviceStackParamList,
  BorrowStackParamList,
} from '../types/navigation.types';

import HomeScreen from '../screens/home/HomeScreen';
import DeviceListScreen from '../screens/devices/DeviceListScreen';
import DeviceDetailScreen from '../screens/devices/DeviceDetailScreen';
import MyBorrowsScreen from '../screens/borrow/MyBorrowsScreen';
import BorrowDetailScreen from '../screens/borrow/BorrowDetailScreen';
import CreateBorrowScreen from '../screens/borrow/CreateBorrowScreen';
import CreateReturnScreen from '../screens/return/CreateReturnScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Device stack
const DeviceStack = createNativeStackNavigator<DeviceStackParamList>();
const DeviceStackNavigator: React.FC = () => (
  <DeviceStack.Navigator>
    <DeviceStack.Screen name="DeviceList" component={DeviceListScreen} options={{ title: 'Thiết bị' }} />
    <DeviceStack.Screen name="DeviceDetail" component={DeviceDetailScreen} options={{ title: 'Chi tiết' }} />
  </DeviceStack.Navigator>
);

// Borrow stack
const BorrowStack = createNativeStackNavigator<BorrowStackParamList>();
const BorrowStackNavigator: React.FC = () => (
  <BorrowStack.Navigator>
    <BorrowStack.Screen name="MyBorrowList" component={MyBorrowsScreen} options={{ title: 'Mượn của tôi' }} />
    <BorrowStack.Screen name="BorrowDetail" component={BorrowDetailScreen} options={{ title: 'Chi tiết mượn' }} />
    <BorrowStack.Screen name="CreateBorrow" component={CreateBorrowScreen} options={{ title: 'Tạo yêu cầu mượn' }} />
    <BorrowStack.Screen name="CreateReturn" component={CreateReturnScreen} options={{ title: 'Trả thiết bị' }} />
  </BorrowStack.Navigator>
);

// Employee tab navigator
const Tab = createBottomTabNavigator<EmployeeTabParamList>();

const EmployeeTabNavigator: React.FC = () => (
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
      name="MyBorrows"
      component={BorrowStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="swap-horizontal" color={color} size={size} />,
        tabBarLabel: 'Mượn/Trả',
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

export default EmployeeTabNavigator;
