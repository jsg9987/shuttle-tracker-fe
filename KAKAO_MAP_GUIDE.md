# 카카오맵 구현 가이드

## 📚 공식 문서 링크

### 1. react-kakao-maps-sdk (현재 프로젝트에서 사용 중)
- **GitHub**: https://github.com/JaeSeoKim/react-kakao-maps-sdk
- **예제**: https://react-kakao-maps-sdk.jaeseokim.dev/
- **장점**: React 컴포넌트 방식, TypeScript 지원

### 2. 카카오맵 JavaScript API
- **공식 가이드**: https://apis.map.kakao.com/web/guide/
- **API 문서**: https://apis.map.kakao.com/web/documentation/
- **샘플**: https://apis.map.kakao.com/web/sample/

### 3. 카카오 모빌리티 API (경로 탐색)
- **공식 문서**: https://developers.kakaomobility.com/docs
- **REST API 가이드**: https://developers.kakaomobility.com/docs/navi-api/directions/
- **주의**: REST API는 백엔드에서 호출 권장 (API 키 노출 방지)

---

## 🛠️ 현재 프로젝트 구조

### 설정 완료된 사항
```
✅ layout.tsx - 카카오맵 스크립트 로드 (https://dapi.kakao.com/v2/maps/sdk.js)
✅ .env.local - API 키 설정
   - NEXT_PUBLIC_KAKAO_MAP_APP_KEY (JavaScript 키)
   - NEXT_PUBLIC_KAKAO_MOBILITY_API_KEY (REST API 키)
✅ KakaoMap.tsx - 기본 구조 준비됨 (복잡한 로딩 로직 제거)
```

### 제거된 코드
- 복잡한 재시도 로직
- 무한 루프 가능성 있는 로딩 체크
- 불필요한 로그

---

## 📝 구현 순서 (단계별)

### Phase 1: 기본 맵 렌더링 확인
**목표**: 카카오맵이 화면에 표시되는지 확인

```tsx
// KakaoMap.tsx - 최소 구현
import { Map } from 'react-kakao-maps-sdk';

return (
  <Map
    center={{ lat: 36.1076, lng: 128.4178 }}
    style={{ width: '100%', height: '100%' }}
    level={5}
  >
    {/* 여기에 마커들 추가 */}
  </Map>
);
```

**확인 사항**:
- [ ] 맵이 화면에 표시되는가?
- [ ] 드래그/줌이 작동하는가?
- [ ] 콘솔에 에러가 없는가?

---

### Phase 2: 내 위치 마커 표시
**목표**: 내 현재 위치를 별 마커로 표시

```tsx
import { Map, MapMarker } from 'react-kakao-maps-sdk';

// 내 위치 마커 (myLocation이 있을 때만)
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
```

**확인 사항**:
- [ ] 위치 공유를 켰을 때 별 마커가 나타나는가?
- [ ] 위치가 변경될 때 마커도 이동하는가?

---

### Phase 3: 친구 마커 표시
**목표**: 위치 공유 중인 친구들을 파란 마커로 표시

```tsx
// 친구 마커들
{friends.map((friend) => {
  // 위치 공유 중이 아니면 표시 안 함
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
```

**확인 사항**:
- [ ] Mock 친구 데이터의 마커가 표시되는가?
- [ ] 친구 마커를 클릭하면 빨간색으로 변하는가?
- [ ] 친구 선택 시 경유지 선택기가 나타나는가?

---

### Phase 4: 경유지 마커 표시
**목표**: 선택된 친구의 노선 경유지를 숫자 마커로 표시

```tsx
// 경유지 마커들
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
```

**참고**: 카카오 기본 숫자 마커는 1-9까지만 지원. 10개 이상이면 커스텀 마커 이미지 필요.

**확인 사항**:
- [ ] 친구 선택 시 경유지 마커들이 표시되는가?
- [ ] 경유지 선택 시 초록색으로 변하는가?

---

### Phase 5: 경로 폴리라인 표시
**목표**: 선택된 경유지들을 선으로 연결

```tsx
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk';

// 도착 시간 계산 완료 후 - 빨간 실선
{routePath.length > 0 && (
  <Polyline
    path={routePath}
    strokeWeight={5}
    strokeColor="#FF0000"
    strokeOpacity={0.7}
    strokeStyle="solid"
  />
)}

// 경유지만 선택된 경우 - 파란 점선 (임시)
{routeStops.length > 1 && routePath.length === 0 && (
  <Polyline
    path={routeStops.map((stop) => ({ lat: stop.lat, lng: stop.lng }))}
    strokeWeight={3}
    strokeColor="#0000FF"
    strokeOpacity={0.5}
    strokeStyle="dashed"
  />
)}
```

**확인 사항**:
- [ ] 경유지들이 점선으로 연결되는가?
- [ ] 도착 시간 계산 후 실선으로 변하는가?

---

### Phase 6: 맵 중심 이동
**목표**: 친구 선택 시 해당 위치로 맵 이동

```tsx
const [center, setCenter] = useState<Location>({ lat: 36.1076, lng: 128.4178 });
const [level, setLevel] = useState(5);

// 선택된 친구가 있으면 해당 위치로 중심 이동
useEffect(() => {
  if (selectedFriend?.currentLocation) {
    setCenter(selectedFriend.currentLocation);
    setLevel(3); // 줌 레벨 3 (더 가깝게)
  }
}, [selectedFriend]);

// 내 위치가 있으면 초기 중심을 내 위치로
useEffect(() => {
  if (myLocation && !selectedFriend) {
    setCenter(myLocation);
  }
}, [myLocation, selectedFriend]);
```

**확인 사항**:
- [ ] 친구 선택 시 맵이 해당 위치로 이동하는가?
- [ ] 줌 레벨이 적절한가?

---

### Phase 7: 카카오 모빌리티 API 연동 (백엔드)
**목표**: 실제 경로와 도착 시간 계산

**⚠️ 중요**: 카카오 모빌리티 API는 **백엔드에서 호출**해야 함 (API 키 노출 방지)

#### 백엔드 API 엔드포인트 예시
```
POST /api/shuttle/arrival-time

Request Body:
{
  "friendId": 2,
  "myLocation": { "lat": 36.1076, "lng": 128.4178 },
  "selectedStopIds": [3, 4, 5]
}

Response:
{
  "routeName": "1호차",
  "estimatedMinutes": 15,
  "estimatedArrivalTime": "2025-10-22T15:30:00Z",
  "routePath": [
    { "lat": 36.1086, "lng": 128.4188 },
    { "lat": 36.1096, "lng": 128.4198 },
    ...
  ]
}
```

#### 백엔드에서 카카오 모빌리티 API 호출 예시 (Java/Spring)
```java
// 카카오 모빌리티 API - 경로 탐색
RestTemplate restTemplate = new RestTemplate();
HttpHeaders headers = new HttpHeaders();
headers.set("Authorization", "KakaoAK " + kakaoMobilityApiKey);
headers.setContentType(MediaType.APPLICATION_JSON);

Map<String, Object> requestBody = new HashMap<>();
requestBody.put("origin", Map.of("x", friendLng, "y", friendLat));
requestBody.put("destination", Map.of("x", myLng, "y", myLat));
requestBody.put("waypoints", waypoints); // 경유지들

HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
ResponseEntity<KakaoDirectionsResponse> response = restTemplate.exchange(
  "https://apis-navi.kakaomobility.com/v1/directions",
  HttpMethod.POST,
  entity,
  KakaoDirectionsResponse.class
);
```

**카카오 모빌리티 API 문서**:
- https://developers.kakaomobility.com/docs/navi-api/directions/

**확인 사항**:
- [ ] 백엔드 API가 경로와 시간을 반환하는가?
- [ ] 프론트엔드에서 routePath를 받아 폴리라인으로 표시하는가?

---

## 🎨 커스텀 마커 만들기 (선택사항)

기본 카카오 마커 외에 커스텀 마커가 필요한 경우:

```tsx
<MapMarker
  position={position}
  image={{
    src: '/images/custom-marker.png', // public 폴더에 이미지 저장
    size: { width: 40, height: 40 },
  }}
/>
```

또는 HTML 오버레이 사용:
```tsx
import { CustomOverlayMap } from 'react-kakao-maps-sdk';

<CustomOverlayMap position={position}>
  <div style={{
    background: 'white',
    border: '2px solid blue',
    borderRadius: '8px',
    padding: '5px',
  }}>
    {friend.name}
  </div>
</CustomOverlayMap>
```

---

## 🚨 주의사항 및 팁

### 1. react-kakao-maps-sdk vs 순수 카카오맵 API
- **현재 프로젝트**: react-kakao-maps-sdk 사용 중 (권장)
- **순수 API**: `window.kakao.maps` 직접 사용 (더 복잡, 타입 안전성 낮음)

### 2. autoload=false 설정 이유
```tsx
// layout.tsx에서
src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false"
```
- `autoload=false`: react-kakao-maps-sdk가 내부적으로 로딩 관리
- 수동으로 `kakao.maps.load()` 호출 필요 없음 (라이브러리가 처리)

### 3. 환경 변수 사용 시 주의
- `NEXT_PUBLIC_` 접두사 = 브라우저에 노출됨
- JavaScript 키는 노출되어도 됨 (도메인 제한으로 보호)
- REST API 키는 백엔드에서만 사용 (프론트에 노출 금지)

### 4. 카카오 개발자 콘솔 설정
- **필수**: Web 플랫폼 등록
- **필수**: 사이트 도메인에 `http://localhost:3000` 추가
- 설정 안 하면 스크립트 로딩 실패

### 5. 좌표계 주의
- 카카오맵: **WGS84 좌표계** (위도, 경도)
- Geolocation API도 WGS84 사용 → 변환 불필요

### 6. 성능 최적화
```tsx
// 친구 마커가 많을 경우 useMemo 사용
const friendMarkers = useMemo(() => {
  return friends.map((friend) => {
    // ... 마커 렌더링
  });
}, [friends, selectedFriend]);
```

### 7. 타입 안전성
```tsx
// window.kakao 타입 에러 해결 (필요시)
// src/types/kakao.d.ts 생성
declare global {
  interface Window {
    kakao: any;
  }
}
export {};
```

---

## 🧪 테스트 체크리스트

### 기본 기능
- [ ] 맵이 정상적으로 렌더링됨
- [ ] 드래그, 줌 인/아웃 작동
- [ ] 내 위치 마커 표시 (위치 공유 ON 시)
- [ ] 친구 마커 표시 (위치 공유 중인 친구만)
- [ ] 친구 클릭 시 선택 상태 변경 (파란색 → 빨간색)

### 경유지 기능
- [ ] 친구 선택 시 해당 노선의 경유지 마커 표시
- [ ] 경유지 선택기 드롭다운 작동
- [ ] 시작 경유지 선택 시 나머지 자동 선택
- [ ] 선택된 경유지가 초록색으로 변경

### 경로 표시
- [ ] 경유지들이 점선으로 연결됨 (임시)
- [ ] 도착 시간 계산 후 실선으로 변경 (실제 경로)
- [ ] 폴리라인 색상, 두께 적절

### 상호작용
- [ ] 친구 선택 시 맵 중심 이동 및 줌
- [ ] 검색 기능 (친구명, 노선명)
- [ ] 새로고침 버튼으로 친구 위치 업데이트

---

## 🔗 유용한 리소스

### GitHub 이슈 및 예제
- react-kakao-maps-sdk 이슈: https://github.com/JaeSeoKim/react-kakao-maps-sdk/issues
- Next.js + 카카오맵 예제: https://github.com/JaeSeoKim/react-kakao-maps-sdk/tree/main/examples/nextjs

### 카카오 개발자 포럼
- https://devtalk.kakao.com/

---

## 📞 문제 해결 가이드

### 문제 1: 맵이 검은 화면으로 나옴
**원인**: 스크립트 로딩 실패 또는 API 키 문제
**해결**:
1. 브라우저 콘솔(F12) 확인
2. 카카오 개발자 콘솔에서 Web 플랫폼 등록 확인
3. localhost 도메인 등록 확인
4. API 키가 .env.local에 제대로 설정되어 있는지 확인

### 문제 2: 마커가 표시되지 않음
**원인**: 좌표값 문제 또는 조건부 렌더링 오류
**해결**:
1. `console.log`로 좌표값 확인
2. 조건문 확인 (isLocationSharing 등)
3. 마커 이미지 URL 확인

### 문제 3: 폴리라인이 이상하게 그려짐
**원인**: 좌표 순서 문제
**해결**:
1. routePath 배열 순서 확인
2. 경유지 sequence 순서 확인

---

## 🎯 다음 단계 (구현 완료 후)

1. **백엔드 API 연동**
   - Mock 데이터 → 실제 API 호출
   - 친구 목록, 위치, 경유지 실시간 조회

2. **실시간 업데이트**
   - WebSocket 또는 Polling으로 친구 위치 업데이트
   - 새로고침 버튼 대신 자동 갱신 (선택사항)

3. **성능 최적화**
   - 마커 클러스터링 (친구가 많을 경우)
   - React.memo로 불필요한 리렌더링 방지

4. **사용자 경험 개선**
   - 로딩 상태 표시
   - 에러 처리 및 토스트 메시지
   - 애니메이션 효과

---

**행운을 빕니다! 🚀**
