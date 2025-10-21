import apiClient from './client';
import type { Location, LocationShare } from '@/types';

// 위치 공유 시작
export const startLocationSharing = async (
  location: Location
): Promise<LocationShare> => {
  const response = await apiClient.post<LocationShare>('/location/start', {
    lat: location.lat,
    lng: location.lng,
  });
  return response.data;
};

// 위치 공유 중지
export const stopLocationSharing = async (): Promise<void> => {
  await apiClient.post('/location/stop');
};

// 내 위치 업데이트 (위치 공유 중일 때)
export const updateMyLocation = async (location: Location): Promise<void> => {
  await apiClient.put('/location/update', {
    lat: location.lat,
    lng: location.lng,
  });
};

// 내 위치 공유 세션 조회
export const getMyLocationShare = async (): Promise<LocationShare | null> => {
  const response = await apiClient.get<LocationShare | null>('/location/me');
  return response.data;
};

// 친구의 현재 위치 조회
export const getFriendLocation = async (
  friendId: number
): Promise<Location | null> => {
  const response = await apiClient.get<Location | null>(
    `/location/friend/${friendId}`
  );
  return response.data;
};
