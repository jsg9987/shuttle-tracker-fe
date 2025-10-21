'use client';

import { useEffect, useRef, useState } from 'react';
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk';
import type { Friend, ShuttleStop, Location } from '@/types';

interface KakaoMapProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  routeStops: ShuttleStop[];
  routePath: Location[];
  onFriendClick: (friend: Friend) => void;
  onStopClick: (stop: ShuttleStop) => void;
  selectedStops: ShuttleStop[];
  myLocation: Location | null;
}

export const KakaoMap = ({
  friends,
  selectedFriend,
  routeStops,
  routePath,
  onFriendClick,
  onStopClick,
  selectedStops,
  myLocation,
}: KakaoMapProps) => {
  const [center, setCenter] = useState<Location>({
    lat: 36.1076, // SSAFY 대전 캠퍼스 기본 위치
    lng: 128.4178,
  });
  const [level, setLevel] = useState(5);

  // 선택된 친구가 있으면 해당 위치로 중심 이동
  useEffect(() => {
    if (selectedFriend?.currentLocation) {
      setCenter(selectedFriend.currentLocation);
      setLevel(3);
    }
  }, [selectedFriend]);

  // 내 위치가 있으면 초기 중심을 내 위치로
  useEffect(() => {
    if (myLocation && !selectedFriend) {
      setCenter(myLocation);
    }
  }, [myLocation, selectedFriend]);

  return (
    <Map
      center={center}
      style={{ width: '100%', height: '100%' }}
      level={level}
    >
      {/* 내 위치 마커 */}
      {myLocation && (
        <MapMarker
          position={myLocation}
          image={{
            src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            size: { width: 24, height: 35 },
          }}
          title="내 위치"
        />
      )}

      {/* 친구 마커들 */}
      {friends.map((friend) => {
        if (!friend.currentLocation || !friend.isLocationSharing) return null;

        const isSelected = selectedFriend?.id === friend.id;

        return (
          <MapMarker
            key={friend.id}
            position={friend.currentLocation}
            onClick={() => onFriendClick(friend)}
            image={{
              src: isSelected
                ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
                : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
              size: { width: 32, height: 42 },
            }}
            title={friend.name}
          />
        );
      })}

      {/* 경유지 마커들 */}
      {routeStops.map((stop) => {
        const isSelected = selectedStops.some((s) => s.id === stop.id);

        return (
          <MapMarker
            key={stop.id}
            position={{ lat: stop.lat, lng: stop.lng }}
            onClick={() => onStopClick(stop)}
            image={{
              src: isSelected
                ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_green.png'
                : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
              size: { width: 36, height: 37 },
            }}
            title={`${stop.sequence}. ${stop.stopName}`}
          />
        );
      })}

      {/* 노선 경로 */}
      {routePath.length > 0 && (
        <Polyline
          path={routePath}
          strokeWeight={5}
          strokeColor="#FF0000"
          strokeOpacity={0.7}
          strokeStyle="solid"
        />
      )}

      {/* 경유지 연결 경로 (선택되지 않은 경우 점선으로 표시) */}
      {routeStops.length > 1 && routePath.length === 0 && (
        <Polyline
          path={routeStops.map((stop) => ({ lat: stop.lat, lng: stop.lng }))}
          strokeWeight={3}
          strokeColor="#0000FF"
          strokeOpacity={0.5}
          strokeStyle="dashed"
        />
      )}
    </Map>
  );
};
