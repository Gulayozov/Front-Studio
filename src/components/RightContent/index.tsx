 import { QuestionCircleOutlined, TranslationOutlined } from '@ant-design/icons';
import { SelectLang as UmiSelectLang } from '@umijs/max';
import { Dropdown, Button } from 'antd';
import { useIntl, setLocale, getLocale } from '@umijs/max';
import React from 'react';

export type SiderTheme = 'light' | 'dark';

export const SelectLang = () => {
  const intl = useIntl();
  const currentLocale = getLocale();

  const languageOptions = [
    {
      key: 'en-US',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🇺🇸 English
        </div>
      ),
    },
    {
      key: 'ru-RU',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🇷🇺 Русский
        </div>
      ),
    },
    {
      key: 'tj-TJ',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🇹🇯 Тоҷикӣ
        </div>
      ),
    },
  ];

  const handleLanguageChange = ({ key }: { key: string }) => {
    setLocale(key, false);
  };

  return (
    <Dropdown
      menu={{
        items: languageOptions,
        onClick: handleLanguageChange,
        selectedKeys: [currentLocale],
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={<TranslationOutlined />}
        style={{
          padding: '4px 8px',
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          boxShadow: 'none',
          borderRadius: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      />
    </Dropdown>
  );
};

export const Question = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://pro.ant.design/docs/getting-started');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};
