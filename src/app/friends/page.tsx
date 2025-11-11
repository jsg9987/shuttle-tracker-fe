'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { getFriends, getReceivedFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, deleteFriend, type Friend, type FriendRequest } from '@/lib/api/friend';
import { Button, Input, Modal, useToast, Toast } from '@/components/common';
import {
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toasts, showToast, removeToast } = useToast();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration 완료 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 인증 확인 (hydration 완료 후에만)
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadFriendsData();
    }
  }, [isAuthenticated]);

  const loadFriendsData = async () => {
    setIsLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getReceivedFriendRequests(),
      ]);

      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error: any) {
      console.error('Failed to load friends data:', error);
      showToast('친구 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 친구 추가 요청 (이메일로 직접 요청)
  const handleAddFriend = async () => {
    if (!searchEmail.trim()) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    // 이메일 형식 검증
    if (!/\S+@\S+\.\S+/.test(searchEmail)) {
      showToast('유효한 이메일 주소를 입력해주세요.', 'error');
      return;
    }

    setIsSearching(true);

    try {
      await sendFriendRequest(searchEmail);
      showToast('친구 요청을 보냈습니다!', 'success');
      setIsAddModalOpen(false);
      setSearchEmail('');
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      const errorMessage = error?.message || '친구 요청을 보낼 수 없습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // 친구 요청 수락
  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await acceptFriendRequest(friendshipId);
      setPendingRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
      showToast('친구 요청을 수락했습니다.', 'success');
      loadFriendsData(); // 목록 갱신
    } catch (error: any) {
      console.error('Failed to accept friend request:', error);
      showToast('친구 요청 수락에 실패했습니다.', 'error');
    }
  };

  // 친구 요청 거절
  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await rejectFriendRequest(friendshipId);
      setPendingRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
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
      await deleteFriend(friendId);
      setFriends((prev) => prev.filter((f) => f.friendId !== friendId));
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
                      key={request.friendshipId}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {request.friendName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.friendName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.friendEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.friendshipId)}
                          className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                          title="수락"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.friendshipId)}
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
                      key={friend.friendId}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {friend.friendName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {friend.friendName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {friend.friendEmail}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteFriend(friend.friendId, friend.friendName)
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
