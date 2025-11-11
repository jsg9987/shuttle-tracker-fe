import type { Location } from '@/types';

// Geolocation API 사용 가능 여부 확인
export const isGeolocationAvailable = (): boolean => {
  return 'geolocation' in navigator;
};

// 현재 위치 한 번 가져오기
export const getCurrentPosition = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false, // 빠른 위치 획득 (낮은 정확도)
        timeout: 30000, // 30초 타임아웃
        maximumAge: 5000, // 5초 이내 캐시 허용
      }
    );
  });
};

// 위치 권한 요청
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    await getCurrentPosition();
    return true;
  } catch (error) {
    console.error('Location permission denied:', error);
    return false;
  }
};

// 위치 실시간 추적 시작
export const watchPosition = (
  onSuccess: (location: Location) => void,
  onError?: (error: GeolocationPositionError) => void
): number => {
  if (!isGeolocationAvailable()) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.error('Watch position error:', error);
      if (onError) {
        onError(error);
      }
    },
    {
      enableHighAccuracy: false, // 빠른 위치 획득 (낮은 정확도)
      timeout: 30000, // 30초 타임아웃
      maximumAge: 5000, // 5초 이내 캐시 허용
    }
  );

  return watchId;
};

// 위치 추적 중지
export const clearWatch = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};

// 위치 에러 메시지 변환
export const getGeolocationErrorMessage = (
  error: GeolocationPositionError
): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
    case error.POSITION_UNAVAILABLE:
      return '위치 정보를 사용할 수 없습니다.';
    case error.TIMEOUT:
      return '위치 정보를 가져오는 시간이 초과되었습니다.';
    default:
      return '위치 정보를 가져오는 중 오류가 발생했습니다.';
  }
};

// 두 위치 간의 거리 계산 (Haversine formula, 단위: km)
export const calculateDistance = (
  loc1: Location,
  loc2: Location
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) *
      Math.cos(toRad(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};
