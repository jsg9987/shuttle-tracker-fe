'use client';

import { useEffect, useCallback } from 'react';
import { useLocationStore } from '@/stores';
import {
  watchPosition,
  clearWatch,
  requestLocationPermission,
  getGeolocationErrorMessage,
} from '@/lib/utils/geolocation';
import { locationApi } from '@/lib/api';

export const useGeolocation = () => {
  const { setMyLocation, setWatchId, watchId } = useLocationStore();

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
          // Zustand 스토어에 저장
          setMyLocation(location);

          // 위치 공유 중이면 서버에 업데이트 (필요시)
          try {
            await locationApi.updateMyLocation(location);
          } catch (error) {
            console.error('Failed to update location to server:', error);
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
