import { create } from 'zustand';
import type { Location, LocationShare } from '@/types';

interface LocationState {
  // State
  myLocation: Location | null; // 내 현재 위치
  locationShare: LocationShare | null; // 내 위치 공유 세션
  isSharing: boolean; // 위치 공유 중인지
  remainingTime: number | null; // 남은 시간 (초)

  // Geolocation watch ID
  watchId: number | null;

  // Actions
  setMyLocation: (location: Location) => void;
  startLocationSharing: (locationShare: LocationShare) => void;
  stopLocationSharing: () => void;
  setRemainingTime: (seconds: number) => void;
  setWatchId: (id: number | null) => void;
  clearLocationData: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  // Initial state
  myLocation: null,
  locationShare: null,
  isSharing: false,
  remainingTime: null,
  watchId: null,

  // Actions
  setMyLocation: (location) =>
    set({ myLocation: location }),

  startLocationSharing: (locationShare) =>
    set({
      locationShare,
      isSharing: true,
      remainingTime: 3600, // 1시간 = 3600초
    }),

  stopLocationSharing: () =>
    set({
      locationShare: null,
      isSharing: false,
      remainingTime: null,
    }),

  setRemainingTime: (seconds) =>
    set({ remainingTime: seconds }),

  setWatchId: (id) =>
    set({ watchId: id }),

  clearLocationData: () =>
    set({
      myLocation: null,
      locationShare: null,
      isSharing: false,
      remainingTime: null,
      watchId: null,
    }),
}));
