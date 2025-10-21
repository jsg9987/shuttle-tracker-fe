import apiClient from './client';
import type { Friend, FriendRelation } from '@/types';

// 친구 목록 조회 (ACCEPTED 상태만)
export const getFriends = async (): Promise<Friend[]> => {
  const response = await apiClient.get<Friend[]>('/friends');
  return response.data;
};

// 친구 요청 보내기
export const sendFriendRequest = async (toUserId: number): Promise<FriendRelation> => {
  const response = await apiClient.post<FriendRelation>('/friends/request', {
    toUserId,
  });
  return response.data;
};

// 친구 요청 수락
export const acceptFriendRequest = async (
  friendId: number
): Promise<FriendRelation> => {
  const response = await apiClient.put<FriendRelation>(
    `/friends/${friendId}/accept`
  );
  return response.data;
};

// 친구 요청 거절
export const rejectFriendRequest = async (friendId: number): Promise<void> => {
  await apiClient.put(`/friends/${friendId}/reject`);
};

// 친구 삭제
export const deleteFriend = async (friendId: number): Promise<void> => {
  await apiClient.delete(`/friends/${friendId}`);
};

// 받은 친구 요청 목록
export const getPendingFriendRequests = async (): Promise<FriendRelation[]> => {
  const response = await apiClient.get<FriendRelation[]>('/friends/pending');
  return response.data;
};
