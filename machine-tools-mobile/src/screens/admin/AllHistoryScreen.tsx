import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiAxios from '../../api/axiosInstance';
import dayjs from 'dayjs';

interface Transaction {
  id: string;
  deviceName: string;
  deviceCode: string;
  employeeName: string;
  transactionType: number;
  quantity: number;
  transactionDate: string;
  notes?: string;
}

const typeLabel: Record<number, string> = {
  0: 'Mượn',
  1: 'Trả',
  2: 'Đánh hỏng',
  3: 'Bảo trì',
  4: 'Thanh lý',
};

const typeColor: Record<number, string> = {
  0: '#faad14',
  1: '#52c41a',
  2: '#f5222d',
  3: '#1890ff',
  4: '#999',
};

const AllHistoryScreen: React.FC = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['all-transactions', page],
    queryFn: () =>
      apiAxios
        .get('/api/transactions', {
          params: { skipCount: page * 20, maxResultCount: 20, sorting: 'transactionDate desc' },
        })
        .then((r) => r.data),
  });

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor[item.transactionType] + '20' }]}>
          <Text style={[styles.typeText, { color: typeColor[item.transactionType] }]}>
            {typeLabel[item.transactionType] || 'Khác'}
          </Text>
        </View>
        <Text style={styles.date}>{dayjs(item.transactionDate).format('DD/MM/YYYY HH:mm')}</Text>
      </View>
      <Text style={styles.deviceName}>{item.deviceName}</Text>
      <Text style={styles.employee}>{item.employeeName} | SL: {item.quantity}</Text>
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Chưa có lịch sử giao dịch</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  typeText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: '#888' },
  deviceName: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 8 },
  employee: { fontSize: 13, color: '#666', marginTop: 4 },
  notes: { fontSize: 12, color: '#999', marginTop: 4, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: '#999' },
});

export default AllHistoryScreen;
