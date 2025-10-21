import { create } from 'zustand';
import type { Friend, ShuttleRoute, ShuttleStop, ArrivalTimeResponse } from '@/types';

interface MapState {
  // State
  friends: Friend[]; // 친구 목록
  selectedFriend: Friend | null; // 선택된 친구
  selectedRoute: ShuttleRoute | null; // 선택된 노선
  routes: ShuttleRoute[]; // 모든 노선 목록
  selectedStops: ShuttleStop[]; // 선택된 경유지들 (남은 경유지)
  arrivalInfo: ArrivalTimeResponse | null; // 도착 시간 예측 정보
  isCalculating: boolean; // 도착 시간 계산 중인지

  // Actions
  setFriends: (friends: Friend[]) => void;
  selectFriend: (friend: Friend | null) => void;
  setRoutes: (routes: ShuttleRoute[]) => void;
  selectRoute: (route: ShuttleRoute | null) => void;
  setSelectedStops: (stops: ShuttleStop[]) => void;
  setArrivalInfo: (info: ArrivalTimeResponse | null) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  clearMapData: () => void;
  updateFriendLocation: (friendId: number, location: { lat: number; lng: number }) => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  friends: [],
  selectedFriend: null,
  selectedRoute: null,
  routes: [],
  selectedStops: [],
  arrivalInfo: null,
  isCalculating: false,

  // Actions
  setFriends: (friends) =>
    set({ friends }),

  selectFriend: (friend) =>
    set({
      selectedFriend: friend,
      selectedRoute: friend?.busRoute || null,
      arrivalInfo: null, // 친구 변경 시 도착 정보 초기화
    }),

  setRoutes: (routes) =>
    set({ routes }),

  selectRoute: (route) =>
    set({
      selectedRoute: route,
      selectedStops: [], // 노선 변경 시 선택된 경유지 초기화
    }),

  setSelectedStops: (stops) =>
    set({ selectedStops: stops }),

  setArrivalInfo: (info) =>
    set({ arrivalInfo: info }),

  setIsCalculating: (isCalculating) =>
    set({ isCalculating }),

  clearMapData: () =>
    set({
      selectedFriend: null,
      selectedRoute: null,
      selectedStops: [],
      arrivalInfo: null,
      isCalculating: false,
    }),

  updateFriendLocation: (friendId, location) =>
    set((state) => ({
      friends: state.friends.map((friend) =>
        friend.id === friendId
          ? { ...friend, currentLocation: location }
          : friend
      ),
      selectedFriend:
        state.selectedFriend?.id === friendId
          ? { ...state.selectedFriend, currentLocation: location }
          : state.selectedFriend,
    })),
}));
