// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

// Backend API Types
interface SignUpRequest {
  login: string;    // email
  name: string;
  password: string;
}

interface SignUpResponse {
  id: number;
  login: string;
  name: string;
  created_dt: string;   // ISO date string
  updated_dt: string;   // ISO date string
  deleted_dt: string | null;
}

interface LoginRequest {
  login: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string; // always "bearer"
}

// Backend user info response interface
interface UserInfoResponse {
  id: number;
  login: string;
  name: string;
  role: string;
  created_dt: string;
  updated_dt: string;
}

interface ErrorResponse {
  detail: string;
}


/** Get current user GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * Get current user info - fetch real user data from backend API using JWT token
 */
export async function getCurrentUserInfo(options?: { [key: string]: any }): Promise<API.CurrentUser | undefined> {
  try {
    // Check if user has a valid token
    const token = tokenStorage.get();
    if (!token) {
      console.log('No access token found - user needs to log in');
      return undefined;
    }

    console.log('getCurrentUserInfo: Fetching user info from /api/v1/users/me endpoint');
    const userInfo = await getCurrentUserFromToken(options);
    console.log('getCurrentUserInfo: userInfo received:', userInfo);
    
    // Validate userInfo before using it
    if (!userInfo || !userInfo.name || !userInfo.id || !userInfo.login) {
      console.error('Invalid user info received:', userInfo);
      throw new Error('Invalid user info received from backend');
    }
    
    // Store the user ID for backward compatibility with other parts of the app
    userStorage.set(userInfo.id);
    
    // Convert backend user info to API.CurrentUser format
    return {
      name: userInfo.name,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png', // Default avatar
      userid: userInfo.id.toString(),
      email: userInfo.login,
      signature: `Role: ${userInfo.role || 'User'}`,
      title: 'User',
      group: 'Default Group',
      tags: [
        { key: '0', label: userInfo.role || 'User' },
        { key: '1', label: 'Active' },
      ],
      notifyCount: 0,
      unreadCount: 0,
      country: 'Unknown',
      access: userInfo.role || 'user',
      geographic: {
        province: { label: 'Unknown', key: '000000' },
        city: { label: 'Unknown', key: '000000' },
      },
      address: 'Unknown',
      phone: 'Unknown',
    };
  } catch (error) {
    console.error('Error fetching current user info:', error);
    
    // If there's an error fetching user info, return undefined to trigger login redirect
    // This is better than showing a fallback since the user should re-authenticate
    return undefined;
  }
}

/**
 * Utility function to update global state with user information
 * This can be used from anywhere in the application to keep the header in sync
 */
export const updateGlobalUserState = (userInfo: UserInfoResponse) => {
  // This function will be called from components that need to update the global state
  // The actual implementation will be provided by the component using useModel
  return {
    name: userInfo.name,
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    userid: userInfo.id.toString(),
    email: userInfo.login,
    signature: `Role: ${userInfo.role || 'User'}`,
    title: 'User',
    group: 'Default Group',
    tags: [
      { key: '0', label: userInfo.role || 'User' },
      { key: '1', label: 'Active' },
    ],
    notifyCount: 0,
    unreadCount: 0,
    country: 'Unknown',
    access: userInfo.role || 'user',
    geographic: {
      province: { label: 'Unknown', key: '000000' },
      city: { label: 'Unknown', key: '000000' },
    },
    address: 'Unknown',
    phone: 'Unknown',
  };
};

/** Logout interface POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** POST /api/v1/users/register */
export async function signup(
  body: SignUpRequest,
  options?: { [key: string]: any }
): Promise<SignUpResponse> {
  return request('/api/v1/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** POST /api/v1/users/login */
export async function login(
  body: LoginRequest, 
  options?: { [key: string]: any }
): Promise<LoginResponse> {
  return request('/api/v1/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** GET /api/v1/users/me - Get current user info from JWT token */
export async function getCurrentUserFromToken(
  options?: { [key: string]: any }
): Promise<UserInfoResponse> {
  const authHeaders = getAuthHeaders();
  console.log('Making request to getCurrentUserFromToken');
  console.log('Auth headers:', authHeaders);
  
  try {
    const response = await request<any>(`/api/v1/users/me`, {
      method: 'GET',
      headers: authHeaders,
      ...(options || {}),
    });
    
    console.log('getCurrentUserFromToken response:', response);
    
    // Handle different response structures
    if (response && typeof response === 'object') {
      // If response has a data property, use that
      if ('data' in response && response.data) {
        return response.data as UserInfoResponse;
      }
      // If response is the user data directly, use it
      if ('id' in response && 'name' in response && 'login' in response) {
        return response as UserInfoResponse;
      }
    }
    
    console.error('Unexpected response structure:', response);
    throw new Error('Invalid response structure from getCurrentUserFromToken');
  } catch (error) {
    console.error('Error in getCurrentUserFromToken:', error);
    throw error;
  }
}

/** GET /api/v1/users/{user_id} - Legacy function for backward compatibility */
export async function getUserById(
  userId: number,
  options?: { [key: string]: any }
): Promise<UserInfoResponse> {
  // For backward compatibility, we'll use the new /me endpoint
  // since the backend now provides user info via JWT token
  console.log('getUserById called with userId:', userId, '- redirecting to getCurrentUserFromToken');
  return getCurrentUserFromToken(options);
}

// Note: The backend now provides a /me endpoint that returns user info based on JWT token
// This eliminates the need for manual user ID input

// Token management utilities
export const tokenStorage = {
  set: (token: string) => {
    localStorage.setItem('access_token', token);
  },
  get: (): string | null => {
    return localStorage.getItem('access_token');
  },
  remove: () => {
    localStorage.removeItem('access_token');
  }
};

// User ID management utilities
export const userStorage = {
  set: (userId: number) => {
    localStorage.setItem('user_id', userId.toString());
  },
  get: (): number | null => {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : null;
  },
  remove: () => {
    localStorage.removeItem('user_id');
  }
};

// Email storage for login process
export const emailStorage = {
  set: (email: string) => {
    localStorage.setItem('user_email', email);
  },
  get: (): string | null => {
    return localStorage.getItem('user_email');
  },
  remove: () => {
    localStorage.removeItem('user_email');
  }
};

// Helper function to add Authorization header to requests
export const getAuthHeaders = (): Record<string, string> => {
  const token = tokenStorage.get();
  if (!token) {
    console.log('No access token found in storage');
    return {};
  }
  
  console.log('Adding Authorization header with token:', token.substring(0, 20) + '...');
  return {
    'Authorization': `Bearer ${token}`
  };
};

/** Get notices GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Get rule list GET /api/rule */
export async function rule(
  params: {
    // Current page number
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** Update rule PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** Add rule POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** Delete rule DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}
