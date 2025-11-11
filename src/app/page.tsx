'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Toggle, useToast, Toast } from '@/components/common';
import { useAuthStore, useLocationStore } from '@/stores';
import { useGeolocation } from '@/hooks/useGeolocation';
import { startLocationSharing as apiStartLocationSharing, stopLocationSharing as apiStopLocationSharing, getMyLocationShare } from '@/lib/api/location';
import { getCurrentPosition } from '@/lib/utils/geolocation';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { isSharing, remainingTime, startLocationSharing, stopLocationSharing, setRemainingTime } = useLocationStore();
  const { startTracking, stopTracking } = useGeolocation();
  const { toasts, showToast, removeToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  // 페이지 로드 시 기존 위치 공유 세션 복원
  useEffect(() => {
    if (!isAuthenticated) return;

    const restoreLocationShare = async () => {
      try {
        const locationShare = await getMyLocationShare();
        if (locationShare && locationShare.isActive) {
          // 위치 공유 중인 세션 복원
          startLocationSharing(locationShare);
          // 위치 추적 재시작
          await startTracking();
        }
      } catch (error) {
        // 404 에러는 위치 공유 중이 아님을 의미 (정상)
        console.log('No active location share session');
      }
    };

    restoreLocationShare();
  }, [isAuthenticated]);

  // 남은 시간 타이머
  useEffect(() => {
    if (!isSharing || remainingTime === null) return;

    const timer = setInterval(() => {
      const newTime = Math.max(0, remainingTime - 1);
      setRemainingTime(newTime);

      // 시간 만료 시 자동 종료
      if (newTime <= 0) {
        handleStopSharing();
        showToast('위치 공유가 자동으로 종료되었습니다.', 'info');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSharing, remainingTime]);

  // 위치 공유 시작
  const handleStartSharing = async () => {
    if (!isAuthenticated) {
      const shouldRedirect = confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?');
      if (shouldRedirect) {
        router.push('/login');
      }
      return;
    }

    if (!user?.locationShareAgree) {
      showToast('설정에서 위치 공유 동의를 먼저 활성화해주세요.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // 1. 현재 위치 가져오기
      const currentLocation = await getCurrentPosition();

      // 2. 백엔드에 위치 공유 시작 요청
      const locationShare = await apiStartLocationSharing(
        currentLocation.lat,
        currentLocation.lng
      );

      // 3. Zustand 스토어에 저장
      startLocationSharing(locationShare);

      // 4. 위치 추적 시작 (30초마다 자동 업데이트)
      await startTracking();

      showToast('위치 공유가 시작되었습니다. (1시간)', 'success');
    } catch (error: any) {
      console.error('Failed to start location sharing:', error);
      const errorMessage = error?.message || '위치 공유를 시작할 수 없습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 위치 공유 중지
  const handleStopSharing = async () => {
    setIsLoading(true);

    try {
      // 1. 백엔드에 위치 공유 중지 요청
      await apiStopLocationSharing();

      // 2. 위치 추적 중지
      stopTracking();

      // 3. Zustand 스토어 초기화
      stopLocationSharing();

      showToast('위치 공유가 중지되었습니다.', 'info');
    } catch (error: any) {
      console.error('Failed to stop location sharing:', error);
      const errorMessage = error?.message || '위치 공유를 중지할 수 없습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 위치 공유 토글
  const handleToggleSharing = async () => {
    if (isSharing) {
      await handleStopSharing();
    } else {
      await handleStartSharing();
    }
  };

  // 남은 시간 포맷팅
  const formatRemainingTime = (seconds: number | null): string => {
    if (seconds === null) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    }
    return `${minutes}분 ${secs}초`;
  };

  // 셔틀 맵으로 이동
  const handleGoToMap = () => {
    if (!isAuthenticated) {
      const shouldRedirect = confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?');
      if (shouldRedirect) {
        router.push('/login');
      }
      return;
    }

    router.push('/map');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SSAFY 셔틀 버스 트래커
          </h1>
          <p className="text-lg text-gray-600">
            친구의 위치를 공유하고 셔틀 버스 도착 시간을 실시간으로 확인하세요
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 위치 공유 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPinIcon className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">위치 공유</h2>
            </div>

            <p className="text-gray-600 mb-6">
              {isSharing
                ? '현재 위치를 친구들과 공유하고 있습니다.'
                : '위치를 공유하여 친구들이 버스 도착 시간을 확인할 수 있게 하세요.'}
            </p>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-700">
                {isSharing ? '공유 중' : '공유 꺼짐'}
              </span>
              <Toggle
                enabled={isSharing}
                onChange={handleToggleSharing}
                disabled={isLoading}
              />
            </div>

            {isSharing && remainingTime !== null && (
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-900 font-medium">
                  남은 시간: {formatRemainingTime(remainingTime)}
                </span>
              </div>
            )}
          </div>

          {/* 셔틀 맵 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">셔틀 맵</h2>
            </div>

            <p className="text-gray-600 mb-6">
              친구들의 위치와 셔틀 버스 노선을 지도에서 확인하고 도착 시간을 예측하세요.
            </p>

            <Button
              fullWidth
              onClick={handleGoToMap}
            >
              셔틀 맵 보기
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">사용 방법</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>버스에 탑승한 후 위치 공유를 켜주세요. (1시간 동안 유지됩니다)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>친구가 셔틀 맵에서 당신의 위치를 확인할 수 있습니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>친구 마커를 클릭하고 남은 경유지를 선택하여 도착 시간을 확인하세요.</span>
            </li>
          </ol>
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
