import { outLogin, tokenStorage, userStorage, emailStorage } from '@/services/ant-design-pro/api';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Spin } from 'antd';
import type { MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { flushSync } from 'react-dom';
import { useIntl } from '@umijs/max';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  
  // Show appropriate name based on user state
  if (!currentUser) {
    return <span className="anticon">Loading...</span>;
  }
  
  if (currentUser.userid === 'unknown') {
    return <span className="anticon">Unknown User</span>;
  }
  
  if (currentUser.userid === 'id_required') {
    return <span className="anticon">{currentUser?.name}</span>;
  }
  
  if (currentUser.userid === 'api_error') {
    return <span className="anticon">{currentUser?.name}</span>;
  }
  
  return <span className="anticon">{currentUser?.name}</span>;
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
  const intl = useIntl();
  
  /**
   * Logout and save the current url
   */
  const loginOut = async () => {
    await outLogin();
    
    // Clear stored tokens and user data
    tokenStorage.remove();
    userStorage.remove();
    emailStorage.remove();
    
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    const searchParams = new URLSearchParams({
      redirect: pathname + search,
    });
    /** This method will jump to the location specified by the redirect parameter */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: searchParams.toString(),
      });
    }
  };
  const { styles } = useStyles();

  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      loginOut();
      return;
    }
    if (key === 'profile') {
      history.push('/user/profile');
      return;
    }
    history.push(`/account/${key}`);
  };

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  const menuItems = [
    {      key: 'profile',
      icon: <UserOutlined />,
      label: intl.formatMessage({ id: 'component.avatarDropdown.personalProfile' }),
    },
    ...(menu
      ? [
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: intl.formatMessage({ id: 'component.avatarDropdown.personalSettings' }),
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: intl.formatMessage({ id: 'component.avatarDropdown.logout' }),
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};