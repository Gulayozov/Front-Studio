import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Drawer,
  Checkbox,
  Dropdown,
  Menu,
  Tag,
  Typography,
  Tooltip,
  Row,
  Col,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { request } from '@umijs/max';
import { getAuthHeaders } from '@/services/ant-design-pro/api';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// User type definition
export interface User {
  id: number;
  login: string; // email
  name: string;
  role: string;
  created_dt?: string;
  updated_dt?: string;
  deleted_dt?: string | null;
}

// Directory configuration props
export interface UserDirectoryConfig {
  entityName?: string;
  entityAttributes?: string[];
  apiEndpoint?: string;
  columns?: ColumnsType<User>;
  onUserSelect?: (selectedUsers: User[]) => void;
  embedded?: boolean;
  embeddedField?: string;
}

interface UserDirectoryProps {
  config?: UserDirectoryConfig;
}

const UserDirectory: React.FC<UserDirectoryProps> = ({ config }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<any>({});

  // Default columns configuration
  const defaultColumns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
      fixed: 'left',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: true,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'login',
      key: 'login',
      width: 250,
      sorter: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_dt',
      key: 'created_dt',
      width: 180,
      sorter: true,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Updated',
      dataIndex: 'updated_dt',
      key: 'updated_dt',
      width: 180,
      sorter: true,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.deleted_dt ? 'default' : 'success'}>
          {record.deleted_dt ? 'Deleted' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="export">
                  <ExportOutlined /> Export Data
                </Menu.Item>
                <Menu.Item key="related">
                  Related Entities
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="advanced">
                  Advanced Options
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button type="link" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Use config columns or default
  const columns = config?.columns || defaultColumns;

  // Fetch users from API
  const fetchUsers = async (params: any = {}) => {
    setLoading(true);
    try {
      const authHeaders = getAuthHeaders();
      type UserListResponse = { data: User[]; total?: number } | User[];
      const response = await request<UserListResponse>('/api/v1/users', {
        method: 'GET',
        params: {
          page: params.current || 1,
          size: params.pageSize || 10,
          ...params,
        },
        headers: authHeaders,
      });

      if (Array.isArray(response)) {
        setUsers(response);
        setTotal(response.length);
      } else if (response && 'data' in response) {
        setUsers(response.data);
        setTotal(response.total ?? response.data.length);
      } else {
        // Fallback to mock data if API fails
        setUsers(getMockUsers());
        setTotal(getMockUsers().length);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
      // Use mock data as fallback
      setUsers(getMockUsers());
      setTotal(getMockUsers().length);
    } finally {
      setLoading(false);
    }
  };

  // Mock data generator
  const getMockUsers = (): User[] => {
    const mockUsers: User[] = [];
    for (let i = 1; i <= 50; i++) {
      mockUsers.push({
        id: i,
        login: `user${i}@example.com`,
        name: `User ${i}`,
        role: i % 5 === 0 ? 'admin' : 'user',
        created_dt: new Date(2024, 0, i).toISOString(),
        updated_dt: new Date(2024, 0, i + 10).toISOString(),
        deleted_dt: null,
      });
    }
    return mockUsers;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle table changes (pagination, sorting, filtering)
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    fetchUsers({
      current: pagination.current,
      pageSize: pagination.pageSize,
      filters,
      sorter,
    });
  };

  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    try {
      const authHeaders = getAuthHeaders();
      await request(`/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  // Handle view user details
  const handleViewUser = (user: User) => {
    Modal.info({
      title: 'User Details',
      width: 600,
      content: (
        <div style={{ padding: '20px 0' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>ID:</Text> {user.id}
            </Col>
            <Col span={12}>
              <Text strong>Name:</Text> {user.name}
            </Col>
            <Col span={12}>
              <Text strong>Email:</Text> {user.login}
            </Col>
            <Col span={12}>
              <Text strong>Role:</Text> <Tag color={user.role === 'admin' ? 'red' : 'blue'}>{user.role}</Tag>
            </Col>
            <Col span={12}>
              <Text strong>Created:</Text> {user.created_dt ? new Date(user.created_dt).toLocaleString() : '-'}
            </Col>
            <Col span={12}>
              <Text strong>Updated:</Text> {user.updated_dt ? new Date(user.updated_dt).toLocaleString() : '-'}
            </Col>
          </Row>
        </div>
      ),
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const authHeaders = getAuthHeaders();
      
      if (editingUser) {
        // Update existing user
        await request(`/api/v1/users/${editingUser.id}`, {
          method: 'PUT',
          headers: authHeaders,
          data: values,
        });
        message.success('User updated successfully');
      } else {
        // Create new user
        await request('/api/v1/users', {
          method: 'POST',
          headers: authHeaders,
          data: values,
        });
        message.success('User created successfully');
      }
      
      setIsModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields correctly');
      } else {
        message.error('Failed to save user');
      }
    }
  };

  // Handle row selection
  const handleRowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], selectedRows: User[]) => {
      setSelectedRowKeys(keys);
      setSelectedUsers(selectedRows);
      if (config?.onUserSelect) {
        config.onUserSelect(selectedRows);
      }
    },
    getCheckboxProps: (record: User) => ({
      disabled: false,
      name: record.name,
    }),
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const authHeaders = getAuthHeaders();
      await Promise.all(
        selectedRowKeys.map((key) =>
          request(`/api/v1/users/${key}`, {
            method: 'DELETE',
            headers: authHeaders,
          })
        )
      );
      message.success(`Deleted ${selectedRowKeys.length} users successfully`);
      setSelectedRowKeys([]);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting users:', error);
      message.error('Failed to delete users');
    }
  };

  // Column settings
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const visibleColumnsData = visibleColumns.length > 0
    ? columns.filter((col) => visibleColumns.includes(col.key as string))
    : columns;

  return (
    <Card
      title={config?.entityName || 'User Directory'}
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchUsers()}
          >
            Refresh
          </Button>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerVisible(true)}
          >
            Filters
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setColumnSettingsVisible(true)}
          >
            Columns
          </Button>
          <Popconfirm
            title="Are you sure you want to delete selected users?"
            onConfirm={handleBulkDelete}
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              danger
              disabled={selectedRowKeys.length === 0}
              icon={<DeleteOutlined />}
            >
              Delete Selected
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Space>
      }
    >
      <Table
        columns={visibleColumnsData}
        dataSource={users}
        rowKey="id"
        loading={loading}
        rowSelection={handleRowSelection}
        pagination={{
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} users`,
        }}
        scroll={{ x: 1200 }}
        onChange={handleTableChange}
      />

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="login"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Filter Drawer */}
      <Drawer
        title="Filters"
        placement="right"
        width={400}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
      >
        <Form layout="vertical">
          <Form.Item label="Search by Name">
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item label="Search by Email">
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item label="Role">
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status">
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="deleted">Deleted</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" block onClick={() => setFilterDrawerVisible(false)}>
              Apply Filters
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Column Settings Drawer */}
      <Drawer
        title="Column Settings"
        placement="right"
        width={300}
        onClose={() => setColumnSettingsVisible(false)}
        open={columnSettingsVisible}
      >
        <Form layout="vertical">
          {columns.map((column) => (
            <Form.Item key={column.key as string}>
              <Checkbox
                checked={visibleColumns.length === 0 || visibleColumns.includes(column.key as string)}
                onChange={() => toggleColumnVisibility(column.key as string)}
              >
                {column.title as string}
              </Checkbox>
            </Form.Item>
          ))}
        </Form>
      </Drawer>
    </Card>
  );
};

export default UserDirectory;

