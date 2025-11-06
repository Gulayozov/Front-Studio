/**
 * @name umi route configuration
 * @description Only supports path, component, routes, redirect, wrappers, name, icon configuration
 * @param path  path only supports two placeholder configurations, the first is dynamic parameter :id form, the second is * wildcard, wildcard can only appear at the end of the route string.
 * @param component  Configure the React component path used for rendering after location and path match. Can be absolute path or relative path, if it's a relative path, it will start from src/pages.
 * @param routes  Configure sub-routes, usually used when you need to add layout components for multiple paths.
 * @param redirect  Configure route redirection
 * @param wrappers  Configure wrapper components for route components, through wrapper components you can combine more functionality into the current route component. For example, it can be used for route-level permission verification
 * @param name  Configure route title, by default reads the value of menu.xxxx in the internationalization file menu.ts, if name is configured as login, then reads the value of menu.login in menu.ts as the title
 * @param icon  Configure route icon, refer to https://ant.design/components/icon-cn for values, note to remove style suffix and case, if you want to configure icon as <StepBackwardOutlined /> then the value should be stepBackward or StepBackward, if you want to configure icon as <UserOutlined /> then the value should be user or User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/user/profile',
    name: 'profile',
    component: './User/Profile',
  },
  {
    path: '/welcome',
    icon: 'smile',
    name: 'welcome',
    component: './Welcome',
  },
  {
    path: '/list',
    name: 'list',
    icon: 'orderedList',
    component: './List',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    component: './Admin',
    access: 'canAdmin',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];