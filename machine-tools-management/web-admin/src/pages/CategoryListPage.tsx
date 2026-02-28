import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Typography, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDeviceCategories } from '../hooks/useDeviceCategories';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceCategoryApi } from '../api/deviceCategoryApi';
import type { DeviceCategory, CreateDeviceCategoryDto, UpdateDeviceCategoryDto } from '../types/device.types';
import { message } from 'antd';

const { Title } = Typography;

const CategoryListPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceCategory | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useDeviceCategories();

  const createMutation = useMutation({
    mutationFn: (data: CreateDeviceCategoryDto) => deviceCategoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
      message.success('Thêm danh mục thành công');
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeviceCategoryDto }) =>
      deviceCategoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
      message.success('Cập nhật danh mục thành công');
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deviceCategoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
      message.success('Xóa danh mục thành công');
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: DeviceCategory) => {
    setEditing(record);
    form.setFieldsValue({ name: record.name, description: record.description, isActive: record.isActive });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values as UpdateDeviceCategoryDto });
    } else {
      await createMutation.mutateAsync(values as CreateDeviceCategoryDto);
    }
  };

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Số thiết bị',
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: DeviceCategory) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa danh mục này?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Danh mục thiết bị</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm danh mục
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />
      <Modal
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          {editing && (
            <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryListPage;
