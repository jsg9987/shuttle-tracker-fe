# 개발 작업 기록 및 컨텍스트

> 이 문서는 다른 환경에서 작업을 이어갈 때 참고할 개발 히스토리와 컨텍스트를 담고 있습니다.

## 📅 개발 일지

### 2025-10-23 (Phase 10 완료)

**작업 요약**: 마이페이지 추가, 맵 기능 개선, 마커 이미지 수정 및 버그 수정

#### 주요 변경사항
1. **마이페이지 신규 생성** (`/mypage`)
   - 사용자 정보 표시 (이름, 이메일, ID)
   - 위치 공유 영구 동의 토글 기능
   - 비밀번호 변경 폼
   - Navbar에 마이페이지 링크 추가

2. **셔틀 맵 UX 개선**
   - 친구 클릭 시 경유지 연결 점선 제거 (경유지 마커만 표시)
   - Geolocation API 맵 페이지 자동 통합
   - 경유지 선택 창 모바일 반응형 최적화 (max-h 제한, overflow 처리)
   - 맵 드래그/줌 기능 명시적 활성화

3. **마커 이미지 시스템 개선**
   - 카카오 CDN URL (404 에러) → 로컬 SVG 파일로 교체
   - 5개 커스텀 마커 생성: 내 위치(별), 친구(핀), 경유지(원)
   - 외부 의존성 제거 및 로딩 속도 개선

4. **버그 수정**
   - useEffect 의존성 문제로 인한 위치 추적 중단 이슈 해결
   - cleanup 함수 최적화 (마운트 시에만 추적 시작)

5. **아키텍처 확인**
   - 카카오 모빌리티 API는 백엔드에서 호출하는 구조 확인
   - 프론트엔드는 백엔드 API만 호출 (보안/CORS/비용 관리)

### 2025-10-21 (Phase 1-9 완료)

**작업 요약**: SSAFY 셔틀 버스 위치 추적 서비스 프론트엔드 초안 완성

---

## 🎯 프로젝트 개요

### 목적
SSAFY 교육생들이 셔틀 버스 도착 시간을 편하게 확인할 수 있도록 하는 서비스

### 핵심 개념
- 버스에 탄 친구가 위치 공유를 켜면
- 다른 친구들이 맵에서 그 친구 위치를 보고
- 경유지를 선택하여 도착 시간을 예측

---

## 🏗️ 아키텍처 결정 사항

### 1. 기술 스택 선택 이유
- **Next.js 15.5.6**: App Router, Server/Client Component 분리
- **TypeScript**: DB 스키마 기반 타입 안전성
- **Zustand**: 간단한 전역 상태 관리 (Redux보다 가벼움)
- **Tailwind CSS**: 빠른 스타일링, 반응형 지원
- **Axios**: HTTP 클라이언트, Interceptor 활용

### 2. 상태 관리 전략
```
authStore (persist)     → localStorage에 로그인 세션 저장
locationStore           → 위치 공유 상태, 실시간 위치
mapStore                → 친구 목록, 선택된 친구/노선, 도착 정보
```

### 3. 디렉토리 구조 설계
```
src/
├── app/              # 페이지 (App Router)
├── components/       # 재사용 컴포넌트
├── stores/          # Zustand 스토어
├── types/           # TypeScript 타입 (DB 스키마 기반)
├── lib/api/         # API 클라이언트
├── lib/utils/       # 유틸리티 함수
└── hooks/           # 커스텀 훅
```

---

## 🔧 주요 설계 결정

### 1. 위치 공유 1시간 제한
**문제**: 브라우저를 닫으면 클라이언트 타이머가 초기화됨

**해결**:
- **클라이언트**: 1시간 타이머 UI 표시 (사용자 경험)
- **서버**: `Location_share` 테이블의 `start_time`, `end_time`으로 실제 만료 시간 관리

### 2. 경유지 선택 UX 개선
**초기 아이디어**: 사용자가 남은 경유지를 하나씩 클릭

**개선된 방식** (채택):
1. 친구 마커 클릭
2. **드롭다운으로 시작 경유지 하나만 선택**
3. 해당 경유지부터 종점까지 자동 선택
4. 도착 시간 계산

→ 클릭 횟수 대폭 감소, UX 개선

### 3. 실시간 업데이트 vs On-Demand
**결정**: WebSocket/Polling 대신 **새로고침 버튼** 방식 채택

**이유**:
- 셔틀 버스 확인은 3분에 한 번 정도
- 서버 부하 감소
- 비용 절감
- 필요시 WebSocket 추가 가능 (선택사항)

### 4. 카카오 모빌리티 API 캐싱
**전략**:
- **서버**: Redis로 동일 경로 요청 캐싱 (중복 API 호출 방지)
- **클라이언트**: 최근 검색 결과 로컬 캐싱 (선택사항)

---

## 📊 구현 완료 현황

### Phase 1: 프로젝트 기반 설정 ✅
- Next.js 14+ 프로젝트 생성
- 의존성 설치: zustand, axios, heroicons, react-kakao-maps-sdk
- 환경 변수 설정 (`.env.local`)

### Phase 2: 타입 정의 ✅
- DB 스키마 기반 TypeScript 타입 작성
- User, Friend, ShuttleRoute, ShuttleStop, LocationShare 등

### Phase 3: Zustand 스토어 ✅
- authStore: 인증 상태 (persist 적용)
- locationStore: 위치 공유 상태
- mapStore: 맵 및 친구 상태

### Phase 4: API 클라이언트 & 유틸리티 ✅
- Axios 인스턴스 + Interceptor (자동 토큰 추가, 401 처리)
- API 함수: auth, location, friend, shuttle
- Geolocation 유틸리티 (watchPosition, 거리 계산)
- useGeolocation 커스텀 훅

### Phase 5: 인증 페이지 ✅
- 로그인 (`/login`)
- 회원가입 (`/signup`)
- Validation 및 에러 처리

### Phase 6: 네비게이션 바 ✅
- 로그인 전/후 조건부 렌더링
- SSAFY 로고, 친구 버튼, 로그아웃

### Phase 7: 홈 페이지 ✅
- 위치 공유 토글 (1시간 타이머)
- 셔틀 맵 이동 버튼
- 사용 방법 안내

### Phase 8: 셔틀 맵 페이지 ✅
- 카카오맵 통합
- 친구/내 위치 마커
- 경유지 표시 및 선택
- 검색 기능 (친구/노선)
- 도착 시간 예측

### Phase 9: 친구 관리 페이지 ✅
- 친구 목록 조회
- 친구 추가 요청 (이메일 검색)
- 받은 요청 수락/거절
- 친구 삭제

### Phase 10: 마이페이지 및 맵 개선 ✅
- 마이페이지 생성 (위치 공유 동의, 비밀번호 변경)
- Geolocation API 맵 자동 통합
- 마커 이미지 로컬 SVG로 교체
- 경유지 선택 창 모바일 최적화
- 위치 추적 버그 수정

---

## 🔑 중요 파일 위치

### 핵심 타입 정의
```
src/types/index.ts
→ 모든 TypeScript 타입 정의 (DB 스키마 기반)
```

### API 클라이언트
```
src/lib/api/client.ts
→ Axios 인스턴스, Interceptor 설정
→ 401 에러 시 자동 로그아웃 처리
```

### 상태 관리
```
src/stores/authStore.ts      → 로그인 상태 (persist)
src/stores/locationStore.ts  → 위치 공유 상태
src/stores/mapStore.ts       → 맵 관련 상태
```

### 위치 추적
```
src/lib/utils/geolocation.ts → Geolocation API 헬퍼
src/hooks/useGeolocation.ts  → 위치 추적 커스텀 훅
```

---

## 🐛 알려진 이슈 및 TODO

### 현재 상태
- ✅ 모든 기능이 Mock 데이터로 작동
- ⚠️ 카카오맵 API 키 필요 (`.env.local`에 실제 키 설정 필요)
- ⚠️ 백엔드 API 연동 대기 중

### 백엔드 연동 시 해야 할 일
1. `.env.local`에서 `NEXT_PUBLIC_API_BASE_URL` 수정
2. 각 API 파일에서 Mock 데이터 삭제, 실제 API 호출 주석 해제
   - `src/lib/api/auth.ts`
   - `src/lib/api/location.ts`
   - `src/lib/api/friend.ts`
   - `src/lib/api/shuttle.ts`
3. 페이지에서 Mock 데이터 삭제
   - `src/app/page.tsx`
   - `src/app/map/page.tsx`
   - `src/app/friends/page.tsx`

### 추가 개발 예정
- [x] 프로필/설정 페이지 (비밀번호 변경, 위치 공유 동의 설정) ✅
- [ ] 이메일로 사용자 검색 API 추가 필요
- [ ] WebSocket 실시간 업데이트 (선택사항)
- [ ] PWA 지원
- [ ] 푸시 알림

### 최근 해결된 이슈
- [x] 카카오 마커 이미지 404 에러 → 로컬 SVG로 교체 ✅
- [x] 위치 추적 중단 버그 (useEffect 의존성 문제) ✅
- [x] 경유지 선택 창 모바일 크기 문제 ✅

---

## 💡 개발 팁

### Mock 데이터 찾기
모든 페이지와 API 함수에 `// TODO: 백엔드 API 연동 시 주석 해제` 주석이 있습니다.
Mock 데이터 부분을 찾아서 삭제/주석 처리하고 실제 API를 호출하면 됩니다.

### 개발 서버 실행
```bash
npm run dev
# 포트 3000 또는 3001에서 실행
```

### 타입 에러 발생 시
DB 스키마가 변경되었다면 `src/types/index.ts` 파일의 타입을 먼저 수정하세요.

### Zustand DevTools
브라우저 콘솔에서 Redux DevTools로 상태 확인 가능 (persist 스토어는 localStorage 확인)

---

## 🤝 백엔드 협업 가이드

### 필요한 백엔드 API 엔드포인트

#### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `GET /api/auth/me` - 내 정보 조회
- `PUT /api/auth/password` - 비밀번호 변경
- `PUT /api/auth/location-share-agree` - 위치 공유 동의 설정

#### 위치 공유
- `POST /api/location/start` - 위치 공유 시작 (1시간)
- `POST /api/location/stop` - 위치 공유 중지
- `PUT /api/location/update` - 내 위치 업데이트
- `GET /api/location/me` - 내 위치 공유 세션 조회
- `GET /api/location/friend/:friendId` - 친구 위치 조회

#### 친구
- `GET /api/friends` - 친구 목록 조회 (ACCEPTED 상태만)
- `POST /api/friends/request` - 친구 요청 보내기
- `PUT /api/friends/:id/accept` - 친구 요청 수락
- `PUT /api/friends/:id/reject` - 친구 요청 거절
- `DELETE /api/friends/:id` - 친구 삭제
- `GET /api/friends/pending` - 받은 친구 요청 목록
- **추가 필요**: `GET /api/users/search?email={email}` - 이메일로 사용자 검색

#### 셔틀
- `GET /api/shuttle/routes` - 모든 노선 조회
- `GET /api/shuttle/routes/:id/stops` - 특정 노선의 경유지 조회
- `POST /api/shuttle/arrival-time` - 도착 시간 예측
- `GET /api/shuttle/routes/search?q={query}` - 노선 검색

### Request/Response 예시

#### 로그인
```typescript
// Request
POST /api/auth/login
{
  "email": "user@ssafy.com",
  "password": "password123"
}

// Response
{
  "user": {
    "id": 1,
    "email": "user@ssafy.com",
    "name": "홍길동",
    "locationShareAgree": true
  },
  "token": "jwt-token-here"
}
```

#### 도착 시간 예측
```typescript
// Request
POST /api/shuttle/arrival-time
{
  "friendId": 2,
  "myLocation": {
    "lat": 36.1076,
    "lng": 128.4178
  },
  "selectedStopIds": [3, 4, 5]  // 남은 경유지 ID 배열
}

// Response
{
  "routeName": "1호차",
  "estimatedMinutes": 15,
  "estimatedArrivalTime": "2025-10-21T15:30:00Z",
  "routePath": [
    { "lat": 36.1086, "lng": 128.4188 },
    { "lat": 36.1096, "lng": 128.4198 },
    ...
  ]
}
```

---

## 📋 다음 세션에서 해야 할 일

### 1. 카카오 API 키 발급
- 카카오 개발자 센터에서 JavaScript 키 발급
- `.env.local`에 실제 키 설정

### 2. 백엔드 API 명세 확인
- 백엔드 개발자와 엔드포인트 확정
- Request/Response 타입 검증

### 3. Mock 데이터 제거
- 모든 `TODO` 주석 찾아서 실제 API 호출로 교체

### 4. 테스트
- 각 페이지별 기능 테스트
- 모바일 반응형 확인
- 위치 권한 테스트

---

## 🎓 배운 내용

### 설계 패턴
- **경유지 선택 UX**: 수동 다중 클릭 → 드롭다운 시작점 선택
- **타이머 관리**: 클라이언트 UI + 서버 DB 이중 관리
- **새로고침 전략**: 실시간 업데이트 대신 on-demand

### Next.js 패턴
- App Router의 (auth) 그룹 라우팅
- Server Component vs Client Component 분리
- Script 컴포넌트로 외부 스크립트 로드

### Zustand 활용
- persist 미들웨어로 로그인 세션 유지
- 여러 스토어로 관심사 분리

---

## 📞 컨텍스트 복원 방법

### 다른 컴퓨터에서 작업 시작할 때

1. **Git Clone**
   ```bash
   git clone <repository-url>
   cd shuttle-tracker-fe
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   # .env.local 파일 생성
   cp .env.local.example .env.local
   # 카카오 API 키 입력
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **이 문서 읽기**
   - `CLAUDE.md`: 요구사항 명세
   - `DEVELOPMENT.md`: 개발 히스토리 (현재 문서)
   - `README.md`: 프로젝트 개요

6. **Claude에게 컨텍스트 제공**
   ```
   "DEVELOPMENT.md 파일을 읽고 이전 작업 내용을 파악해줘.
   현재 Phase 9까지 완료된 상태이고, 다음으로 [작업 내용]을 진행하려고 해."
   ```

---

**마지막 업데이트**: 2025-10-23
**작업자**: Claude + 프론트엔드 개발자
**다음 단계**: 백엔드 API 연동 및 실제 데이터 테스트

## 🎨 커스텀 마커 이미지
`public/markers/` 디렉토리에 SVG 마커 파일 저장:
- `marker-my-location.svg` - 내 위치 (노란 별)
- `marker-friend-red.svg` - 선택된 친구 (빨간 핀)
- `marker-friend-blue.svg` - 미선택 친구 (파란 핀)
- `marker-stop-green.svg` - 선택된 경유지 (초록 원)
- `marker-stop-blue.svg` - 미선택 경유지 (파란 원)
