import { PageContainer } from '@ant-design/pro-components';
import React from 'react';
import { Card, Typography, Space } from 'antd';
import { useIntl } from '@umijs/max';
import ChatDialog from '../components/AiAssistant/ChatDialog'; // Adjust the import path as needed
import VideoTest from '../components/AiAssistant/VideoTest';

const { Title, Paragraph } = Typography;

const Welcome: React.FC = () => {
  const intl = useIntl();
  
  return (
    <PageContainer title={false}>
      <div style={{ padding: '24px' }}>
        {/* Main page content */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Title level={2}>{intl.formatMessage({ id: 'pages.welcome.title' })}</Title>
            <Paragraph>
              {intl.formatMessage({ id: 'pages.welcome.description' })}
            </Paragraph>
            <Paragraph>
              {intl.formatMessage({ id: 'pages.welcome.chatInfo' })}
            </Paragraph>
          </Card>

          <Card title={intl.formatMessage({ id: 'pages.welcome.chatFeatures.title' })}>
            <ul>
              <li>{intl.formatMessage({ id: 'pages.welcome.chatFeatures.textMessages' })}</li>
              <li>{intl.formatMessage({ id: 'pages.welcome.chatFeatures.fileUpload' })}</li>
              <li>{intl.formatMessage({ id: 'pages.welcome.chatFeatures.messageHistory' })}</li>
              <li>{intl.formatMessage({ id: 'pages.welcome.chatFeatures.autoScroll' })}</li>
              <li>{intl.formatMessage({ id: 'pages.welcome.chatFeatures.modalWindow' })}</li>
            </ul>
          </Card>
        </Space>
        {/* Чат-диалог - теперь это всего одна строка! */}
        <ChatDialog/>
      </div>
    </PageContainer>
  );
};



export default Welcome;