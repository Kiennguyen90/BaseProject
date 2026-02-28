import React, { useState } from 'react';
import {
  Table, Button, Space, Tag, Typography, Modal, Form,
  Select, Input, Tabs,
} from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  useReturnRequests,
  useCreateReturnRequest,
  useConfirmReturn,
  useRejectReturn,
} from '../hooks/useReturnRequests';
import type { ReturnRequest, ReturnRequestListFilter } from '../types/returnRequest.types';
import { ReturnRequestStatus } from '../types/returnRequest.types';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColor: Record<number, string> = {
  [ReturnRequestStatus.Pending]: 'gold',
  [ReturnRequestStatus.Confirmed]: 'green',
  [ReturnRequestStatus.Rejected]: 'red',
  [ReturnRequestStatus.ConfirmedBroken]: 'volcano',
};

const statusLabel: Record<number, string> = {
  [ReturnRequestStatus.Pending]: 'Chờ xác nhận',
  [ReturnRequestStatus.Confirmed]: 'Đã xác nhận',
  [ReturnRequestStatus.Rejected]: 'Từ chối',
  [ReturnRequestStatus.ConfirmedBroken]: 'Hỏng',
};

const ReturnRequestListPage: React.FC = () => {
  const [filter, setFilter] = useState<ReturnRequestListFilter>({
    skipCount: 0,
    maxResultCount: 10,
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [confirmForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const { data, isLoading } = useReturnRequests(filter);
  const confirmReturn = useConfirmReturn();
  const rejectReturn = useRejectReturn();

  const openConfirm = (id: string) => {
    setSelectedId(id);
    confirmForm.resetFields();
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    const values = await confirmForm.validateFields();
    await confirmReturn.mutateAsync({
      id: selectedId,
      data: { deviceCondition: values.deviceCondition, note: values.note },
    });
    setConfirmModalOpen(false);
  };

  const openReject = (id: string) => {
    setSelectedId(id);
    rejectForm.resetFields();
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    const values = await rejectForm.validateFields();
    await rejectReturn.mutateAsync({
      id: selectedId,
      data: { reason: values.reason },
    });
    setRejectModalOpen(false);
  };

  const columns = [
    { title: 'Thiết bị', dataIndex: 'deviceName', key: 'deviceName' },
    { title: 'Nhân viên', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 90 },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag>,
    },
    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes', ellipsis: true },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      render: (_: any, record: ReturnRequest) => (
        <Space>
          {record.status === ReturnRequestStatus.Pending && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => openConfirm(record.id)} />
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => openReject(record.id)} />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Yêu cầu trả thiết bị</Title>
      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: Math.floor((filter.skipCount || 0) / (filter.maxResultCount || 10)) + 1,
          pageSize: filter.maxResultCount || 10,
          total: data?.totalCount || 0,
          onChange: (page, pageSize) =>
            setFilter((f: ReturnRequestListFilter) => ({ ...f, skipCount: (page - 1) * pageSize, maxResultCount: pageSize })),
        }}
      />

      <Modal
        title="Xác nhận trả thiết bị"
        open={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        onOk={handleConfirm}
        confirmLoading={confirmReturn.isPending}
      >
        <Form form={confirmForm} layout="vertical">
          <Form.Item name="deviceCondition" label="Tình trạng thiết bị" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Good', label: 'Tốt' },
                { value: 'Damaged', label: 'Hư hỏng' },
                { value: 'Broken', label: 'Hỏng hoàn toàn' },
              ]}
            />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Từ chối yêu cầu trả"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleReject}
        confirmLoading={rejectReturn.isPending}
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

export default ReturnRequestListPage;
