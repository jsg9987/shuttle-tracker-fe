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

// 친구 타입
export interface Friend {
  friendId: number;
  friendEmail: string;
  friendName: string;
}

// 친구 요청 타입
export interface FriendRequest {
  friendshipId: number;
  friendId: number;
  friendEmail: string;
  friendName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

// 친구 요청 보내기 (toUserId → toUserEmail 변경)
export const sendFriendRequest = async (toUserEmail: string): Promise<void> => {
  await apiClient.post<BackendResponse<null>>('/api/v1/friends/request', {
    toUserEmail,
  });
};

// 받은 친구 요청 목록 조회
export const getReceivedFriendRequests = async (): Promise<FriendRequest[]> => {
  const response = await apiClient.get<BackendResponse<FriendRequest[]>>('/api/v1/friends/requests/received');
  return response.data.data || [];
};

// 보낸 친구 요청 목록 조회
export const getSentFriendRequests = async (): Promise<FriendRequest[]> => {
  const response = await apiClient.get<BackendResponse<FriendRequest[]>>('/api/v1/friends/requests/sent');
  return response.data.data || [];
};

// 친구 요청 수락 (PUT → POST, friendId → friendshipId)
export const acceptFriendRequest = async (friendshipId: number): Promise<void> => {
  await apiClient.post<BackendResponse<null>>(`/api/v1/friends/accept/${friendshipId}`);
};

// 친구 요청 거절 (PUT → POST, friendId → friendshipId)
export const rejectFriendRequest = async (friendshipId: number): Promise<void> => {
  await apiClient.post<BackendResponse<null>>(`/api/v1/friends/reject/${friendshipId}`);
};

// 친구 목록 조회 (ACCEPTED 상태만)
export const getFriends = async (): Promise<Friend[]> => {
  const response = await apiClient.get<BackendResponse<Friend[]>>('/api/v1/friends');
  return response.data.data || [];
};

// 친구 삭제
export const deleteFriend = async (friendId: number): Promise<void> => {
  await apiClient.delete<BackendResponse<null>>(`/api/v1/friends/${friendId}`);
};
