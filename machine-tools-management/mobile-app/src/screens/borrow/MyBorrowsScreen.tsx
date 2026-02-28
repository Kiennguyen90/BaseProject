import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { borrowRequestApi } from '../../api/borrowRequestApi';
import type { BorrowRequest } from '../../types/borrowRequest.types';
import { BorrowRequestStatus } from '../../types/borrowRequest.types';
import type { BorrowStackScreenProps } from '../../types/navigation.types';
import dayjs from 'dayjs';

const statusLabel: Record<number, string> = {
  [BorrowRequestStatus.Pending]: 'Chờ duyệt',
  [BorrowRequestStatus.Approved]: 'Đã duyệt',
  [BorrowRequestStatus.Rejected]: 'Từ chối',
  [BorrowRequestStatus.Returned]: 'Đã trả',
  [BorrowRequestStatus.Overdue]: 'Quá hạn',
};

const statusColor: Record<number, string> = {
  [BorrowRequestStatus.Pending]: '#faad14',
  [BorrowRequestStatus.Approved]: '#52c41a',
  [BorrowRequestStatus.Rejected]: '#f5222d',
  [BorrowRequestStatus.Returned]: '#1890ff',
  [BorrowRequestStatus.Overdue]: '#eb2f96',
};

type Props = BorrowStackScreenProps<'MyBorrowList'>;

const MyBorrowsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-borrows'],
    queryFn: () => borrowRequestApi.getMyList({ maxResultCount: 50 }),
  });

  const renderItem = ({ item }: { item: BorrowRequest }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('BorrowDetail', { borrowId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.deviceName}>{item.deviceName}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor[item.status] + '20' }]}>
          <Text style={[styles.badgeText, { color: statusColor[item.status] }]}>
            {statusLabel[item.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.info}>SL: {item.quantity}</Text>
      <View style={styles.dates}>
        <Text style={styles.dateText}>
          Mượn: {dayjs(item.borrowDate).format('DD/MM/YYYY')}
        </Text>
        <Text style={styles.dateText}>
          Trả: {dayjs(item.expectedReturnDate).format('DD/MM/YYYY')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('CreateBorrow', {})}
      >
        <Text style={styles.createBtnText}>+ Tạo yêu cầu mượn</Text>
      </TouchableOpacity>
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Chưa có yêu cầu mượn nào</Text>
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
  createBtn: {
    backgroundColor: '#1677ff',
    margin: 12,
    marginBottom: 4,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
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
  deviceName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  info: { fontSize: 13, color: '#666', marginTop: 6 },
  dates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dateText: { fontSize: 12, color: '#888' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: '#999' },
});

export default MyBorrowsScreen;
