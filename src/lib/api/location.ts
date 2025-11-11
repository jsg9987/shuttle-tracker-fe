import apiClient from './client';
import type { Location, LocationShare } from '@/types';

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

// 위치 공유 시작 (1시간)
export const startLocationSharing = async (
  latitude: number,
  longitude: number
): Promise<LocationShare> => {
  const response = await apiClient.post<BackendResponse<LocationShare>>('/api/v1/location/start', {
    latitude,
    longitude,
  });
  return response.data.data!;
};

// 위치 공유 중지
export const stopLocationSharing = async (): Promise<void> => {
  await apiClient.post<BackendResponse<null>>('/api/v1/location/stop');
};

// 내 위치 업데이트 (위치 공유 중일 때) - PUT → POST 변경
export const updateMyLocation = async (latitude: number, longitude: number): Promise<void> => {
  await apiClient.post<BackendResponse<null>>('/api/v1/location/update', {
    latitude,
    longitude,
  });
};

// 내 위치 공유 세션 조회
export const getMyLocationShare = async (): Promise<LocationShare | null> => {
  try {
    const response = await apiClient.get<BackendResponse<LocationShare>>('/api/v1/location/me');
    return response.data.data;
  } catch (error: any) {
    // 404 에러는 위치 공유 중이 아님을 의미
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
};

// 친구들의 현재 위치 조회 (경로 변경: /location/friend/:id → /location/friends)
export const getFriendsLocations = async (): Promise<FriendLocation[]> => {
  const response = await apiClient.get<BackendResponse<FriendLocation[]>>('/api/v1/location/friends');
  return response.data.data || [];
};

// 친구 위치 응답 타입
export interface FriendLocation {
  friendId: number;
  friendEmail: string;
  friendName: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}
