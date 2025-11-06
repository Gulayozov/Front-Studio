import { getCurrentUserFromToken, updateGlobalUserState } from '@/services/ant-design-pro/api';
import { Card, Descriptions, Spin, Typography, Avatar, Tag, Space, message } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, CrownOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useNavigate, useModel, useIntl } from '@umijs/max';

const { Title, Text } = Typography;

interface UserProfileData {
  id: number;
  login: string;
  name: string;
  role: string;
  created_dt: string;
  updated_dt: string;
}

const UserProfile: React.FC = () => {
  const intl = useIntl();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  
  // Get the global state setter to update the header
  const { setInitialState } = useModel('@@initialState');

  // Function to update global state with user info
  const updateGlobalUserStateLocal = (userInfo: UserProfileData) => {
    const currentUser = updateGlobalUserState(userInfo);
    setInitialState((prevState) => ({
      ...prevState,
      currentUser,
    }));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Profile page: Fetching user profile using JWT token');
        const userInfo = await getCurrentUserFromToken();
        console.log('Profile page: User info received:', userInfo);
        setUserData(userInfo);
        
        // Update global state so header shows the user name immediately
        updateGlobalUserStateLocal(userInfo);
        
        // Show success message for automatic profile loading
        message.success('Profile loaded automatically!');
      } catch (err: any) {
        console.error('Profile page: Error fetching user profile:', err);
        setError(err?.message || 'Failed to load user profile. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);





  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Text type="secondary">{intl.formatMessage({ id: 'pages.userProfile.loading' })}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {intl.formatMessage({ id: 'pages.userProfile.loadingSubtext' })}
          </Text>
        </div>
      </div>
    );
  }



  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', color: 'red' }}>
            <Text type="danger">{error}</Text>
            <br />
            <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/login')}>
              {intl.formatMessage({ id: 'pages.userProfile.clickToLogin' })}
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">{intl.formatMessage({ id: 'pages.userProfile.noUserData' })}</Text>
          </div>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'user':
        return 'blue';
      case 'moderator':
        return 'orange';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            style={{ marginBottom: '16px' }}
          />
          <Title level={2}>{userData.name}</Title>
          <Space>
            <Tag color={getRoleColor(userData.role)} icon={<CrownOutlined />}>
              {userData.role}
            </Tag>
          </Space>
        </div>

        <Descriptions title={intl.formatMessage({ id: 'pages.userProfile.userInformation' })} bordered column={1}>
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.userProfile.userId' })}>
            <Text code>{userData.id}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.userProfile.email' })}>
            <Space>
              <MailOutlined />
              <Text>{userData.login}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.userProfile.name' })}>
            <Space>
              <UserOutlined />
              <Text strong>{userData.name}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.userProfile.role' })}>
            <Tag color={getRoleColor(userData.role)}>
              {userData.role}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.userProfile.accountCreated' })}>
            <Space>
              <CalendarOutlined />
              <Text>{formatDate(userData.created_dt)}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label={intl.formatMessage({ id: 'pages.userProfile.lastUpdated' })}>
            <Space>
              <CalendarOutlined />
              <Text>{formatDate(userData.updated_dt)}</Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserProfile;
