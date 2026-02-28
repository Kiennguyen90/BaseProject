import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowRequestApi } from '../../api/borrowRequestApi';
import { BorrowRequestStatus } from '../../types/borrowRequest.types';
import type { AdminRequestStackScreenProps } from '../../types/navigation.types';
import dayjs from 'dayjs';

type Props = AdminRequestStackScreenProps<'RequestDetail'>;

const RequestDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { requestId } = route.params;
  const queryClient = useQueryClient();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: request, isLoading } = useQuery({
    queryKey: ['borrow-requests', requestId],
    queryFn: () => borrowRequestApi.get(requestId),
  });

  const approveMutation = useMutation({
    mutationFn: () => borrowRequestApi.approve(requestId, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      Alert.alert('Thành công', 'Đã duyệt yêu cầu', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => borrowRequestApi.reject(requestId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      Alert.alert('Đã từ chối', 'Yêu cầu đã bị từ chối', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
  });

  if (isLoading || !request) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1677ff" />
      </View>
    );
  }

  const isPending = request.status === BorrowRequestStatus.Pending;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Chi tiết yêu cầu mượn</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thiết bị</Text>
          <Text style={styles.deviceName}>{request.deviceName}</Text>
          <Text style={styles.deviceCode}>{request.deviceCode}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhân viên</Text>
          <Text style={styles.value}>{request.employeeName}</Text>
          <Text style={styles.subValue}>Mã: {request.employeeCode}</Text>
        </View>

        <View style={styles.row}>
          <InfoItem label="Số lượng" value={String(request.quantity)} />
          <InfoItem
            label="Trạng thái"
            value={
              request.status === BorrowRequestStatus.Pending ? 'Chờ duyệt' :
              request.status === BorrowRequestStatus.Approved ? 'Đã duyệt' :
              request.status === BorrowRequestStatus.Rejected ? 'Từ chối' :
              request.status === BorrowRequestStatus.Returned ? 'Đã trả' : 'Quá hạn'
            }
          />
        </View>

        <View style={styles.row}>
          <InfoItem label="Ngày mượn" value={dayjs(request.borrowDate).format('DD/MM/YYYY')} />
          <InfoItem label="Hạn trả" value={dayjs(request.expectedReturnDate).format('DD/MM/YYYY')} />
        </View>

        {request.purpose && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mục đích</Text>
            <Text style={styles.purposeText}>{request.purpose}</Text>
          </View>
        )}

        {request.rejectionReason && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#f5222d' }]}>Lý do từ chối</Text>
            <Text style={styles.purposeText}>{request.rejectionReason}</Text>
          </View>
        )}
      </View>

      {isPending && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => {
              Alert.alert('Xác nhận', 'Duyệt yêu cầu này?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Duyệt', onPress: () => approveMutation.mutate() },
              ]);
            }}
          >
            <Text style={styles.approveBtnText}>Duyệt yêu cầu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => {
              setRejectReason('');
              setRejectModalVisible(true);
            }}
          >
            <Text style={styles.rejectBtnText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}

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
              <TouchableOpacity
                style={styles.modalRejectBtn}
                onPress={() => {
                  if (rejectReason.trim()) {
                    rejectMutation.mutate(rejectReason.trim());
                    setRejectModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalRejectText}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 12, color: '#999', fontWeight: '500', textTransform: 'uppercase' },
  deviceName: { fontSize: 17, fontWeight: '600', color: '#333', marginTop: 4 },
  deviceCode: { fontSize: 13, color: '#888', marginTop: 2 },
  value: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 4 },
  subValue: { fontSize: 13, color: '#888', marginTop: 2 },
  row: { flexDirection: 'row', marginTop: 16 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#999' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 2 },
  purposeText: { fontSize: 14, color: '#555', marginTop: 4, lineHeight: 20 },
  actionContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  actionBtn: { flex: 1, borderRadius: 10, padding: 16, alignItems: 'center' },
  approveBtn: { backgroundColor: '#52c41a' },
  rejectBtn: { backgroundColor: '#f5222d' },
  approveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rejectBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
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

export default RequestDetailScreen;
