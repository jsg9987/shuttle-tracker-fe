import apiClient from './client';

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

// 노선 타입
export interface ShuttleRoute {
  routeId: number;
  routeName: string;
  description: string;
}

// 노선 상세 타입 (경유지 포함)
export interface ShuttleRouteDetail {
  routeId: number;
  routeName: string;
  description: string;
  stops: ShuttleStop[];
}

// 경유지 타입
export interface ShuttleStop {
  stopId: number;
  stopName: string;
  latitude: number;
  longitude: number;
  sequence: number;
  isTerminal: boolean;
}

// 모든 셔틀 노선 조회 (간단)
export const getAllRoutes = async (): Promise<ShuttleRoute[]> => {
  const response = await apiClient.get<BackendResponse<ShuttleRoute[]>>('/api/v1/shuttle/routes');
  return response.data.data || [];
};

// 특정 노선 상세 조회 (경유지 포함)
export const getRouteDetail = async (routeId: number): Promise<ShuttleRouteDetail> => {
  const response = await apiClient.get<BackendResponse<ShuttleRouteDetail>>(`/api/v1/shuttle/routes/${routeId}`);
  return response.data.data!;
};

// 특정 노선의 모든 경유지 조회
export const getRouteStops = async (routeId: number): Promise<ShuttleStop[]> => {
  const response = await apiClient.get<BackendResponse<ShuttleStop[]>>(`/api/v1/shuttle/routes/${routeId}/stops`);
  return response.data.data || [];
};

// 남은 경유지 조회 (특정 sequence 이후)
export const getRemainingStops = async (routeId: number, fromSequence: number): Promise<ShuttleStop[]> => {
  const response = await apiClient.get<BackendResponse<ShuttleStop[]>>(
    `/api/v1/shuttle/routes/${routeId}/stops/remaining`,
    {
      params: { fromSequence },
    }
  );
  return response.data.data || [];
};

// 노선 검색 (query → keyword 파라미터 이름 변경)
export const searchRoutes = async (keyword: string): Promise<ShuttleRoute[]> => {
  const response = await apiClient.get<BackendResponse<ShuttleRoute[]>>('/api/v1/shuttle/routes/search', {
    params: { keyword },
  });
  return response.data.data || [];
};

// 경유지 검색
export const searchStops = async (keyword: string): Promise<ShuttleStop[]> => {
  const response = await apiClient.get<BackendResponse<ShuttleStop[]>>('/api/v1/shuttle/stops/search', {
    params: { keyword },
  });
  return response.data.data || [];
};

// TODO: 도착 시간 예측 API (백엔드에 아직 미구현)
// export const calculateArrivalTime = async (data: ArrivalTimeRequest): Promise<ArrivalTimeResponse> => {
//   const response = await apiClient.post<BackendResponse<ArrivalTimeResponse>>('/api/v1/shuttle/arrival-time', data);
//   return response.data.data!;
// };
