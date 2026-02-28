import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowRequestApi } from '../../api/borrowRequestApi';
import type { BorrowRequest } from '../../types/borrowRequest.types';
import { BorrowRequestStatus } from '../../types/borrowRequest.types';
import type { AdminRequestStackScreenProps } from '../../types/navigation.types';
import dayjs from 'dayjs';

type Props = AdminRequestStackScreenProps<'PendingRequests'>;

const PendingRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () =>
      borrowRequestApi.getList({
        status: BorrowRequestStatus.Pending,
        maxResultCount: 50,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => borrowRequestApi.approve(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      Alert.alert('Thành công', 'Đã duyệt yêu cầu');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      borrowRequestApi.reject(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      Alert.alert('Thành công', 'Đã từ chối yêu cầu');
    },
  });

  const handleApprove = (id: string) => {
    Alert.alert('Xác nhận', 'Duyệt yêu cầu mượn này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Duyệt', onPress: () => approveMutation.mutate(id) },
    ]);
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const confirmReject = () => {
    if (rejectReason.trim()) {
      rejectMutation.mutate({ id: rejectingId, reason: rejectReason.trim() });
      setRejectModalVisible(false);
    }
  };

  const renderItem = ({ item }: { item: BorrowRequest }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.deviceName}>{item.deviceName}</Text>
        <Text style={styles.quantity}>SL: {item.quantity}</Text>
      </View>
      <Text style={styles.employee}>{item.employeeName} ({item.employeeCode})</Text>
      <View style={styles.dates}>
        <Text style={styles.dateText}>Mượn: {dayjs(item.borrowDate).format('DD/MM/YYYY')}</Text>
        <Text style={styles.dateText}>Trả: {dayjs(item.expectedReturnDate).format('DD/MM/YYYY')}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.approveText}>Duyệt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.rejectText}>Từ chối</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
              <Text style={styles.emptyText}>Không có yêu cầu chờ duyệt</Text>
            </View>
          ) : null
        }
      />
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Từ chối</Text>
            <Text style={styles.modalSubtitle}>Nhập lý do từ chối:</Text>
            <TextInput
              style={styles.modalInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Lý do..."
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalRejectBtn} onPress={confirmReject}>
                <Text style={styles.modalRejectText}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 12 },
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
  deviceName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  quantity: { fontSize: 14, color: '#888' },
  employee: { fontSize: 13, color: '#666', marginTop: 6 },
  dates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dateText: { fontSize: 12, color: '#888' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: '#f6ffed', borderWidth: 1, borderColor: '#b7eb8f' },
  rejectBtn: { backgroundColor: '#fff2f0', borderWidth: 1, borderColor: '#ffccc7' },
  approveText: { color: '#52c41a', fontWeight: '600' },
  rejectText: { color: '#f5222d', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: '#999' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#333', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  modalCancelText: { color: '#666', fontSize: 15 },
  modalRejectBtn: { backgroundColor: '#f5222d', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  modalRejectText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default PendingRequestsScreen;
