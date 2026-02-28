import React, { useState } from 'react';
import { Table, Tag, Typography, Select, DatePicker, Space, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTransactions } from '../hooks/useTransactions';
import type { TransactionFilter } from '../types/transaction.types';
import { TransactionType } from '../types/transaction.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const typeColor: Record<number, string> = {
  [TransactionType.Borrow]: 'blue',
  [TransactionType.Return]: 'green',
  [TransactionType.MarkBroken]: 'red',
  [TransactionType.Consume]: 'orange',
  [TransactionType.Maintenance]: 'purple',
  [TransactionType.Retire]: 'default',
};

const typeLabel: Record<number, string> = {
  [TransactionType.Borrow]: 'Mượn',
  [TransactionType.Return]: 'Trả',
  [TransactionType.MarkBroken]: 'Báo hỏng',
  [TransactionType.Consume]: 'Tiêu hao',
  [TransactionType.Maintenance]: 'Bảo trì',
  [TransactionType.Retire]: 'Thanh lý',
};

const TransactionHistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<TransactionFilter>({
    skipCount: 0,
    maxResultCount: 20,
  });

  const { data, isLoading } = useTransactions(filter);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'creationTime',
      key: 'creationTime',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm'),
      width: 160,
    },
    { title: 'Thiết bị', dataIndex: 'deviceName', key: 'deviceName' },
    { title: 'Nhân viên', dataIndex: 'employeeName', key: 'employeeName' },
    {
      title: 'Loại',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (t: number) => <Tag color={typeColor[t]}>{typeLabel[t]}</Tag>,
      width: 120,
    },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 90 },
    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  return (
    <div>
      <Title level={3}>Lịch sử giao dịch</Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 250 }}
          onChange={(e) => setFilter((f: TransactionFilter) => ({ ...f, filter: e.target.value, skipCount: 0 }))}
        />
        <Select
          placeholder="Loại giao dịch"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setFilter((f: TransactionFilter) => ({ ...f, transactionType: v, skipCount: 0 }))}
          options={Object.entries(typeLabel).map(([k, v]) => ({ value: Number(k), label: v }))}
        />
        <RangePicker
          format="DD/MM/YYYY"
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setFilter((f: TransactionFilter) => ({
                ...f,
                fromDate: dates[0]!.toISOString(),
                toDate: dates[1]!.toISOString(),
                skipCount: 0,
              }));
            } else {
              setFilter((f: TransactionFilter) => ({ ...f, fromDate: undefined, toDate: undefined, skipCount: 0 }));
            }
          }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: Math.floor((filter.skipCount || 0) / (filter.maxResultCount || 20)) + 1,
          pageSize: filter.maxResultCount || 20,
          total: data?.totalCount || 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          onChange: (page, pageSize) =>
            setFilter((f: TransactionFilter) => ({ ...f, skipCount: (page - 1) * pageSize, maxResultCount: pageSize })),
        }}
      />
    </div>
  );
};

export default TransactionHistoryPage;
