'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useMapStore, useLocationStore } from '@/stores';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getFriendsLocations } from '@/lib/api/location';
import { getFriends } from '@/lib/api/friend';
import { getAllRoutes, getRouteStops, calculateArrivalTime } from '@/lib/api/shuttle';
import { KakaoMap, ArrivalInfoCard, SearchBar } from '@/components/map';
import { Button, useToast, Toast } from '@/components/common';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { Friend, ShuttleRoute, ShuttleStop } from '@/types';

export default function MapPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { myLocation, isSharing } = useLocationStore();
  const { startTracking, stopTracking } = useGeolocation();
  const {
    friends,
    selectedFriend,
    routes,
    selectedRoute,
    arrivalInfo,
    isCalculating,
    setFriends,
    selectFriend,
    setRoutes,
    selectRoute,
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

  // 맵 페이지 진입 시 내 위치 추적 시작
  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    // 위치 공유 중이 아닐 때만 맵에서 위치 추적 시작
    if (!isSharing) {
      startTracking().catch((error) => {
        console.error('Failed to start location tracking:', error);
        showToast('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.', 'error');
      });
    }

    // 컴포넌트 언마운트 시 위치 추적 중지 (위치 공유 중이면 유지)
    return () => {
      if (!isSharing) {
        stopTracking();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated]);

  // 셔틀 맵 확인 페이지 들어왔을 때 가져와야할 친구, 노선 정보 로드
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [friendLocations, allFriends, routesData] = await Promise.all([
        getFriendsLocations(),
        getFriends(),
        getAllRoutes(),
      ]);

      // 위치 공유 중인 친구 맵 (friendId → location 데이터)
      const locationMap = new Map(
        friendLocations.filter((fl) => fl.isActive).map((fl) => [fl.friendId, fl])
      );

      // 전체 친구 목록 기준으로 병합 (위치 공유 중이면 위치 정보 포함)
      const friendsData: Friend[] = allFriends.map((f) => {
        const loc = locationMap.get(f.friendId);
        return {
          id: f.friendId,
          name: f.friendName,
          email: f.friendEmail,
          isLocationSharing: !!loc,
          currentLocation: loc ? { lat: loc.latitude, lng: loc.longitude } : undefined,
          busRoute: loc?.routeId ? { id: loc.routeId, routeName: loc.routeName ?? '' } : undefined,
        };
      });

      // ShuttleRoute API 응답 → types 변환 (routeId → id)
      const routes: ShuttleRoute[] = routesData.map((route, index) => ({
        id: route.routeId,
        routeName: route.routeName,
        color: ['#FF0000', '#0000FF', '#00FF00', '#FFA500'][index % 4], // 색상 할당
      }));

      setFriends(friendsData);
      setRoutes(routes);
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
      const stopsData = await getRouteStops(routeId);

      // ShuttleStop API 응답 → types 변환 (stopId → id, latitude → lat, longitude → lng)
      const stops: ShuttleStop[] = stopsData.map((stop) => ({
        id: stop.stopId,
        routeId,
        sequence: stop.sequence,
        stopName: stop.stopName,
        lat: stop.latitude,
        lng: stop.longitude,
        isTerminal: stop.isTerminal,
      }));

      setRouteStops(stops);
    } catch (error: any) {
      console.error('Failed to load route stops:', error);
      showToast('경유지 정보를 불러오는데 실패했습니다.', 'error');
    }
  };

  // 친구 마커 클릭 → 자동으로 도착 시간 계산
  const handleFriendClick = async (friend: Friend) => {
    if (!friend.isLocationSharing) {
      showToast(`${friend.name}님은 현재 위치를 공유하고 있지 않습니다.`, 'error');
      return;
    }
    selectFriend(friend);
    setArrivalInfo(null);

    if (friend.busRoute) {
      await handleCalculateArrival(friend.busRoute.id);
    }
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
  const handleCalculateArrival = async (routeId: number) => {
    setIsCalculating(true);
    try {
      const result = await calculateArrivalTime({ routeId });
      setArrivalInfo(result);
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
          routePath={[]}
          onFriendClick={handleFriendClick}
          onStopClick={handleStopClick}
          selectedStops={[]}
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

    </div>
  );
}
