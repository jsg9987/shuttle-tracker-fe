'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useMapStore, useLocationStore } from '@/stores';
import { friendApi, shuttleApi } from '@/lib/api';
import { KakaoMap, ArrivalInfoCard, StopSelector, SearchBar } from '@/components/map';
import { Button, useToast, Toast } from '@/components/common';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { Friend, ShuttleRoute, ShuttleStop } from '@/types';

export default function MapPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { myLocation } = useLocationStore();
  const {
    friends,
    selectedFriend,
    routes,
    selectedRoute,
    selectedStops,
    arrivalInfo,
    isCalculating,
    setFriends,
    selectFriend,
    setRoutes,
    selectRoute,
    setSelectedStops,
    setArrivalInfo,
    setIsCalculating,
  } = useMapStore();
  const { toasts, showToast, removeToast } = useToast();

  const [routeStops, setRouteStops] = useState<ShuttleStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    loadInitialData();
  }, []);

  // 셔틀 맵 확인 페이지 들어왔을 때 가져와야할 친구, 노선 정보 로드
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // const [friendsData, routesData] = await Promise.all([
      //   friendApi.getFriends(),
      //   shuttleApi.getRoutes(),
      // ]);

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockFriends: Friend[] = [
        {
          id: 2,
          name: '김철수',
          email: 'kim@ssafy.com',
          currentLocation: { lat: 36.1076, lng: 128.4188 },
          isLocationSharing: true,
          busRoute: { id: 1, routeName: '1호차' },
        },
        {
          id: 3,
          name: '이영희',
          email: 'lee@ssafy.com',
          currentLocation: { lat: 36.1086, lng: 128.4198 },
          isLocationSharing: true,
          busRoute: { id: 2, routeName: '2호차' },
        },
      ];

      const mockRoutes: ShuttleRoute[] = [
        { id: 1, routeName: '1호차', color: '#FF0000' },
        { id: 2, routeName: '2호차', color: '#0000FF' },
      ];

      setFriends(mockFriends);
      setRoutes(mockRoutes);
    } catch (error: any) {
      console.error('Failed to load initial data:', error);
      showToast('데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 친구 선택 시 노선 경유지 로드
  useEffect(() => {
    if (selectedFriend?.busRoute) {
      loadRouteStops(selectedFriend.busRoute.id);
    } else {
      setRouteStops([]);
    }
  }, [selectedFriend]);

  // 노선 선택 시 경유지 로드
  useEffect(() => {
    if (selectedRoute && !selectedFriend) {
      loadRouteStops(selectedRoute.id);
    }
  }, [selectedRoute, selectedFriend]);

  // 친구 선택해서 해당 셔틀 선택 시 노선 경유지 정보 모두 로드
  const loadRouteStops = async (routeId: number) => {
    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // const stops = await shuttleApi.getRouteStops(routeId);

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockStops: ShuttleStop[] = [
        { id: 1, routeId, sequence: 1, stopName: '대전역', lat: 36.1076, lng: 128.4178, isTerminal: false },
        { id: 2, routeId, sequence: 2, stopName: '시청', lat: 36.1086, lng: 128.4188, isTerminal: false },
        { id: 3, routeId, sequence: 3, stopName: '대학교', lat: 36.1096, lng: 128.4198, isTerminal: false },
        { id: 4, routeId, sequence: 4, stopName: 'SSAFY', lat: 36.1106, lng: 128.4208, isTerminal: true },
      ];

      setRouteStops(mockStops);
      // eslint-disable-next-line
    } catch (error: any) {
      console.error('Failed to load route stops:', error);
      showToast('경유지 정보를 불러오는데 실패했습니다.', 'error');
    }
  };

  // 친구 마커 클릭
  const handleFriendClick = (friend: Friend) => {
    selectFriend(friend);
    setArrivalInfo(null); // 기존 도착 정보 초기화
  };

  // 노선 선택
  const handleRouteSelect = (route: ShuttleRoute) => {
    selectRoute(route);
    selectFriend(null); // 친구 선택 해제
    setArrivalInfo(null);
  };

  // 경유지 클릭 (개별)
  const handleStopClick = (stop: ShuttleStop) => {
    // StopSelector에서 처리하므로 여기서는 특별한 동작 없음
    console.log('Stop clicked:', stop);
  };

  // 도착 시간 계산
  const handleCalculateArrival = async () => {
    if (!selectedFriend || selectedStops.length === 0) {
      showToast('친구와 경유지를 선택해주세요.', 'error');
      return;
    }

    if (!myLocation) {
      showToast('내 위치 정보가 필요합니다.', 'error');
      return;
    }

    setIsCalculating(true);

    try {
      // TODO: 백엔드 API 연동 시 주석 해제
      // const result = await shuttleApi.calculateArrivalTime({
      //   friendId: selectedFriend.id,
      //   myLocation,
      //   selectedStopIds: selectedStops.map((s) => s.id),
      // });

      // Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + 15 * 60 * 1000); // 15분 후

      const mockResult = {
        routeName: selectedFriend.busRoute?.routeName || '셔틀 버스',
        estimatedMinutes: 15,
        estimatedArrivalTime: arrivalTime.toISOString(),
        routePath: selectedStops.map((stop) => ({ lat: stop.lat, lng: stop.lng })),
      };

      setArrivalInfo(mockResult);
      showToast('도착 시간이 계산되었습니다!', 'success');
    } catch (error: any) {
      console.error('Failed to calculate arrival time:', error);
      showToast('도착 시간 계산에 실패했습니다.', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  // 새로고침 (친구 위치 업데이트)
  const handleRefresh = async () => {
    try {
      await loadInitialData();
      showToast('친구 위치가 업데이트되었습니다.', 'success');
    } catch (error) {
      showToast('새로고침에 실패했습니다.', 'error');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className= "text-gray-700">지도를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 검색 바 */}
      <SearchBar
        friends={friends}
        routes={routes}
        onSelectFriend={handleFriendClick}
        onSelectRoute={handleRouteSelect}
      />

      {/* 새로고침 버튼 */}
      <button
        onClick={handleRefresh}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-colors z-10"
        title="친구 위치 새로고침"
      >
        <ArrowPathIcon className="w-5 h-5 text-gray-700" />
      </button>

      {/* 경유지 선택기 */}
      {selectedFriend && routeStops.length > 0 && (
        <StopSelector
          friend={selectedFriend}
          stops={routeStops}
          selectedStops={selectedStops}
          onStopsSelected={setSelectedStops}
          onCalculate={handleCalculateArrival}
          isCalculating={isCalculating}
        />
      )}

      {/* 도착 정보 카드 */}
      {arrivalInfo && (
        <ArrivalInfoCard
          arrivalInfo={arrivalInfo}
          onClose={() => setArrivalInfo(null)}
        />
      )}

      {/* 카카오 맵 */}
      {mounted && (
        <KakaoMap
          friends={friends}
          selectedFriend={selectedFriend}
          routeStops={routeStops}
          routePath={arrivalInfo?.routePath || []}
          onFriendClick={handleFriendClick}
          onStopClick={handleStopClick}
          selectedStops={selectedStops}
          myLocation={myLocation}
        />
      )}

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Mock 데이터 안내 */}
      <div className="absolute bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 max-w-xs z-10">
        <p className="font-medium">🔧 개발 모드</p>
        <p className="mt-1">Mock 데이터로 작동합니다. 백엔드 연동 후 실제 데이터가 표시됩니다.</p>
      </div>
    </div>
  );
}
