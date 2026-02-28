import React, { useState } from 'react';
import {
  Table, Button, Space, Tag, Typography, Modal, Form,
  Select, DatePicker, Input, InputNumber, Tabs,
} from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import {
  useBorrowRequests,
  usePendingBorrowRequests,
  useOverdueBorrowRequests,
  useCreateBorrowRequest,
  useApproveBorrowRequest,
  useRejectBorrowRequest,
} from '../hooks/useBorrowRequests';
import { useAvailableDevices } from '../hooks/useDevices';
import type { BorrowRequest, CreateBorrowRequestDto, BorrowRequestListFilter } from '../types/borrowRequest.types';
import { BorrowRequestStatus } from '../types/borrowRequest.types';
import type { Device } from '../types/device.types';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColor: Record<number, string> = {
  [BorrowRequestStatus.Pending]: 'gold',
  [BorrowRequestStatus.Approved]: 'green',
  [BorrowRequestStatus.Rejected]: 'red',
  [BorrowRequestStatus.Returned]: 'blue',
  [BorrowRequestStatus.Overdue]: 'volcano',
};

const statusLabel: Record<number, string> = {
  [BorrowRequestStatus.Pending]: 'Chờ duyệt',
  [BorrowRequestStatus.Approved]: 'Đã duyệt',
  [BorrowRequestStatus.Rejected]: 'Từ chối',
  [BorrowRequestStatus.Returned]: 'Đã trả',
  [BorrowRequestStatus.Overdue]: 'Quá hạn',
};

const BorrowRequestListPage: React.FC = () => {
  const [filter, setFilter] = useState<BorrowRequestListFilter>({ skipCount: 0, maxResultCount: 10 });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const { data: allData, isLoading } = useBorrowRequests(filter);
  const { data: pendingData } = usePendingBorrowRequests();
  const { data: overdueData } = useOverdueBorrowRequests();
  const { data: availableDevices } = useAvailableDevices();
  const createBorrow = useCreateBorrowRequest();
  const approveBorrow = useApproveBorrowRequest();
  const rejectBorrow = useRejectBorrowRequest();

  const handleCreate = async () => {
    const values = await form.validateFields();
    await createBorrow.mutateAsync({
      ...values,
      expectedReturnDate: values.expectedReturnDate?.toISOString(),
    } as CreateBorrowRequestDto);
    setCreateModalOpen(false);
    form.resetFields();
  };

  const handleApprove = (id: string) => {
    approveBorrow.mutate({ id, data: { notes: '' } });
  };

  const handleReject = async () => {
    const values = await rejectForm.validateFields();
    await rejectBorrow.mutateAsync({ id: selectedId, data: { reason: values.reason } });
    setRejectModalOpen(false);
    rejectForm.resetFields();
  };

  const openReject = (id: string) => {
    setSelectedId(id);
    rejectForm.resetFields();
    setRejectModalOpen(true);
  };

  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'expectedReturnDate',
      key: 'expectedReturnDate',
      render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      render: (_: any, record: BorrowRequest) => (
        <Space>
          {record.status === BorrowRequestStatus.Pending && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)} />
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => openReject(record.id)} />
            </>
          )}
        </Space>
      ),
    },
  ];

  const currentData =
    activeTab === 'pending' ? pendingData :
    activeTab === 'overdue' ? overdueData :
    allData;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Yêu cầu mượn</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          Tạo yêu cầu mượn
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'all', label: `Tất cả (${allData?.totalCount || 0})` },
          { key: 'pending', label: `Chờ duyệt (${pendingData?.totalCount || 0})` },
          { key: 'overdue', label: `Quá hạn (${overdueData?.totalCount || 0})` },
        ]}
      />

      <Table
        columns={columns}
        dataSource={currentData?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: Math.floor((filter.skipCount || 0) / (filter.maxResultCount || 10)) + 1,
          pageSize: filter.maxResultCount || 10,
          total: currentData?.totalCount || 0,
          onChange: (page, pageSize) =>
            setFilter((f: BorrowRequestListFilter) => ({ ...f, skipCount: (page - 1) * pageSize, maxResultCount: pageSize })),
        }}
      />

      {/* Create Modal */}
      <Modal
        title="Tạo yêu cầu mượn"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={createBorrow.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="deviceId" label="Thiết bị" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Chọn thiết bị"
              optionFilterProp="label"
              options={(availableDevices?.items || []).map((d: Device) => ({
                value: d.id,
                label: `${d.code} - ${d.name}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expectedReturnDate" label="Ngày trả dự kiến" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="purpose" label="Mục đích">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleReject}
        confirmLoading={rejectBorrow.isPending}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item name="reason" label="Lý do từ chối" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BorrowRequestListPage;
