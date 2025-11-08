import { AxiosInstance } from 'axios';

declare const instance: AxiosInstance;
export default instance;

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export interface ErrorResponse {
  message?: string;
  code?: string;
}