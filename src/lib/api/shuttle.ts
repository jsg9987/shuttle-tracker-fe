import apiClient from './client';
import type { ShuttleRoute, ShuttleStop, ArrivalTimeRequest, ArrivalTimeResponse } from '@/types';

// 모든 셔틀 노선 조회
export const getRoutes = async (): Promise<ShuttleRoute[]> => {
  const response = await apiClient.get<ShuttleRoute[]>('/shuttle/routes');
  return response.data;
};

// 특정 노선의 경유지 조회
export const getRouteStops = async (routeId: number): Promise<ShuttleStop[]> => {
  const response = await apiClient.get<ShuttleStop[]>(
    `/shuttle/routes/${routeId}/stops`
  );
  return response.data;
};

// 도착 시간 예측
export const calculateArrivalTime = async (
  data: ArrivalTimeRequest
): Promise<ArrivalTimeResponse> => {
  const response = await apiClient.post<ArrivalTimeResponse>(
    '/shuttle/arrival-time',
    data
  );
  return response.data;
};

// 노선 검색
export const searchRoutes = async (query: string): Promise<ShuttleRoute[]> => {
  const response = await apiClient.get<ShuttleRoute[]>('/shuttle/routes/search', {
    params: { q: query },
  });
  return response.data;
};
