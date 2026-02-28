import React, { useState } from 'react';
import {
  Table, Button, Space, Tag, Typography, Modal, Form,
  Input, Select, Switch, Popconfirm, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SafetyOutlined, CheckCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useSetUserRoles,
} from '../hooks/useUsers';
import type {
  UserListItem,
  CreateUserDto,
  UpdateUserDto,
  UserListFilter,
} from '../types/user.types';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { Search } = Input;

const AVAILABLE_ROLES = ['Admin', 'Manager', 'Employee'];

const UserListPage: React.FC = () => {
  const [filter, setFilter] = useState<UserListFilter>({
    skipCount: 0,
    maxResultCount: 10,
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  const { user: currentUser } = useAuth();
  const { data, isLoading } = useUsers(filter);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const setUserRoles = useSetUserRoles();

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    await createUser.mutateAsync(values as CreateUserDto);
    setCreateModalOpen(false);
    createForm.resetFields();
  };

  const openEdit = (record: UserListItem) => {
    setSelectedUser(record);
    editForm.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      employeeCode: record.employeeCode,
      department: record.department,
      isActive: record.isActive,
    });
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    const values = await editForm.validateFields();
    await updateUser.mutateAsync({ id: selectedUser.id, data: values as UpdateUserDto });
    setEditModalOpen(false);
  };

  const openRoles = (record: UserListItem) => {
    setSelectedUser(record);
    roleForm.setFieldsValue({ roleNames: record.roles });
    setRoleModalOpen(true);
  };

  const handleSetRoles = async () => {
    if (!selectedUser) return;
    const values = await roleForm.validateFields();
    await setUserRoles.mutateAsync({ id: selectedUser.id, roleNames: values.roleNames });
    setRoleModalOpen(false);
  };

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'userName',
      key: 'userName',
      width: 140,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'SĐT',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 130,
    },
    {
      title: 'Mã NV',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 100,
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      width: 180,
      render: (roles: string[]) => (
        <Space size={4} wrap>
          {roles?.map((r) => (
            <Tag key={r} color={r === 'Admin' ? 'red' : r === 'Manager' ? 'blue' : 'default'}>
              {r}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'} icon={active ? <CheckCircleOutlined /> : <StopOutlined />}>
          {active ? 'Hoạt động' : 'Khóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: UserListItem) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Phân vai trò">
            <Button type="link" icon={<SafetyOutlined />} onClick={() => openRoles(record)} />
          </Tooltip>
          {record.id !== currentUser?.id && (
            <Popconfirm title="Xóa người dùng này?" onConfirm={() => deleteUser.mutate(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý người dùng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateModalOpen(true); }}>
          Thêm người dùng
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Tìm kiếm theo tên, email, SĐT..."
          allowClear
          style={{ width: 300 }}
          onSearch={(value) => setFilter((f) => ({ ...f, filter: value, skipCount: 0 }))}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 140 }}
          onChange={(v) => setFilter((f) => ({ ...f, isActive: v, skipCount: 0 }))}
          options={[
            { value: true, label: 'Hoạt động' },
            { value: false, label: 'Đã khóa' },
          ]}
        />
        <Select
          placeholder="Vai trò"
          allowClear
          style={{ width: 140 }}
          onChange={(v) => setFilter((f) => ({ ...f, role: v, skipCount: 0 }))}
          options={AVAILABLE_ROLES.map((r) => ({ value: r, label: r }))}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: Math.floor((filter.skipCount || 0) / (filter.maxResultCount || 10)) + 1,
          pageSize: filter.maxResultCount || 10,
          total: data?.totalCount || 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          onChange: (page, pageSize) =>
            setFilter((f) => ({ ...f, skipCount: (page - 1) * pageSize, maxResultCount: pageSize })),
        }}
      />

      {/* Create User Modal */}
      <Modal
        title="Thêm người dùng"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={createUser.isPending}
        width={520}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="userName" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="employeeCode" label="Mã nhân viên">
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Phòng ban">
            <Input />
          </Form.Item>
          <Form.Item name="roleNames" label="Vai trò" initialValue={['Employee']}>
            <Select mode="multiple" options={AVAILABLE_ROLES.map((r) => ({ value: r, label: r }))} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Sửa người dùng"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEdit}
        confirmLoading={updateUser.isPending}
        width={520}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="fullName" label="Họ tên">
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="employeeCode" label="Mã nhân viên">
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Phòng ban">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        title={`Phân vai trò – ${selectedUser?.fullName || ''}`}
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        onOk={handleSetRoles}
        confirmLoading={setUserRoles.isPending}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item name="roleNames" label="Vai trò" rules={[{ required: true }]}>
            <Select mode="multiple" options={AVAILABLE_ROLES.map((r) => ({ value: r, label: r }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserListPage;
