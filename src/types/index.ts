// ==================== User 관련 ====================

export interface User {
  email: string;
  name: string;
  locationShareAgree: boolean; // location_share_agree - 위치 공유 영구 동의 여부
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

// 인증 응답 (로그인 API 응답)
export interface AuthResponse {
  accessToken: string;
  email: string;
  name: string;
  locationShareAgree: boolean;
}

// ==================== Location 관련 ====================

// 위치 정보
export interface Location {
  lat: number; // latitude
  lng: number; // longitude
}

// 위치 공유 세션 (Location_share 테이블)
export interface LocationShare {
  id: number;
  userId: number;
  startTime: string; // DATETIME -> ISO 8601 string
  endTime: string; // DATETIME -> ISO 8601 string
  isActive: boolean;
  currentLocation?: Location; // 실시간 위치 (별도 API로 받아옴)
}

// ==================== Friend 관련 ====================

// 친구 관계 (Friend 테이블)
export interface FriendRelation {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED'; // status VARCHAR(30)
}

// 친구 정보 (User + Location + LocationShare 조합)
export interface Friend {
  id: number;
  name: string;
  email: string;
  currentLocation?: Location; // 현재 위치 (위치 공유 중일 때만)
  isLocationSharing: boolean; // 현재 위치 공유 중인지
  locationShare?: LocationShare; // 위치 공유 세션 정보
  busRoute?: ShuttleRoute; // 탑승 중인 버스 노선 (추론)
}

// ==================== Shuttle 관련 ====================

// 셔틀 노선 (Shuttle_route 테이블)
export interface ShuttleRoute {
  id: number;
  routeName: string; // 예: "1호차", "2호차"
  stops?: ShuttleStop[]; // 경유지 목록
  color?: string; // 맵에 표시할 노선 색상 (프론트 전용)
}

// 셔틀 정류장/경유지 (Shuttle_stop 테이블)
export interface ShuttleStop {
  id: number;
  routeId: number;
  sequence: number; // 경유지 순서
  stopName: string;
  lat: number; // latitude
  lng: number; // longitude
  isTerminal: boolean; // 종점 여부
}

// ==================== 도착 시간 예측 ====================

// 도착 시간 예측 요청
export interface ArrivalTimeRequest {
  friendId: number;
  myLocation: Location;
  selectedStopIds: number[]; // 선택된 경유지 ID 목록 (남은 경유지들)
}

// 도착 시간 예측 응답
export interface ArrivalTimeResponse {
  routeName: string;
  estimatedMinutes: number; // 예상 소요 시간 (분)
  estimatedArrivalTime: string; // 예상 도착 시간 (ISO 8601)
  routePath: Location[]; // 카카오 API에서 받은 경로 좌표
}

// ==================== 검색 ====================

// 검색 결과
export interface SearchResult {
  type: 'friend' | 'route';
  id: number;
  name: string;
  data: Friend | ShuttleRoute;
}

// ==================== API 공통 ====================

// API 에러 응답
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// API 성공 응답 (제네릭)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
