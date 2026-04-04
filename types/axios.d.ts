import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    suppressErrorToast?: boolean;
  }
  
  interface InternalAxiosRequestConfig extends AxiosRequestConfig {
    suppressErrorToast?: boolean;
    _retry?: boolean;
  }
}