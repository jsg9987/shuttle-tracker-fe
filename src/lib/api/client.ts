import axios, { AxiosError, AxiosInstance, InternalAxesRequestConfig } from 'axios';
import type { ApiError, ApiResponse } from '@/types';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
});

// Request Interceptor - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxesRequestConfig) => {
    // localStorage에서 토큰 가져오기
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          const token = state?.token;

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to parse auth storage:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      // 서버에서 응답이 왔지만 에러 상태 코드
      const apiError: ApiError = {
        message: error.response.data?.message || '서버 오류가 발생했습니다.',
        code: error.response.data?.code,
        status: error.response.status,
      };

      // 401 Unauthorized - 토큰 만료 또는 인증 실패
      if (error.response.status === 401) {
        // 로그아웃 처리 (authStore는 client component에서만 사용 가능)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      }

      return Promise.reject(apiError);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없음
      const apiError: ApiError = {
        message: '서버와 연결할 수 없습니다.',
        code: 'NETWORK_ERROR',
      };
      return Promise.reject(apiError);
    } else {
      // 요청 설정 중 에러 발생
      const apiError: ApiError = {
        message: error.message || '요청 처리 중 오류가 발생했습니다.',
        code: 'REQUEST_ERROR',
      };
      return Promise.reject(apiError);
    }
  }
);

export default apiClient;

// Helper function to create typed API response
export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createApiError(error: ApiError): ApiResponse<never> {
  return {
    success: false,
    error,
  };
}
