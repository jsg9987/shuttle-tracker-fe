import apiClient from './client';
import type { LoginRequest, SignupRequest, AuthResponse, User } from '@/types';

// 백엔드 응답 타입
interface BackendResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    httpStatus: number;
  } | null;
}

// 로그인
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<BackendResponse<AuthResponse>>('/api/v1/auth/login', data);
  return response.data.data!;
};

// 회원가입 (signup → register로 변경)
export const signup = async (data: SignupRequest): Promise<void> => {
  await apiClient.post<BackendResponse<null>>('/api/v1/auth/register', data);
};

// 로그아웃 (서버에 로그아웃 알림, 필요시)
export const logout = async (): Promise<void> => {
  // 백엔드에 로그아웃 API가 없으므로 클라이언트에서만 처리
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-storage');
  }
};

// 내 정보 조회 (경로 변경: /auth/me → /api/v1/users/me)
export const getMyInfo = async (): Promise<User> => {
  const response = await apiClient.get<BackendResponse<User>>('/api/v1/users/me');
  return response.data.data!;
};

// 비밀번호 변경 (PUT → POST, 경로 변경)
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}): Promise<void> => {
  await apiClient.post<BackendResponse<null>>('/api/v1/users/me/password', data);
};

// 위치 공유 동의 설정 변경 (PUT → PATCH, 경로 변경)
export const updateLocationShareAgree = async (agree: boolean): Promise<void> => {
  await apiClient.patch<BackendResponse<null>>('/api/v1/users/me/location-agree', {
    locationShareAgree: agree,
  });
};
