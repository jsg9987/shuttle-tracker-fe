import apiClient from './client';
import type { LoginRequest, SignupRequest, AuthResponse, User } from '@/types';

// 로그인
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

// 회원가입
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/signup', data);
  return response.data;
};

// 로그아웃 (서버에 로그아웃 알림, 필요시)
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// 내 정보 조회
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// 비밀번호 변경
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await apiClient.put('/auth/password', data);
};

// 위치 공유 동의 설정 변경
export const updateLocationShareAgree = async (
  agree: boolean
): Promise<User> => {
  const response = await apiClient.put<User>('/auth/location-share-agree', {
    locationShareAgree: agree,
  });
  return response.data;
};
