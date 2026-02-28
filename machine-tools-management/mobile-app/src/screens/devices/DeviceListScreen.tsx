import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { deviceApi } from '../../api/deviceApi';
import type { Device, DeviceListFilter } from '../../types/device.types';
import { DeviceStatus } from '../../types/device.types';
import type { DeviceStackScreenProps } from '../../types/navigation.types';

const statusLabel: Record<number, string> = {
  [DeviceStatus.Available]: 'Sẵn sàng',
  [DeviceStatus.Borrowed]: 'Đang mượn',
  [DeviceStatus.Broken]: 'Hỏng',
  [DeviceStatus.UnderMaintenance]: 'Bảo trì',
  [DeviceStatus.Retired]: 'Thanh lý',
};

const statusColor: Record<number, string> = {
  [DeviceStatus.Available]: '#52c41a',
  [DeviceStatus.Borrowed]: '#faad14',
  [DeviceStatus.Broken]: '#f5222d',
  [DeviceStatus.UnderMaintenance]: '#1890ff',
  [DeviceStatus.Retired]: '#999',
};

type Props = DeviceStackScreenProps<'DeviceList'>;

const DeviceListScreen: React.FC<Props> = ({ navigation }) => {
  const [filter, setFilter] = useState<DeviceListFilter>({
    skipCount: 0,
    maxResultCount: 20,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['devices', filter, search],
    queryFn: () => deviceApi.getList({ ...filter, filter: search || undefined }),
  });

  const renderItem = useCallback(
    ({ item }: { item: Device }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.deviceCode}>{item.code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor[item.status] }]}>
              {statusLabel[item.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.category}>{item.categoryName}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.quantity}>
            Còn: {item.availableQuantity}/{item.totalQuantity}
          </Text>
          {item.location && <Text style={styles.location}>{item.location}</Text>}
        </View>
      </TouchableOpacity>
    ),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm thiết bị..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Không tìm thấy thiết bị</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchInput: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  list: { padding: 12, paddingTop: 0 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deviceCode: { fontSize: 13, color: '#666', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  deviceName: { fontSize: 17, fontWeight: '600', color: '#333', marginTop: 8 },
  category: { fontSize: 13, color: '#888', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  quantity: { fontSize: 13, color: '#555' },
  location: { fontSize: 13, color: '#888' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: '#999' },
});

export default DeviceListScreen;
