import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { PhoneOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.phone, values.password);
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.error?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    message.info('Google Login chưa được cấu hình trên web');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }} size="small">
          <Title level={2} style={{ marginBottom: 0 }}>Machine Tools</Title>
          <Text type="secondary">Quản lý thiết bị & máy móc</Text>
        </Space>
        <Form name="login" onFinish={onFinish} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <Divider>hoặc</Divider>
        <Button icon={<GoogleOutlined />} block size="large" onClick={handleGoogleLogin}>
          Đăng nhập với Google
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage;
