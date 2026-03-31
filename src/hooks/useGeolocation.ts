'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useLocationStore } from '@/stores';
import {
  watchPosition,
  clearWatch,
  requestLocationPermission,
  getGeolocationErrorMessage,
} from '@/lib/utils/geolocation';
import { updateMyLocation } from '@/lib/api/location';

const SERVER_UPDATE_INTERVAL_MS = 10_000; // 서버 전송 주기: 10초

export const useGeolocation = () => {
  const { setMyLocation, setWatchId, watchId } = useLocationStore();
  const lastServerUpdateRef = useRef<number>(0);

  // 위치 추적 시작
  const startTracking = useCallback(async () => {
    try {
      // 위치 권한 요청
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('위치 권한이 필요합니다.');
      }

      // 위치 추적 시작
      const id = watchPosition(
        async (location) => {
          // UI는 즉시 반영
          setMyLocation(location);

          // 서버 업데이트는 10초 간격으로 쓰로틀링
          // getState()로 항상 최신 isSharing 값 읽기 (stale closure 방지)
          if (useLocationStore.getState().isSharing) {
            const now = Date.now();
            if (now - lastServerUpdateRef.current < SERVER_UPDATE_INTERVAL_MS) return;
            lastServerUpdateRef.current = now;
            try {
              await updateMyLocation(location.lat, location.lng);
            } catch (error) {
              console.error('Failed to update location to server:', error);
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', getGeolocationErrorMessage(error));
        }
      );

      setWatchId(id);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      throw error;
    }
  }, [setMyLocation, setWatchId]);

  // 위치 추적 중지
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId, setWatchId]);

  // 컴포넌트 언마운트 시 자동으로 추적 중지
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    startTracking,
    stopTracking,
  };
};
