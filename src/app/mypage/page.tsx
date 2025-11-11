'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { Button, Input, Toggle, useToast, Toast } from '@/components/common';
import { getMyInfo, changePassword, updateLocationShareAgree } from '@/lib/api/auth';
import { UserCircleIcon, KeyIcon, MapPinIcon } from '@heroicons/react/24/solid';

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const { toasts, showToast, removeToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [locationShareAgree, setLocationShareAgree] = useState(user?.locationShareAgree || false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 인증 확인
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // 페이지 로드 시 최신 사용자 정보 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      loadUserInfo();
    }
  }, [isAuthenticated]);

  const loadUserInfo = async () => {
    try {
      const userInfo = await getMyInfo();
      updateUser(userInfo);
      setLocationShareAgree(userInfo.locationShareAgree);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  // 위치 공유 동의 변경
  const handleLocationShareToggle = async (enabled: boolean) => {
    setIsUpdatingLocation(true);
    try {
      await updateLocationShareAgree(enabled);
      setLocationShareAgree(enabled);
      updateUser({ locationShareAgree: enabled });
      showToast(
        enabled ? '위치 공유 동의가 활성화되었습니다.' : '위치 공유 동의가 비활성화되었습니다.',
        'success'
      );
    } catch (error: any) {
      console.error('Failed to update location share agree:', error);
      const errorMessage = error?.message || '위치 공유 동의 설정을 변경할 수 없습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // 비밀번호 변경 유효성 검사
  const validatePassword = (): boolean => {
    const errors: typeof passwordErrors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '새 비밀번호가 일치하지 않습니다.';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newPasswordConfirm: passwordForm.confirmPassword,
      });

      showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error?.message || '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="text-gray-600 mt-2">계정 정보 및 설정을 관리합니다</p>
        </div>

        {/* 사용자 정보 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCircleIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">사용자 정보</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">이름</span>
              <span className="text-sm text-gray-900">{user.name}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-700">이메일</span>
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
          </div>
        </div>

        {/* 위치 공유 동의 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPinIcon className="w-8 h-8 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">위치 공유 설정</h2>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            서비스 차원의 위치 정보 공유 동의 여부를 설정합니다. 이 설정이 활성화되어야 홈 화면에서 위치 공유를 시작할 수 있습니다.
          </p>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">위치 공유 영구 동의</p>
              <p className="text-xs text-gray-500 mt-1">
                {locationShareAgree ? '위치 공유가 허용된 상태입니다' : '위치 공유가 차단된 상태입니다'}
              </p>
            </div>
            <Toggle
              enabled={locationShareAgree}
              onChange={handleLocationShareToggle}
              disabled={isUpdatingLocation}
            />
          </div>

          {!locationShareAgree && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              위치 공유 동의가 비활성화되어 있습니다. 홈 화면에서 위치 공유를 사용하려면 이 설정을 활성화해주세요.
            </div>
          )}
        </div>

        {/* 비밀번호 변경 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <KeyIcon className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">비밀번호 변경</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="현재 비밀번호"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              error={passwordErrors.currentPassword}
              fullWidth
              disabled={isChangingPassword}
            />

            <Input
              label="새 비밀번호"
              type="password"
              placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              error={passwordErrors.newPassword}
              fullWidth
              disabled={isChangingPassword}
            />

            <Input
              label="새 비밀번호 확인"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              error={passwordErrors.confirmPassword}
              fullWidth
              disabled={isChangingPassword}
            />

            <Button
              type="submit"
              fullWidth
              variant="danger"
              isLoading={isChangingPassword}
            >
              비밀번호 변경
            </Button>
          </form>
        </div>
      </div>

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
