# 🎓 프론트엔드 코드 이해 가이드

> **대상**: 백엔드 개발자, React 기본 지식 보유
> **목적**: Next.js 프로젝트 코드를 빠르게 이해하고 수정할 수 있도록 안내

---

## 📚 목차

1. [코드 읽는 순서](#1-코드-읽는-순서)
2. [핵심 개념 빠른 설명](#2-핵심-개념-빠른-설명)
3. [디렉토리 구조 상세](#3-디렉토리-구조-상세)
4. [주요 파일별 역할](#4-주요-파일별-역할)
5. [데이터 흐름 이해하기](#5-데이터-흐름-이해하기)
6. [자주 수정할 파일들](#6-자주-수정할-파일들)

---

## 1. 코드 읽는 순서

### 🎯 추천 순서 (30분 안에 전체 파악)

```
1단계: 타입 정의 이해 (5분)
  └─ src/types/index.ts

2단계: API 통신 구조 (10분)
  ├─ src/lib/api/client.ts        (Axios 설정)
  └─ src/lib/api/auth.ts          (API 함수 예시)

3단계: 상태 관리 (5분)
  ├─ src/stores/authStore.ts      (로그인 상태)
  └─ src/stores/locationStore.ts  (위치 공유 상태)

4단계: 페이지 하나 완전히 이해 (10분)
  └─ src/app/(auth)/login/page.tsx (로그인 페이지)
     ↓
     컴포넌트 사용 확인
     ├─ src/components/common/Button.tsx
     ├─ src/components/common/Input.tsx
     └─ src/components/common/Toast.tsx
```

### 📖 상세 읽기 순서

#### ✅ **1단계: 타입 시스템 이해**

**파일**: `src/types/index.ts`

**읽는 방법**:
```typescript
// User 타입 = 백엔드 User 테이블과 매핑
export interface User {
  email: string;
  name: string;
  locationShareAgree: boolean;
}

// AuthResponse = 로그인 API 응답
export interface AuthResponse {
  accessToken: string;
  email: string;
  name: string;
  locationShareAgree: boolean;
}
```

**이해할 점**:
- 각 interface는 백엔드 API 응답이나 DB 테이블과 1:1 매핑
- TypeScript 덕분에 오타/타입 에러를 컴파일 타임에 잡을 수 있음

---

#### ✅ **2단계: API 통신 구조**

**파일 1**: `src/lib/api/client.ts`

```typescript
// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:8081',  // 백엔드 주소
});

// Request Interceptor: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 401 에러 시 자동 로그아웃
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // 로그아웃 처리
    }
  }
);
```

**이해할 점**:
- **Interceptor** = Spring의 `@ControllerAdvice` 같은 개념
- Request 전/후에 공통 로직 실행 (토큰 추가, 에러 처리)

**파일 2**: `src/lib/api/auth.ts`

```typescript
// 로그인 API 함수
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/v1/auth/login', data);
  return response.data.data;  // { success, data, error } 중 data 추출
};
```

**이해할 점**:
- 각 API 함수는 단순히 `apiClient`를 호출
- 백엔드 응답 형식 `{ success, data, error }`에서 `data` 추출

---

#### ✅ **3단계: 상태 관리 (Zustand)**

**파일**: `src/stores/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // 액션 (메서드)
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      user: null,
      token: null,
      isAuthenticated: false,

      // 로그인
      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
      }),

      // 로그아웃
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
    }),
    { name: 'auth-storage' }  // localStorage 키 이름
  )
);
```

**이해할 점**:
- **Zustand** = Redux보다 간단한 전역 상태 관리 라이브러리
- `persist` = localStorage에 자동 저장 (새로고침해도 로그인 유지)
- `set()` = 상태 업데이트 함수 (React의 `setState`와 유사)

**사용 예시**:
```typescript
function LoginPage() {
  const { setAuth, isAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    const response = await login(formData);
    setAuth(response.user, response.accessToken);  // 상태 업데이트
  };
}
```

---

#### ✅ **4단계: 페이지 구조 이해**

**파일**: `src/app/(auth)/login/page.tsx`

```typescript
'use client';  // ✅ 클라이언트 컴포넌트 선언 (필수!)

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // 1. Hooks (상태, 라우터, 스토어)
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  // 2. 이벤트 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await login(formData);
    setAuth(response.user, response.accessToken);
    router.push('/');  // 홈으로 이동
  };

  // 3. JSX 렌더링
  return (
    <form onSubmit={handleSubmit}>
      <Input value={formData.email} onChange={...} />
      <Button type="submit">로그인</Button>
    </form>
  );
}
```

**이해할 점**:
- `'use client'` = 이 파일은 브라우저에서 실행 (상호작용 가능)
- `useState` = 로컬 상태 관리 (form 입력값 등)
- `useAuthStore` = 전역 상태 사용 (Zustand)
- `router.push()` = 페이지 이동

---

## 2. 핵심 개념 빠른 설명

### 🔄 Next.js App Router vs Pages Router

| 구분 | Pages Router (구버전) | App Router (신버전, 사용중) |
|------|---------------------|------------------------|
| 폴더 구조 | `pages/login.tsx` | `app/login/page.tsx` |
| 라우팅 | 파일명 = URL | 폴더명 = URL |
| 서버 컴포넌트 | ❌ 없음 | ✅ 기본값 |
| 레이아웃 | `_app.tsx` | `layout.tsx` |

**예시**:
```
app/
├── page.tsx              → / (홈)
├── login/
│   └── page.tsx          → /login
├── friends/
│   └── page.tsx          → /friends
└── (auth)/               → 그룹 폴더 (URL에 안나타남)
    ├── login/page.tsx    → /login
    └── signup/page.tsx   → /signup
```

---

### 🎨 Server Component vs Client Component

| | Server Component | Client Component |
|---|-----------------|------------------|
| **선언** | (기본값) | `'use client'` 추가 |
| **실행 위치** | 서버 (빌드 시) | 브라우저 |
| **사용 가능** | DB 조회, 파일 읽기 | useState, onClick 등 |
| **예시** | 정적 페이지, SEO | 로그인 폼, 지도 |

**사용 예시**:
```typescript
// ✅ Server Component (기본)
export default function StaticPage() {
  return <div>정적 페이지</div>;
}

// ✅ Client Component (상호작용 필요)
'use client';

export default function LoginPage() {
  const [email, setEmail] = useState('');  // ← useState는 클라이언트만!
  return <input value={email} onChange={...} />;
}
```

---

### 📦 Zustand vs Redux

| 비교 | Redux | Zustand (사용중) |
|------|-------|-----------------|
| **보일러플레이트** | 많음 (action, reducer, dispatch) | 적음 (set 하나로 해결) |
| **파일 수** | 많음 (3개 이상) | 적음 (1개) |
| **학습 곡선** | 높음 | 낮음 |

**Zustand 예시**:
```typescript
// 상태 정의 + 액션 모두 한 파일에!
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 사용
function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

---

## 3. 디렉토리 구조 상세

```
shuttle-tracker-fe/
├── public/                      # 정적 파일 (이미지, 아이콘)
│   └── markers/                 # 커스텀 마커 SVG 파일
│
├── src/
│   ├── app/                     # 📁 페이지 (App Router)
│   │   ├── layout.tsx           # 전역 레이아웃 (Navbar 포함)
│   │   ├── page.tsx             # 홈 페이지 (/)
│   │   │
│   │   ├── (auth)/              # 그룹 라우팅 (URL에 영향 없음)
│   │   │   ├── login/page.tsx   # /login
│   │   │   └── signup/page.tsx  # /signup
│   │   │
│   │   ├── friends/page.tsx     # /friends
│   │   ├── mypage/page.tsx      # /mypage
│   │   └── map/page.tsx         # /map
│   │
│   ├── components/              # 📦 재사용 컴포넌트
│   │   ├── common/              # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx       # 버튼
│   │   │   ├── Input.tsx        # 입력 필드
│   │   │   ├── Toast.tsx        # 알림 메시지
│   │   │   └── Modal.tsx        # 모달창
│   │   │
│   │   ├── layout/              # 레이아웃 컴포넌트
│   │   │   └── Navbar.tsx       # 상단 네비게이션
│   │   │
│   │   └── map/                 # 지도 관련 컴포넌트
│   │
│   ├── stores/                  # 🗃️ Zustand 상태 관리
│   │   ├── authStore.ts         # 로그인 상태 (persist)
│   │   ├── locationStore.ts     # 위치 공유 상태
│   │   └── mapStore.ts          # 지도 상태
│   │
│   ├── lib/                     # 📚 라이브러리/유틸리티
│   │   ├── api/                 # API 통신
│   │   │   ├── client.ts        # Axios 인스턴스 + Interceptor
│   │   │   ├── auth.ts          # 인증 API
│   │   │   ├── location.ts      # 위치 공유 API
│   │   │   ├── friend.ts        # 친구 API
│   │   │   └── shuttle.ts       # 셔틀 API
│   │   │
│   │   └── utils/               # 유틸 함수
│   │       └── geolocation.ts   # 위치 추적 헬퍼
│   │
│   ├── hooks/                   # 🪝 커스텀 훅
│   │   └── useGeolocation.ts    # 위치 추적 훅
│   │
│   └── types/                   # 📝 TypeScript 타입
│       └── index.ts             # 모든 타입 정의
│
├── .env.local                   # 환경 변수 (API 키 등)
├── next.config.ts               # Next.js 설정
├── tailwind.config.ts           # Tailwind CSS 설정
└── package.json                 # 의존성 목록
```

---

## 4. 주요 파일별 역할

### 📄 **src/types/index.ts**

**역할**: 모든 TypeScript 타입 정의

**내용**:
- User, Friend, LocationShare, ShuttleRoute 등
- API Request/Response 타입
- 백엔드 API 명세와 1:1 매핑

**언제 수정하나**:
- 백엔드 API 응답 형식 변경 시
- 새로운 API 추가 시

---

### 📄 **src/lib/api/client.ts**

**역할**: Axios 인스턴스 및 Interceptor 설정

**주요 기능**:
1. **Request Interceptor**: 모든 요청에 JWT 토큰 자동 추가
2. **Response Interceptor**: 401 에러 시 자동 로그아웃
3. **Public Endpoint** 제외 처리 (로그인/회원가입)

**언제 수정하나**:
- 백엔드 URL 변경 시
- 에러 처리 로직 추가 시
- 공통 헤더 추가 시

---

### 📄 **src/lib/api/*.ts**

**역할**: 각 도메인별 API 함수

**구조**:
```typescript
// auth.ts
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/v1/auth/login', data);
  return response.data.data;
};

export const signup = async (data: SignupRequest): Promise<void> => {
  await apiClient.post('/api/v1/auth/register', data);
};
```

**언제 수정하나**:
- 새로운 API 추가 시
- API 엔드포인트 변경 시

---

### 📄 **src/stores/authStore.ts**

**역할**: 로그인 상태 전역 관리

**상태**:
- `user`: User | null
- `token`: string | null
- `isAuthenticated`: boolean

**액션**:
- `setAuth(user, token)`: 로그인
- `logout()`: 로그아웃
- `updateUser(data)`: 사용자 정보 업데이트

**persist**: localStorage에 자동 저장

---

### 📄 **src/stores/locationStore.ts**

**역할**: 위치 공유 상태 관리

**상태**:
- `isSharing`: 현재 위치 공유 중인지
- `remainingTime`: 남은 시간 (초)
- `myLocation`: 내 현재 위치

**액션**:
- `startLocationSharing()`: 위치 공유 시작
- `stopLocationSharing()`: 위치 공유 중지

---

### 📄 **src/app/layout.tsx**

**역할**: 전역 레이아웃 (모든 페이지에 적용)

**내용**:
- `<Navbar />` 포함
- `<html>`, `<body>` 태그
- 폰트, 메타 태그 설정

**특징**: Server Component

---

### 📄 **src/app/page.tsx**

**역할**: 홈 페이지 (/)

**주요 기능**:
1. 위치 공유 Toggle
2. 셔틀 맵 이동 버튼
3. 사용 방법 안내

**특징**: Client Component (`'use client'`)

---

### 📄 **src/components/common/Button.tsx**

**역할**: 재사용 가능한 버튼 컴포넌트

**Props**:
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'light' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}
```

**사용 예시**:
```typescript
<Button variant="primary" fullWidth isLoading={loading}>
  로그인
</Button>
```

---

## 5. 데이터 흐름 이해하기

### 🔄 로그인 플로우

```
1. 사용자가 이메일/비밀번호 입력
   ↓
2. LoginPage에서 handleSubmit() 실행
   ↓
3. lib/api/auth.ts의 login() 함수 호출
   ↓
4. client.ts의 Interceptor가 요청 가로채기 (로그인은 Public이라 토큰 안 붙음)
   ↓
5. 백엔드로 POST /api/v1/auth/login 요청
   ↓
6. 백엔드 응답: { success: true, data: { accessToken, email, name, locationShareAgree } }
   ↓
7. login() 함수가 response.data.data 추출하여 반환
   ↓
8. LoginPage에서 setAuth(user, token) 호출
   ↓
9. authStore의 persist가 localStorage에 저장
   ↓
10. router.push('/') 로 홈으로 이동
```

---

### 🔄 API 호출 플로우 (인증 필요)

```
1. 페이지에서 getFriends() 호출
   ↓
2. client.ts의 Request Interceptor 실행
   ├─ localStorage에서 'auth-storage' 읽기
   ├─ JSON.parse()로 token 추출
   └─ headers.Authorization = `Bearer ${token}` 추가
   ↓
3. 백엔드로 GET /api/v1/friends 요청 (토큰 포함)
   ↓
4. 백엔드 응답
   ↓
5. client.ts의 Response Interceptor 실행
   ├─ 200 OK → 그대로 반환
   └─ 401 Unauthorized → logout() 실행 + /login으로 리다이렉트
   ↓
6. getFriends()가 response.data.data 반환
   ↓
7. 페이지에서 친구 목록 렌더링
```

---

### 🔄 위치 공유 플로우

```
1. 사용자가 홈 페이지에서 위치 공유 Toggle ON
   ↓
2. handleStartSharing() 실행
   ├─ locationShareAgree 체크
   ├─ getCurrentPosition()으로 현재 위치 가져오기
   └─ apiStartLocationSharing(lat, lng) 호출
   ↓
3. 백엔드에 POST /api/v1/location/start
   ↓
4. 백엔드 응답: LocationShare 객체
   ↓
5. locationStore.startLocationSharing() 호출
   ↓
6. useGeolocation.startTracking() 실행
   ├─ watchPosition() 시작 (30초마다 위치 업데이트)
   └─ 매번 updateMyLocation(lat, lng) API 호출
   ↓
7. 1시간 타이머 시작 (setInterval)
   ↓
8. 1시간 후 자동으로 handleStopSharing() 실행
```

---

## 6. 자주 수정할 파일들

### ✏️ **새로운 페이지 추가**

1. `src/app/새페이지/page.tsx` 생성
2. 필요시 `layout.tsx`도 생성 (해당 페이지만의 레이아웃)

**예시**:
```typescript
'use client';

export default function NewPage() {
  return <div>새로운 페이지</div>;
}
```

---

### ✏️ **새로운 API 추가**

1. **타입 정의**: `src/types/index.ts`
   ```typescript
   export interface NewRequest {
     field1: string;
     field2: number;
   }

   export interface NewResponse {
     data: string;
   }
   ```

2. **API 함수**: `src/lib/api/새도메인.ts`
   ```typescript
   export const newApi = async (data: NewRequest): Promise<NewResponse> => {
     const response = await apiClient.post('/api/v1/new', data);
     return response.data.data;
   };
   ```

3. **페이지에서 사용**:
   ```typescript
   const handleSubmit = async () => {
     const result = await newApi({ field1: 'value', field2: 123 });
     console.log(result);
   };
   ```

---

### ✏️ **새로운 상태 추가 (Zustand)**

**파일**: `src/stores/newStore.ts`

```typescript
import { create } from 'zustand';

interface NewState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useNewStore = create<NewState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

**사용**:
```typescript
function Component() {
  const { count, increment } = useNewStore();
  return <button onClick={increment}>{count}</button>;
}
```

---

### ✏️ **환경 변수 수정**

**파일**: `.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-api-key
```

**사용**:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
```

**주의**: `NEXT_PUBLIC_` prefix 필수 (브라우저에서 접근 가능하게)

---

## 7. 자주 하는 실수와 해결법

### ❌ **"useState is not defined"**

**원인**: Server Component에서 useState 사용

**해결**:
```typescript
// ❌ 잘못된 코드
export default function Page() {
  const [state, setState] = useState(0);  // 에러!
}

// ✅ 올바른 코드
'use client';  // 추가!

export default function Page() {
  const [state, setState] = useState(0);
}
```

---

### ❌ **"localStorage is not defined"**

**원인**: Server Component에서 localStorage 접근

**해결**:
```typescript
// ❌ 잘못된 코드
const token = localStorage.getItem('token');

// ✅ 올바른 코드
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
}
```

---

### ❌ **API 호출 시 401 에러**

**원인**: 토큰이 없거나 만료됨

**확인**:
1. F12 → Application → Local Storage → `auth-storage` 확인
2. Network 탭에서 Authorization 헤더 확인

**해결**:
- 로그아웃 후 다시 로그인
- localStorage.clear() 실행

---

### ❌ **CORS 에러**

**원인**: 백엔드에서 CORS 설정 안 됨

**백엔드 해결** (Spring Boot):
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("*");
    }
}
```

---

## 8. 디버깅 팁

### 🐛 **React DevTools**

1. Chrome 확장 프로그램 설치
2. F12 → Components 탭
3. 컴포넌트 상태, Props 실시간 확인

---

### 🐛 **Zustand DevTools**

```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(devtools((set) => ({
  // ...
})));
```

---

### 🐛 **Network 탭 활용**

1. F12 → Network
2. API 요청 클릭
3. Headers, Payload, Response 확인

---

### 🐛 **Console.log 디버깅**

```typescript
const handleClick = async () => {
  console.log('1. 클릭됨');
  const result = await api();
  console.log('2. API 응답:', result);
};
```

---

## 9. 다음 단계

### 📚 **더 공부하면 좋은 것들**

1. **Next.js 공식 문서**: https://nextjs.org/docs
2. **React 공식 문서**: https://react.dev
3. **Tailwind CSS**: https://tailwindcss.com/docs
4. **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook

---

## 10. 요약 치트시트

```typescript
// 📦 상태 관리
const { user, setAuth } = useAuthStore();

// 🌐 API 호출
const result = await login({ email, password });

// 🎯 페이지 이동
router.push('/login');

// 📝 로컬 상태
const [state, setState] = useState(initialValue);

// 🔄 Side Effect
useEffect(() => {
  // 컴포넌트 마운트 시 실행
}, []);

// 💾 localStorage
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');

// 🎨 조건부 렌더링
{isAuthenticated && <Navbar />}
{loading ? <Spinner /> : <Content />}

// 🔁 리스트 렌더링
{friends.map((friend) => (
  <FriendCard key={friend.id} friend={friend} />
))}
```

---

**마지막 업데이트**: 2025-11-11
**작성자**: Claude (프론트엔드 가이드)
