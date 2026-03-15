import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { deviceApi } from '../../api/deviceApi';
import { DeviceStatus, DeviceType } from '../../types/device.types';
import type { DeviceStackScreenProps } from '../../types/navigation.types';
import { useAuth } from '../../contexts/AuthContext';

type Props = DeviceStackScreenProps<'DeviceDetail'>;

const statusLabel: Record<number, string> = {
  [DeviceStatus.Available]: 'Sẵn sàng',
  [DeviceStatus.Borrowed]: 'Đang mượn',
  [DeviceStatus.Broken]: 'Hỏng',
  [DeviceStatus.UnderMaintenance]: 'Bảo trì',
  [DeviceStatus.Retired]: 'Thanh lý',
};

const DeviceDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { deviceId } = route.params;
  const { user } = useAuth();
  const isEmployee = user?.role !== 'Admin';

  const { data: device, isLoading } = useQuery({
    queryKey: ['devices', deviceId],
    queryFn: () => deviceApi.get(deviceId),
  });

  if (isLoading || !device) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1677ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.code}>Mã: {device.code}</Text>

        <View style={styles.row}>
          <InfoItem label="Danh mục" value={device.categoryName} />
          <InfoItem
            label="Loại"
            value={device.deviceType === DeviceType.BorrowReturn ? 'Mượn-Trả' : 'Tiêu hao'}
          />
        </View>

        <View style={styles.row}>
          <InfoItem label="Trạng thái" value={statusLabel[device.status]} />
          <InfoItem label="Số lượng" value={`${device.availableQuantity}/${device.totalQuantity}`} />
        </View>

        {device.location && (
          <View style={styles.row}>
            <InfoItem label="Vị trí" value={device.location} />
          </View>
        )}

        {device.description && (
          <View style={styles.descSection}>
            <Text style={styles.descLabel}>Mô tả</Text>
            <Text style={styles.descText}>{device.description}</Text>
          </View>
        )}
      </View>

      {isEmployee && device.status === DeviceStatus.Available && device.availableQuantity > 0 && (
        <TouchableOpacity
          style={styles.borrowButton}
          onPress={() => {
            // Navigate to borrow screen - needs to be in same navigator or use parent
            navigation.getParent()?.navigate('MyBorrows', {
              screen: 'CreateBorrow',
              params: { deviceId: device.id },
            });
          }}
        >
          <Text style={styles.borrowButtonText}>Mượn thiết bị này</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  deviceName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  code: { fontSize: 14, color: '#888', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 16 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '600', marginTop: 2 },
  descSection: { marginTop: 16 },
  descLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  descText: { fontSize: 14, color: '#555', marginTop: 4, lineHeight: 20 },
  borrowButton: {
    backgroundColor: '#1677ff',
    margin: 16,
    marginTop: 8,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  borrowButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default DeviceDetailScreen;
