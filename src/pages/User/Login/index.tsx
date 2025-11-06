import { login, signup, tokenStorage, userStorage, emailStorage, updateGlobalUserState } from '@/services/ant-design-pro/api';
import {
  AlipayCircleOutlined,
  LockOutlined,
  UserOutlined,
  TaobaoCircleOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, Helmet, history, useIntl, useModel } from '@umijs/max';
import { SelectLang } from '@/components';
import { Alert, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
// Import useNavigate from UmiJS
import { useNavigate } from '@umijs/max';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 48,
      height: 48,
      lineHeight: '48px',
      position: 'fixed',
      top: 16,
      right: 'calc(50% - 300px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: token.borderRadius,
      cursor: 'pointer',
      zIndex: 1000,
      transition: 'background-color 0.2s ease',
      backgroundColor: 'transparent',
      ':hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
      },
      '& :global(.ant-btn)': {
        height: 36,
        padding: '6px 10px',
        fontSize: 18,
        boxShadow: 'none',
      },
      '& :global(.ant-btn:hover)': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)'
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();

  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

// Types based on backend API specification
interface LoginFormValues {
  login: string;
  password: string;
  autoLogin?: boolean;
}

interface SignupFormValues {
  login: string;
  name: string;
  password: string;
}

const Login: React.FC = () => {
  // Add navigate hook at the top of component
  const navigate = useNavigate();
  
  const [type, setType] = useState<string>('account');
  const [loginError, setLoginError] = useState<string>('');
  const [signupError, setSignupError] = useState<string>('');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      console.log('1. Starting login process...');
      setLoginError('');
      
      console.log('2. Sending login request...', values);
      const response = await login({
        login: values.login,
        password: values.password,
      });

      console.log('3. Login response received:', response);
      
      tokenStorage.set(response.access_token);
      console.log('4. Token stored:', tokenStorage.get());

      // Store email for later use
      console.log('5. Storing email for later use...');
      emailStorage.set(values.login);
      console.log('6. Email stored:', values.login);
      
      // Now that we have the token, automatically fetch user info using the new /me endpoint
      console.log('7. Fetching user info using JWT token...');
      
      try {
        // Import getCurrentUserFromToken function
        const { getCurrentUserFromToken } = await import('@/services/ant-design-pro/api');
        const userInfo = await getCurrentUserFromToken();
        
        // Update global state with user info so header shows immediately
        const currentUser = updateGlobalUserState(userInfo);
        
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser,
          }));
        });
        
        console.log('8. Global state updated with user info from JWT token');
      } catch (fetchError) {
        console.error('Error fetching user info after login:', fetchError);
        // Continue with login even if user info fetch fails
        // The user can still access the app and the profile page will handle this
      }

      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: 'Login successful!',
      });
      message.success(defaultLoginSuccessMessage);
      console.log('10. Success message displayed');
      
      console.log('11. About to redirect...');
      
      const urlParams = new URL(window.location.href).searchParams;
      const redirectPath = urlParams.get('redirect') || '/welcome';
      console.log('Redirecting to:', redirectPath);
      window.location.replace(redirectPath);

      
    } catch (error: any) {
      console.error('Login error:', error); // This should show any errors
      
      const errorMessage = error?.data?.detail || error?.message || intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: 'Login failed, please try again!',
      });
      
      setLoginError(errorMessage);
      message.error(errorMessage);
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    try {
      setSignupError('');
      
      // Send signup request with only required fields
      const result = await signup({
        login: values.login,
        name: values.name,
        password: values.password,
      });

      // Store user ID and email immediately after signup
      userStorage.set(result.id);
      emailStorage.set(values.login);
      console.log('Signup successful - User ID stored:', result.id, 'Email stored:', values.login);

      // Also update the initial state with user info so it's immediately available
      const currentUser = {
        name: result.name,
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
        userid: result.id.toString(),
        email: result.login,
        signature: 'New User',
        title: 'User',
        group: 'Default Group',
        tags: [
          { key: '0', label: 'New User' },
          { key: '1', label: 'Active' },
        ],
        notifyCount: 0,
        unreadCount: 0,
        country: 'Unknown',
        access: 'user',
        geographic: {
          province: { label: 'Unknown', key: '000000' },
          city: { label: 'Unknown', key: '000000' },
        },
        address: 'Unknown',
        phone: 'Unknown',
      };
      
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser,
        }));
      });

      message.success(
        intl.formatMessage({
          id: 'pages.signup.success',
          defaultMessage: 'Registration successful! User information has been automatically loaded',
        }),
      );

      // Switch to login tab after successful registration
      setType('account');
      console.log('Signup successful:', result);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle backend error response
      const errorMessage = error?.data?.detail || error?.message || intl.formatMessage({
        id: 'pages.signup.failure',
        defaultMessage: 'Registration failed!',
      });
      
      setSignupError(errorMessage);
      message.error(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: 'Login Page',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ai Avicenna"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="Other login methods"
            />,
            <ActionIcons key="icons" />,
          ]}
          onFinish={async (values: LoginFormValues | SignupFormValues) => {
            console.log('Form submitted with values:', values); // Add this line
            if (type === 'account') {
              await handleSubmit(values as LoginFormValues);
            } else if (type === 'signup') {
              await handleSignup(values as SignupFormValues);
            }
          }}
          submitter={{
            searchConfig: {
              submitText:
                type === 'signup'
                  ? intl.formatMessage({ id: 'pages.signup.submit', defaultMessage: 'Register' })
                  : intl.formatMessage({ id: 'pages.login.submit', defaultMessage: 'Login' }),
            },
          }}
        >
          <Tabs
            activeKey={type}
            onChange={(newType) => {
              setType(newType);
              // Clear errors when switching tabs
              setLoginError('');
              setSignupError('');
            }}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: 'Account Password Login',
                }),
              },
              {
                key: 'signup',
                label: intl.formatMessage({
                  id: 'pages.signup.tab',
                  defaultMessage: 'Register',
                }),
              },
            ]}
          />

          {/* Show login error */}
          {loginError && type === 'account' && (
            <LoginMessage content={loginError} />
          )}

          {/* Show signup error */}
          {signupError && type === 'signup' && (
            <LoginMessage content={signupError} />
          )}

          {type === 'account' && (
            <>
              <ProFormText
                name="login"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.login.placeholder',
                  defaultMessage: 'Email address',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.login.required"
                        defaultMessage="Please enter your email address!"
                      />
                    ),
                  },
                  {
                    type: 'email',
                    message: (
                      <FormattedMessage
                        id="pages.login.login.invalid"
                        defaultMessage="Invalid email format!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: 'Password (at least 6 characters)',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="Please enter your password!"
                      />
                    ),
                  },
                  {
                    min: 6,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.min"
                        defaultMessage="Password must be at least 6 characters!"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {type === 'signup' && (
            <>
              <ProFormText
                name="login"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.signup.login.placeholder',
                  defaultMessage: 'Email address',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.signup.login.required',
                      defaultMessage: 'Please enter your email address!',
                    }),
                  },
                  {
                    type: 'email',
                    message: intl.formatMessage({
                      id: 'pages.signup.login.invalid',
                      defaultMessage: 'Invalid email format!',
                    }),
                  },
                ]}
              />
              <ProFormText
                name="name"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.signup.name.placeholder',
                  defaultMessage: 'Name (max 50 characters)',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.signup.name.required',
                      defaultMessage: 'Please enter your name!',
                    }),
                  },
                  {
                    max: 50,
                    message: intl.formatMessage({
                      id: 'pages.signup.name.max',
                      defaultMessage: 'Name cannot exceed 50 characters!',
                    }),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.signup.password.placeholder',
                  defaultMessage: 'Password (6-255 characters)',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.signup.password.required',
                      defaultMessage: 'Please enter your password!',
                    }),
                  },
                  {
                    min: 6,
                    message: intl.formatMessage({
                      id: 'pages.signup.password.min',
                      defaultMessage: 'Password must be at least 6 characters!',
                    }),
                  },
                  {
                    max: 255,
                    message: intl.formatMessage({
                      id: 'pages.signup.password.max',
                      defaultMessage: 'Password cannot exceed 255 characters!',
                    }),
                  },
                ]}
              />
            </>
          )}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            {type === 'account' && (
              <ProFormCheckbox noStyle name="autoLogin">
                <FormattedMessage id="pages.login.rememberMe" defaultMessage="Remember me" />
              </ProFormCheckbox>
            )}
            <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="Forgot password" />
            </a>
          </div>
        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
























































