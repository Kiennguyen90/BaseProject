import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { returnRequestApi } from '../../api/returnRequestApi';
import type { BorrowStackScreenProps } from '../../types/navigation.types';

type Props = BorrowStackScreenProps<'CreateReturn'>;

const CreateReturnScreen: React.FC<Props> = ({ route, navigation }) => {
  const { borrowId } = route.params;
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState('');
  const [deviceCondition, setDeviceCondition] = useState<'Good' | 'Damaged' | 'Broken'>('Good');

  const conditionOptions: Array<{ value: 'Good' | 'Damaged' | 'Broken'; label: string; color: string }> = [
    { value: 'Good', label: 'Tốt', color: '#52c41a' },
    { value: 'Damaged', label: 'Hư hại nhẹ', color: '#faad14' },
    { value: 'Broken', label: 'Hỏng', color: '#f5222d' },
  ];

  const createMutation = useMutation({
    mutationFn: () =>
      returnRequestApi.create({
        borrowRequestId: borrowId,
        quantity: 1,
        condition: deviceCondition,
        isBroken: deviceCondition === 'Broken',
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-borrows'] });
      Alert.alert('Thành công', 'Đã tạo yêu cầu trả thiết bị', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.error?.message || 'Không thể tạo yêu cầu trả');
    },
  });

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Tình trạng thiết bị</Text>
        <View style={styles.conditionRow}>
          {conditionOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.conditionBtn,
                deviceCondition === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '15' },
              ]}
              onPress={() => setDeviceCondition(opt.value)}
            >
              <Text
                style={[
                  styles.conditionText,
                  deviceCondition === opt.value && { color: opt.color, fontWeight: '700' },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Ghi chú (không bắt buộc)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Mô tả tình trạng thiết bị..."
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
          onPress={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Gửi yêu cầu trả</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  conditionRow: { flexDirection: 'row', gap: 8 },
  conditionBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  conditionText: { fontSize: 14, color: '#666' },
  submitBtn: {
    backgroundColor: '#52c41a',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CreateReturnScreen;
