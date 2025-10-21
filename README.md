# SSAFY 셔틀 버스 위치 추적 서비스 (Frontend)

SSAFY 교육생들을 위한 셔틀 버스 실시간 위치 추적 및 도착 시간 예측 서비스

## 🚀 기술 스택

- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Maps**: Kakao Maps SDK (react-kakao-maps-sdk)

## 📁 프로젝트 구조

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 페이지 그룹
│   │   ├── login/           # 로그인 페이지
│   │   └── signup/          # 회원가입 페이지
│   ├── map/                 # 셔틀 맵 페이지
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 홈 페이지
├── components/              # 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   ├── layout/             # 레이아웃 컴포넌트
│   └── map/                # 맵 관련 컴포넌트
├── stores/                  # Zustand 스토어
│   ├── authStore.ts        # 인증 상태
│   ├── locationStore.ts    # 위치 공유
│   └── mapStore.ts         # 맵 상태
├── types/                   # TypeScript 타입
├── lib/api/                # API 클라이언트
└── hooks/                   # 커스텀 훅
```

## 🎯 주요 기능

### 1. 인증 시스템
- ✅ 로그인 / 회원가입
- ✅ JWT 토큰 기반 인증
- ✅ LocalStorage 기반 세션 유지

### 2. 위치 공유
- ✅ Geolocation API 실시간 위치 추적
- ✅ 1시간 자동 만료 타이머
- ✅ 위치 공유 ON/OFF 토글

### 3. 셔틀 맵
- ✅ 카카오맵 기반 지도
- ✅ 친구 위치 마커
- ✅ 셔틀 노선 및 경유지
- ✅ 친구/노선 검색
- ✅ 경유지 선택 UI
- ✅ 도착 시간 예측

### 4. 친구 관리
- ✅ 친구 목록 조회
- ✅ 친구 추가 요청 (이메일 검색)
- ✅ 받은 친구 요청 수락/거절
- ✅ 친구 삭제
- ✅ 위치 공유 상태 표시

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일 생성:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_map_app_key_here
NEXT_PUBLIC_KAKAO_MOBILITY_API_KEY=your_kakao_mobility_rest_api_key_here
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## 📡 백엔드 API 엔드포인트

현재 **Mock 데이터**로 작동. 백엔드 연동 시 사용할 엔드포인트:

### 인증
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/auth/me`

### 위치 공유
- `POST /api/location/start`
- `POST /api/location/stop`
- `PUT /api/location/update`

### 친구
- `GET /api/friends`
- `POST /api/friends/request`

### 셔틀
- `GET /api/shuttle/routes`
- `GET /api/shuttle/routes/:id/stops`
- `POST /api/shuttle/arrival-time`

## 🔧 백엔드 연동 방법

각 API 함수에서 Mock 데이터 부분을 주석 처리하고 실제 API 호출:

```typescript
// Mock 데이터 (삭제)
// await new Promise((resolve) => setTimeout(resolve, 1000));

// 실제 API (주석 해제)
const response = await apiClient.post('/auth/login', data);
return response.data;
```

## 📝 개발 노트

### 경유지 선택 UX
1. 친구 마커 클릭
2. 시작 경유지 선택 (드롭다운)
3. 해당 경유지부터 종점까지 자동 선택
4. 도착 시간 계산

### 위치 공유 1시간 제한
- 클라이언트: 1시간 타이머 UI
- 서버: `Location_share` 테이블의 `start_time`, `end_time`으로 관리

## 🚧 추가 개발 예정

- [ ] 프로필/설정 페이지 (비밀번호 변경, 위치 공유 동의 설정)
- [ ] WebSocket 실시간 위치 업데이트 (선택사항)
- [ ] PWA 지원
- [ ] 푸시 알림

## 📄 라이선스

SSAFY 교육 프로젝트
