import React, { useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tag, 
  message,
  Typography,
  Divider,
  List,
  Avatar,
  Progress,
  Badge,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { history, useModel, useAccess } from '@umijs/max';
import UserDirectory from '@/components/UserDirectory';

const { Title, Text } = Typography;

const Admin: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const access = useAccess();

  useEffect(() => {
    // Check if user is logged in and has admin access
    if (!currentUser) {
      message.error('Please log in to access the admin panel');
      history.push('/user/login');
      return;
    }

    if (!access.canAdmin) {
      message.error('You do not have permission to access this page');
      history.push('/welcome');
      return;
    }
  }, [currentUser, access.canAdmin]);

  // Show loading state if not yet verified
  if (!currentUser) {
    return null;
  }

  if (!access.canAdmin) {
    return null;
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2}>Admin Dashboard</Title>
      <Text type="secondary">Welcome back, {currentUser.name}! Manage users and system settings.</Text>
      
      <Divider />

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={150}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={142}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <Tag color="green" icon={<ArrowUpOutlined />}>
                  12%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Admins"
              value={8}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={12345}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
              suffix={
                <Tag color="red" icon={<ArrowDownOutlined />}>
                  5%
                </Tag>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* User Directory */}
      <UserDirectory />
    </div>
  );
};

export default Admin;
