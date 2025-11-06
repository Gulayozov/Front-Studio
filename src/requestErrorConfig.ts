import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';

// Error handling solution: error types
export enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// Response data format agreed with backend
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name Error handling
 * Pro's built-in error handling, you can make your own changes here
 * @doc https://umijs.org/docs/max/request#configuration
 */
export const errorConfig: RequestOptions = {
  // Error handling: umi@3 error handling solution.
  errorConfig: {
    // Error throwing
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // Throw homemade error
      }
    },
    // Error reception and handling
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // Our errorThrower threw an error.
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios error
        // The request was successful, but the status code is outside the 2xx range
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // The request was successful, but no response was received
        // \`error.request\` is an instance of XMLHttpRequest in the browser,
        // and an instance of http.ClientRequest in node.js
        message.error('None response! Please retry.');
      } else {
        // There was a problem sending the request
        message.error('Request error, please retry.');
      }
    },
  },

  // Request interceptors
  requestInterceptors: [
    (config: RequestOptions) => {
      // Intercept request configuration for personalized processing.
      // Note: Removed the token=123 addition as it interferes with proper Bearer token auth
      return { ...config };
    },
  ],

  // Response interceptors
  responseInterceptors: [
    (response) => {
      // Intercept response data for personalized processing
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        message.error('Request failed!');
      }
      return response;
    },
  ],
};
