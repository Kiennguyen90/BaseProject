import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName || 'Người dùng'}</Text>
        <Text style={styles.role}>
          {user?.role === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <ProfileRow label="Email" value={user?.email || '-'} />
        <ProfileRow label="Số điện thoại" value={user?.phoneNumber || '-'} />
        {user?.employeeCode && (
          <ProfileRow label="Mã nhân viên" value={user.employeeCode} />
        )}
        {user?.department && (
          <ProfileRow label="Phòng ban" value={user.department} />
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Machine Tools v1.0.0</Text>
    </ScrollView>
  );
};

const ProfileRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#1677ff',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  role: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: { fontSize: 14, color: '#888' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  logoutBtn: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5222d',
  },
  logoutText: { color: '#f5222d', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 16, marginBottom: 24 },
});

export default ProfileScreen;
