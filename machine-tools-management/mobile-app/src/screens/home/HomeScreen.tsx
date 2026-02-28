import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiAxios from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { borrowRequestApi } from '../../api/borrowRequestApi';

interface DashboardStats {
  totalDevices: number;
  availableDevices: number;
  borrowedDevices: number;
  brokenDevices: number;
  pendingBorrowRequests: number;
  overdueCount: number;
}

const HomeScreen: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiAxios.get<DashboardStats>('/api/dashboard/stats').then((r) => r.data),
  });

  const { data: myBorrows } = useQuery({
    queryKey: ['my-borrows'],
    queryFn: () => borrowRequestApi.getMyList({ maxResultCount: 5 }),
  });

  const isAdmin = user?.role === 'Admin';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào,</Text>
        <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
        {user?.employeeCode && (
          <Text style={styles.employeeCode}>Mã NV: {user.employeeCode}</Text>
        )}
      </View>

      {stats && (
        <View style={styles.statsGrid}>
          <StatCard label="Tổng thiết bị" value={stats.totalDevices} color="#1677ff" />
          <StatCard label="Sẵn sàng" value={stats.availableDevices} color="#52c41a" />
          <StatCard label="Đang mượn" value={stats.borrowedDevices} color="#faad14" />
          <StatCard label="Hỏng" value={stats.brokenDevices} color="#f5222d" />
          {isAdmin && (
            <>
              <StatCard label="Chờ duyệt" value={stats.pendingBorrowRequests} color="#722ed1" />
              <StatCard label="Quá hạn" value={stats.overdueCount} color="#eb2f96" />
            </>
          )}
        </View>
      )}

      {myBorrows && myBorrows.items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mượn gần đây</Text>
          {myBorrows.items.map((b) => (
            <View key={b.id} style={styles.borrowCard}>
              <Text style={styles.borrowDevice}>{b.deviceName}</Text>
              <Text style={styles.borrowInfo}>
                SL: {b.quantity} | Trả: {new Date(b.expectedReturnDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#1677ff',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  employeeCode: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    marginTop: -16,
  },
  statCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: '2%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  borrowCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  borrowDevice: { fontSize: 15, fontWeight: '600', color: '#333' },
  borrowInfo: { fontSize: 13, color: '#666', marginTop: 4 },
});

export default HomeScreen;
