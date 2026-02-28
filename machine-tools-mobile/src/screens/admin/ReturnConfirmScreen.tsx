import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiAxios from '../../api/axiosInstance';
import type { AdminRequestStackScreenProps } from '../../types/navigation.types';

type Props = AdminRequestStackScreenProps<'ReturnConfirm'>;

const ReturnConfirmScreen: React.FC<Props> = ({ route, navigation }) => {
  const { returnId } = route.params;
  const queryClient = useQueryClient();
  const [condition, setCondition] = useState('Good');
  const [note, setNote] = useState('');

  const { data: returnRequest, isLoading } = useQuery({
    queryKey: ['return-requests', returnId],
    queryFn: () => apiAxios.get(`/api/return-requests/${returnId}`).then((r) => r.data),
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      apiAxios.put(`/api/return-requests/${returnId}/confirm`, {
        deviceCondition: condition,
        note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      Alert.alert('Thành công', 'Đã xác nhận trả thiết bị', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => Alert.alert('Lỗi', 'Không thể xác nhận'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) =>
      apiAxios.put(`/api/return-requests/${returnId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
      Alert.alert('Đã từ chối', 'Yêu cầu trả đã bị từ chối', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
  });

  if (isLoading || !returnRequest) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1677ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Xác nhận trả thiết bị</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Thiết bị</Text>
          <Text style={styles.value}>{returnRequest.deviceName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nhân viên</Text>
          <Text style={styles.value}>{returnRequest.employeeName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Số lượng</Text>
          <Text style={styles.value}>{returnRequest.quantity}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tình trạng thiết bị</Text>
          <View style={styles.conditionRow}>
            {['Good', 'Damaged', 'Broken'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.conditionBtn, condition === c && styles.conditionBtnActive]}
                onPress={() => setCondition(c)}
              >
                <Text
                  style={[
                    styles.conditionText,
                    condition === c && styles.conditionTextActive,
                  ]}
                >
                  {c === 'Good' ? 'Tốt' : c === 'Damaged' ? 'Hư hỏng' : 'Hỏng'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Ghi chú (tùy chọn)..."
            multiline
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.confirmBtn]}
          onPress={() => confirmMutation.mutate()}
        >
          <Text style={styles.confirmBtnText}>Xác nhận</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => {
            Alert.alert('Từ chối', 'Bạn có chắc muốn từ chối yêu cầu trả này?', [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Từ chối',
                style: 'destructive',
                onPress: () => rejectMutation.mutate('Rejected by admin'),
              },
            ]);
          }}
        >
          <Text style={styles.rejectBtnText}>Từ chối</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

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
  section: { marginTop: 14 },
  label: { fontSize: 12, color: '#999', fontWeight: '500', textTransform: 'uppercase' },
  value: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 4 },
  conditionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  conditionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  conditionBtnActive: { borderColor: '#1677ff', backgroundColor: '#e6f4ff' },
  conditionText: { fontSize: 14, color: '#666' },
  conditionTextActive: { color: '#1677ff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  actions: { flexDirection: 'row', padding: 16, gap: 12 },
  actionBtn: { flex: 1, borderRadius: 10, padding: 16, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#52c41a' },
  rejectBtn: { backgroundColor: '#f5222d' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rejectBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default ReturnConfirmScreen;
