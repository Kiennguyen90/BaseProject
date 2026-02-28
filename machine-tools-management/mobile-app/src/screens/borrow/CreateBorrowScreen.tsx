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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceApi } from '../../api/deviceApi';
import { borrowRequestApi } from '../../api/borrowRequestApi';
import type { BorrowStackScreenProps } from '../../types/navigation.types';
import type { Device } from '../../types/device.types';

type Props = BorrowStackScreenProps<'CreateBorrow'>;

const CreateBorrowScreen: React.FC<Props> = ({ route, navigation }) => {
  const preselectedDeviceId = route.params?.deviceId;
  const queryClient = useQueryClient();

  const [selectedDeviceId, setSelectedDeviceId] = useState(preselectedDeviceId || '');
  const [quantity, setQuantity] = useState('1');
  const [purpose, setPurpose] = useState('');
  const [returnDays, setReturnDays] = useState('7');

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['available-devices'],
    queryFn: () => deviceApi.getAvailable({ maxResultCount: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const days = parseInt(returnDays, 10) || 7;
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + days);

      return borrowRequestApi.create({
        deviceId: selectedDeviceId,
        quantity: parseInt(quantity, 10) || 1,
        expectedReturnDate: returnDate.toISOString(),
        purpose: purpose || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-borrows'] });
      Alert.alert('Thành công', 'Đã tạo yêu cầu mượn', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.error?.message || 'Không thể tạo yêu cầu');
    },
  });

  const handleSubmit = () => {
    if (!selectedDeviceId) {
      Alert.alert('Lỗi', 'Vui lòng chọn thiết bị');
      return;
    }
    createMutation.mutate();
  };

  const selectedDevice = devices?.items.find((d: Device) => d.id === selectedDeviceId);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Thiết bị</Text>
        {devicesLoading ? (
          <ActivityIndicator />
        ) : (
          <View>
            {(devices?.items || []).map((device: Device) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  styles.deviceOption,
                  selectedDeviceId === device.id && styles.deviceOptionSelected,
                ]}
                onPress={() => setSelectedDeviceId(device.id)}
              >
                <Text style={styles.deviceOptionCode}>{device.code}</Text>
                <Text style={styles.deviceOptionName}>{device.name}</Text>
                <Text style={styles.deviceOptionQty}>Còn: {device.availableQuantity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Số lượng</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder={`Tối đa: ${selectedDevice?.availableQuantity || '?'}`}
        />

        <Text style={styles.label}>Số ngày mượn</Text>
        <TextInput
          style={styles.input}
          value={returnDays}
          onChangeText={setReturnDays}
          keyboardType="numeric"
          placeholder="7"
        />

        <Text style={styles.label}>Mục đích (không bắt buộc)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Nhập mục đích sử dụng..."
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Gửi yêu cầu mượn</Text>
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
  textArea: { height: 80, textAlignVertical: 'top' },
  deviceOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  deviceOptionSelected: {
    borderColor: '#1677ff',
    backgroundColor: '#e6f4ff',
  },
  deviceOptionCode: { fontSize: 12, color: '#888' },
  deviceOptionName: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 2 },
  deviceOptionQty: { fontSize: 12, color: '#52c41a', marginTop: 2 },
  submitBtn: {
    backgroundColor: '#1677ff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CreateBorrowScreen;
