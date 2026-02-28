import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from '../components/common/PrivateRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import DeviceListPage from '../pages/DeviceListPage';
import CategoryListPage from '../pages/CategoryListPage';
import BorrowRequestListPage from '../pages/BorrowRequestListPage';
import ReturnRequestListPage from '../pages/ReturnRequestListPage';
import TransactionHistoryPage from '../pages/TransactionHistoryPage';
import EmployeeListPage from '../pages/EmployeeListPage';
import UserListPage from '../pages/UserListPage';
import ProfilePage from '../pages/ProfilePage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="devices" element={<DeviceListPage />} />
      <Route path="categories" element={<CategoryListPage />} />
      <Route path="borrow-requests" element={<BorrowRequestListPage />} />
      <Route path="return-requests" element={<ReturnRequestListPage />} />
      <Route path="transactions" element={<TransactionHistoryPage />} />
      <Route path="employees" element={<EmployeeListPage />} />
      <Route path="users" element={<UserListPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
