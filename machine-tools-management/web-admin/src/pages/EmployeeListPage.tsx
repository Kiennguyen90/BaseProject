import React, { useState } from 'react';
import { Table, Typography, Input, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useUsers } from '../hooks/useUsers';
import type { UserListFilter, UserListItem } from '../types/user.types';

const { Title } = Typography;

const EmployeeListPage: React.FC = () => {
  const [filter, setFilter] = useState<UserListFilter>({
    skipCount: 0,
    maxResultCount: 20,
    role: 'Employee',
    isActive: true,
  });

  const { data, isLoading } = useUsers(filter);

  return (
    <div>
      <Title level={3}>Danh sách nhân viên</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm nhân viên..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 300 }}
          onChange={(e) => setFilter((f) => ({ ...f, filter: e.target.value || undefined, skipCount: 0 }))}
        />
      </Space>
      <Table
        columns={[
          { title: 'Mã NV', dataIndex: 'employeeCode', key: 'employeeCode', width: 120 },
          { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 130 },
          {
            title: 'Phòng ban',
            dataIndex: 'department',
            key: 'department',
            render: (v: string) => v || '–',
          },
          {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (active: boolean) => (
              <Tag color={active ? 'green' : 'default'}>{active ? 'Hoạt động' : 'Ngưng'}</Tag>
            ),
          },
        ]}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: Math.floor((filter.skipCount || 0) / (filter.maxResultCount || 20)) + 1,
          pageSize: filter.maxResultCount || 20,
          total: data?.totalCount || 0,
          onChange: (page, pageSize) =>
            setFilter((f) => ({ ...f, skipCount: (page - 1) * pageSize, maxResultCount: pageSize })),
        }}
      />
    </div>
  );
};

export default EmployeeListPage;
