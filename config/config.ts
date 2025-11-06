// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import { join } from 'path';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV = 'dev' } = process.env;

/**
 * @name Public Path
 * @description Path when deploying, if deploying to a non-root directory, you need to configure this variable
 * @doc https://umijs.org/docs/api/config#publicpath
 */
const PUBLIC_PATH: string = '/';

export default defineConfig({
  /**
   * @name Enable Hash Mode
   * @description Makes the build output include hash suffixes. Usually used for incremental releases and avoiding browser cache loading.
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,

  publicPath: PUBLIC_PATH,

  /**
   * @name Compatibility Settings
   * @description Setting ie11 may not be perfectly compatible, you need to check all dependencies you use
   * @doc https://umijs.org/docs/api/config#targets
   */
  // targets: {
  //   ie: 11,
  // },
  /**
   * @name Route Configuration, files not imported in routes will not be compiled
   * @description Only supports path, component, routes, redirect, wrappers, title configuration
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @name Theme Configuration
   * @description Although called theme, it's actually just less variable settings
   * @doc antd theme settings https://ant.design/docs/react/customize-theme-cn
   * @doc umi theme configuration https://umijs.org/docs/api/config#theme
   */
  theme: {
    // If you don't want configProvide to dynamically set the theme, you need to set this to default
    // Only when set to variable can you use configProvide to dynamically set the primary color
    'root-entry-name': 'variable',
  },
  /**
   * @name Moment Internationalization Configuration
   * @description If there are no internationalization requirements, opening this can reduce the js bundle size
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
   * @name Proxy Configuration
   * @description Allows your local server to proxy to your server, so you can access server data
   * @see Note that the following proxy can only be used during local development, it cannot be used after build.
   * @doc Proxy introduction https://umijs.org/docs/guides/proxy
   * @doc Proxy configuration https://umijs.org/docs/api/config#proxy
   */
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  /**
   * @name Fast Hot Reload Configuration
   * @description A good hot reload component that can preserve state during updates
   */
  fastRefresh: true,
  //============== The following are all max plugin configurations ===============
  /**
   * @name Data Flow Plugin
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * A global initial data flow that can be used to share data between plugins
   * @description Can be used to store some global data, such as user information, or some global state. The global initial state is created at the very beginning of the entire Umi project.
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name Layout Plugin
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: 'Ai Avicenna',
  layout: {
    locale: true,
    ...defaultSettings,
  },
  /**
   * @name moment2dayjs Plugin
   * @description Replace moment with dayjs in the project
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  /**
   * @name Internationalization Plugin
   * @doc https://umijs.org/docs/max/i18n
   */
  locale: {
    // default en-US
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  /**
   * @name antd Plugin
   * @description Built-in babel import plugin
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {
    styleProvider: {
      cssVar: true,
    },
  },
  /**
   * @name Network Request Configuration
   * @description It provides a unified network request and error handling solution based on axios and ahooks useRequest.
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @name Access Plugin
   * @description Permission plugin based on initialState, must enable initialState first
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  /**
   * @name Additional scripts in <head>
   * @description Configure additional scripts in <head>
   */
  headScripts: [
    // Solve the white screen problem on first load
    { src: join(PUBLIC_PATH, 'scripts/loading.js'), async: true },
  ],
  //================ Pro Plugin Configuration =================
  presets: ['umi-presets-pro'],
  /**
   * @name openAPI Plugin Configuration
   * @description Generate serve and mock based on openapi specifications, which can reduce a lot of boilerplate code
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  openAPI: [
    {
      requestLibPath: "import { request } from '@umijs/max'",
      // Or use the online version
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from '@umijs/max'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  /**
   * @name Whether to enable mako
   * @description Use mako for ultra-fast development
   * @doc https://umijs.org/docs/api/config#mako
   */
  mako: {},
  esbuildMinifyIIFE: true,
  requestRecord: {},
  base: "/Front-Studio",
});
