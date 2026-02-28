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
import { borrowRequestApi } from '../../api/borrowRequestApi';
import { BorrowRequestStatus } from '../../types/borrowRequest.types';
import type { BorrowStackScreenProps } from '../../types/navigation.types';
import dayjs from 'dayjs';

type Props = BorrowStackScreenProps<'BorrowDetail'>;

const BorrowDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { borrowId } = route.params;

  const { data: borrow, isLoading } = useQuery({
    queryKey: ['borrow-requests', borrowId],
    queryFn: () => borrowRequestApi.get(borrowId),
  });

  if (isLoading || !borrow) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1677ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{borrow.deviceName}</Text>
        <Text style={styles.code}>{borrow.deviceCode}</Text>

        <View style={styles.row}>
          <InfoItem label="Số lượng" value={String(borrow.quantity)} />
          <InfoItem
            label="Trạng thái"
            value={
              borrow.status === BorrowRequestStatus.Pending
                ? 'Chờ duyệt'
                : borrow.status === BorrowRequestStatus.Approved
                  ? 'Đã duyệt'
                  : borrow.status === BorrowRequestStatus.Rejected
                    ? 'Từ chối'
                    : borrow.status === BorrowRequestStatus.Returned
                      ? 'Đã trả'
                      : 'Quá hạn'
            }
          />
        </View>

        <View style={styles.row}>
          <InfoItem label="Ngày mượn" value={dayjs(borrow.borrowDate).format('DD/MM/YYYY')} />
          <InfoItem label="Ngày trả dự kiến" value={dayjs(borrow.expectedReturnDate).format('DD/MM/YYYY')} />
        </View>

        {borrow.actualReturnDate && (
          <View style={styles.row}>
            <InfoItem label="Ngày trả thực tế" value={dayjs(borrow.actualReturnDate).format('DD/MM/YYYY')} />
          </View>
        )}

        {borrow.purpose && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Mục đích</Text>
            <Text style={styles.sectionText}>{borrow.purpose}</Text>
          </View>
        )}

        {borrow.rejectionReason && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: '#f5222d' }]}>Lý do từ chối</Text>
            <Text style={styles.sectionText}>{borrow.rejectionReason}</Text>
          </View>
        )}
      </View>

      {borrow.status === BorrowRequestStatus.Approved && (
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => navigation.navigate('CreateReturn', { borrowId: borrow.id })}
        >
          <Text style={styles.returnBtnText}>Trả thiết bị</Text>
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
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  code: { fontSize: 13, color: '#888', marginTop: 2 },
  row: { flexDirection: 'row', marginTop: 16 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#999' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 2 },
  section: { marginTop: 16 },
  sectionLabel: { fontSize: 12, color: '#999' },
  sectionText: { fontSize: 14, color: '#555', marginTop: 4, lineHeight: 20 },
  returnBtn: {
    backgroundColor: '#52c41a',
    margin: 16,
    marginTop: 8,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  returnBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default BorrowDetailScreen;
