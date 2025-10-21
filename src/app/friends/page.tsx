'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { friendApi } from '@/lib/api';
import { Button, Input, Modal, useToast, Toast } from '@/components/common';
import {
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type { Friend, FriendRelation } from '@/types';

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toasts, showToast, removeToast } = useToast();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadFriendsData();
    }
  }, [isAuthenticated]);

  const loadFriendsData = async () => {
    setIsLoading(true);
    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // const [friendsData, requestsData] = await Promise.all([
      //   friendApi.getFriends(),
      //   friendApi.getPendingFriendRequests(),
      // ]);

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockFriends: Friend[] = [
        {
          id: 2,
          name: '김철수',
          email: 'kim@ssafy.com',
          isLocationSharing: true,
          currentLocation: { lat: 36.1076, lng: 128.4188 },
        },
        {
          id: 3,
          name: '이영희',
          email: 'lee@ssafy.com',
          isLocationSharing: false,
        },
        {
          id: 4,
          name: '박민수',
          email: 'park@ssafy.com',
          isLocationSharing: true,
          currentLocation: { lat: 36.1086, lng: 128.4198 },
        },
      ];

      const mockRequests: FriendRelation[] = [
        {
          id: 10,
          fromUserId: 5,
          toUserId: user?.id || 1,
          status: 'PENDING',
        },
      ];

      setFriends(mockFriends);
      setPendingRequests(mockRequests);
    } catch (error: any) {
      console.error('Failed to load friends data:', error);
      showToast('친구 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 친구 추가 요청
  const handleAddFriend = async () => {
    if (!searchEmail.trim()) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    setIsSearching(true);

    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // 1. 이메일로 사용자 검색 (별도 API 필요)
      // 2. 친구 요청 보내기
      // await friendApi.sendFriendRequest(foundUserId);

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast('친구 요청을 보냈습니다!', 'success');
      setIsAddModalOpen(false);
      setSearchEmail('');
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      showToast(error?.message || '친구 요청을 보낼 수 없습니다.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // 친구 요청 수락
  const handleAcceptRequest = async (requestId: number) => {
    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // await friendApi.acceptFriendRequest(requestId);

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast('친구 요청을 수락했습니다.', 'success');
      loadFriendsData(); // 목록 갱신
    } catch (error: any) {
      console.error('Failed to accept friend request:', error);
      showToast('친구 요청 수락에 실패했습니다.', 'error');
    }
  };

  // 친구 요청 거절
  const handleRejectRequest = async (requestId: number) => {
    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // await friendApi.rejectFriendRequest(requestId);

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast('친구 요청을 거절했습니다.', 'info');
    } catch (error: any) {
      console.error('Failed to reject friend request:', error);
      showToast('친구 요청 거절에 실패했습니다.', 'error');
    }
  };

  // 친구 삭제
  const handleDeleteFriend = async (friendId: number, friendName: string) => {
    const confirmed = confirm(`${friendName}님을 친구 목록에서 삭제하시겠습니까?`);
    if (!confirmed) return;

    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // await friendApi.deleteFriend(friendId);

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 500));

      setFriends((prev) => prev.filter((f) => f.id !== friendId));
      showToast('친구가 삭제되었습니다.', 'info');
    } catch (error: any) {
      console.error('Failed to delete friend:', error);
      showToast('친구 삭제에 실패했습니다.', 'error');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">친구 관리</h1>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlusIcon className="w-5 h-5 inline mr-2" />
            친구 추가
          </Button>
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">불러오는 중...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* 친구 요청 목록 */}
            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold text-gray-900">
                    받은 친구 요청 ({pendingRequests.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            ?
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            사용자 #{request.fromUserId}
                          </p>
                          <p className="text-sm text-gray-500">
                            친구 요청을 보냈습니다
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                          title="수락"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                          title="거절"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 친구 목록 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-900">
                  친구 목록 ({friends.length})
                </h2>
              </div>

              {friends.length === 0 ? (
                <div className="p-12 text-center">
                  <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    아직 친구가 없습니다.
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    첫 친구 추가하기
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {friend.name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {friend.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {friend.email}
                          </p>
                          {friend.isLocationSharing && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                              위치 공유 중
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteFriend(friend.id, friend.name)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="친구 삭제"
                      >
                        <UserMinusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Mock 데이터 안내 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-medium">🔧 개발 모드</p>
          <p className="mt-1">
            현재 Mock 데이터로 작동합니다. 백엔드 연동 후 실제 친구 관리가
            가능합니다.
          </p>
        </div>
      </div>

      {/* 친구 추가 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="친구 추가"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            친구의 이메일 주소를 입력하여 친구 요청을 보내세요.
          </p>

          <Input
            label="이메일"
            type="email"
            placeholder="friend@ssafy.com"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            fullWidth
            disabled={isSearching}
          />

          <div className="flex gap-3">
            <Button
              variant="light"
              fullWidth
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSearching}
            >
              취소
            </Button>
            <Button
              fullWidth
              onClick={handleAddFriend}
              isLoading={isSearching}
            >
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
              요청 보내기
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
