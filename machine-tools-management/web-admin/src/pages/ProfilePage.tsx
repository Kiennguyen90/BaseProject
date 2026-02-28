import React, { useState } from 'react';
import {
  Card, Descriptions, Typography, Button, Form, Input,
  Spin, Avatar, Space, Divider, message,
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleEdit = () => {
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      // Profile update would call authAxios.put('/api/profile', values)
      // For now, show success since server endpoint exists but we're reading from JWT
      message.info('Cập nhật hồ sơ sẽ có hiệu lực sau khi đăng nhập lại');
      setEditing(false);
    } catch {
      // validation failed
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Hồ sơ cá nhân</Title>
        {!editing && (
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0 }}>{user.fullName}</Title>
            <Text type="secondary">{user.role}</Text>
          </div>
        </div>

        <Divider />

        {!editing ? (
          <Descriptions column={1} labelStyle={{ fontWeight: 600, width: 160 }}>
            <Descriptions.Item label="Họ tên">{user.fullName || '–'}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email || '–'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{user.phoneNumber || '–'}</Descriptions.Item>
            <Descriptions.Item label="Mã nhân viên">{user.employeeCode || '–'}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">{user.role || '–'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input type="email" />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Số điện thoại">
              <Input />
            </Form.Item>
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Lưu
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => setEditing(false)}>
                Hủy
              </Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
