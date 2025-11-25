
import { AxiosError } from 'axios';

export interface AppError {
  code: number | string;
  title: string;
  message: string;
  type: 'network' | 'auth' | 'not_found' | 'server' | 'unknown';
  originalError?: any;
}

export const parseError = (error: any): AppError => {
  const defaultError: AppError = {
    code: 500,
    title: 'Unexpected Error',
    message: 'Something went wrong. Please try again later.',
    type: 'unknown',
    originalError: error
  };

  if (!error) return defaultError;

  // Handle Axios Errors (API responses)
  if (error.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status || 0;
    const apiMessage = axiosError.response?.data?.message || axiosError.message;

    // 403: Rate Limit or Forbidden
    if (status === 403) {
      const isRateLimit = apiMessage.includes('rate limit') || axiosError.response?.headers?.['x-ratelimit-remaining'] === '0';
      return {
        code: 403,
        title: isRateLimit ? 'Rate Limit Exceeded' : 'Access Forbidden',
        message: isRateLimit 
          ? 'You have exceeded the GitHub API rate limit. Please add a Personal Access Token in settings to increase your limit.' 
          : `Access to this resource is forbidden. ${apiMessage}`,
        type: 'auth',
        originalError: error
      };
    }

    // 404: Not Found
    if (status === 404) {
      return {
        code: 404,
        title: 'Resource Not Found',
        message: 'The repository, user, or resource you are looking for does not exist or may be private.',
        type: 'not_found',
        originalError: error
      };
    }

    // 5xx: Server Errors
    if (status >= 500) {
      return {
        code: status,
        title: 'GitHub Is Having Trouble',
        message: 'GitHub servers are currently experiencing issues. Please try again later.',
        type: 'server',
        originalError: error
      };
    }

    // Network / Offline
    if (axiosError.code === 'ERR_NETWORK') {
      return {
        code: 'Offline',
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.',
        type: 'network',
        originalError: error
      };
    }

    // Other API errors
    return {
      code: status,
      title: 'Request Failed',
      message: apiMessage || defaultError.message,
      type: 'unknown',
      originalError: error
    };
  }

  // Handle Generic JS Errors
  if (error instanceof Error) {
    return {
      ...defaultError,
      message: error.message,
      originalError: error
    };
  }

  return defaultError;
};
