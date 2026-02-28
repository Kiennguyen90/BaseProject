import React, { useState } from 'react';
import {
  Table, Button, Space, Tag, Input, Select, Modal, Form,
  InputNumber, Typography, Popconfirm, Upload, Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { useDevices, useCreateDevice, useUpdateDevice, useDeleteDevice } from '../hooks/useDevices';
import { useDeviceCategories } from '../hooks/useDeviceCategories';
import type { Device, DeviceCategory, CreateDeviceDto, UpdateDeviceDto, DeviceListFilter } from '../types/device.types';
import { DeviceType, DeviceStatus } from '../types/device.types';
import dayjs from 'dayjs';

const { Title } = Typography;

const deviceStatusColor: Record<number, string> = {
  [DeviceStatus.Available]: 'green',
  [DeviceStatus.Borrowed]: 'orange',
  [DeviceStatus.Broken]: 'red',
  [DeviceStatus.UnderMaintenance]: 'blue',
  [DeviceStatus.Retired]: 'default',
};

const deviceStatusLabel: Record<number, string> = {
  [DeviceStatus.Available]: 'Sẵn sàng',
  [DeviceStatus.Borrowed]: 'Đang mượn',
  [DeviceStatus.Broken]: 'Hỏng',
  [DeviceStatus.UnderMaintenance]: 'Bảo trì',
  [DeviceStatus.Retired]: 'Thanh lý',
};

const deviceTypeLabel: Record<number, string> = {
  [DeviceType.BorrowReturn]: 'Mượn-Trả',
  [DeviceType.Consumable]: 'Tiêu hao',
};

const DeviceListPage: React.FC = () => {
  const [filter, setFilter] = useState<DeviceListFilter>({ skipCount: 0, maxResultCount: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useDevices(filter);
  const { data: categoriesData } = useDeviceCategories();
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const deleteDevice = useDeleteDevice();

  const categories = categoriesData?.items || [];

  const openCreate = () => {
    setEditingDevice(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Device) => {
    setEditingDevice(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description,
      categoryId: record.categoryId,
      deviceType: record.deviceType,
      totalQuantity: record.totalQuantity,
      location: record.location,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingDevice) {
      await updateDevice.mutateAsync({ id: editingDevice.id, data: values as UpdateDeviceDto });
    } else {
      await createDevice.mutateAsync(values as CreateDeviceDto);
    }
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Loại',
      dataIndex: 'deviceType',
      key: 'deviceType',
      render: (type: number) => deviceTypeLabel[type] || type,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={deviceStatusColor[status]}>{deviceStatusLabel[status] || status}</Tag>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: any, record: Device) => `${record.availableQuantity}/${record.totalQuantity}`,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: Device) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa thiết bị này?" onConfirm={() => deleteDevice.mutate(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý thiết bị</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm thiết bị
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => setFilter((f: DeviceListFilter) => ({ ...f, filter: e.target.value, skipCount: 0 }))}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setFilter((f: DeviceListFilter) => ({ ...f, status: v, skipCount: 0 }))}
          options={Object.entries(deviceStatusLabel).map(([k, v]) => ({ value: Number(k), label: v }))}
        />
        <Select
          placeholder="Loại thiết bị"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setFilter((f: DeviceListFilter) => ({ ...f, deviceType: v, skipCount: 0 }))}
          options={Object.entries(deviceTypeLabel).map(([k, v]) => ({ value: Number(k), label: v }))}
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
          onChange: (page, pageSize) =>
            setFilter((f: DeviceListFilter) => ({ ...f, skipCount: (page - 1) * pageSize, maxResultCount: pageSize })),
        }}
      />

      <Modal
        title={editingDevice ? 'Sửa thiết bị' : 'Thêm thiết bị'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createDevice.isPending || updateDevice.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên thiết bị" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Mã thiết bị" rules={[{ required: true }]}>
            <Input disabled={!!editingDevice} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn danh mục"
              options={categories.map((c: DeviceCategory) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item name="deviceType" label="Loại" rules={[{ required: true }]}>
            <Select
              options={Object.entries(deviceTypeLabel).map(([k, v]) => ({ value: Number(k), label: v }))}
            />
          </Form.Item>
          <Form.Item name="totalQuantity" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="location" label="Vị trí">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceListPage;
