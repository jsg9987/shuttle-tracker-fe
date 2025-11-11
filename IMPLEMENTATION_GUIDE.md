# 🚀 셔틀 트래커 프론트엔드 백엔드 API 연동 가이드

> **작성일**: 2025-11-11
> **작성자**: Claude (10년차 Web Front Engineer)
> **프로젝트**: SSAFY 셔틀 버스 위치 추적 서비스

---

## 📋 목차

1. [작업 개요](#작업-개요)
2. [Sequential Thinking을 통한 계획 수립](#sequential-thinking을-통한-계획-수립)
3. [Phase 1: API 클라이언트 수정 완료](#phase-1-api-클라이언트-수정-완료)
4. [주요 변경 사항](#주요-변경-사항)
5. [다음 단계 (Phase 2-5)](#다음-단계-phase-2-5)
6. [알려진 이슈 및 제한사항](#알려진-이슈-및-제한사항)
7. [테스트 방법](#테스트-방법)

---

## 작업 개요

### 목표
백엔드 API 문서(23개 엔드포인트)를 기반으로 프론트엔드 API 클라이언트를 수정하고, 실제 백엔드와 연동 가능하도록 구현합니다.

### 프로젝트 현황
- **프론트엔드**: Next.js 15, TypeScript, Zustand (Phase 10까지 완료)
- **백엔드**: Spring Boot 3.5.7, MySQL, Redis
- **문제점**: API 엔드포인트 불일치, 응답 형식 차이, Mock 데이터 사용 중

---

## Sequential Thinking을 통한 계획 수립

### 분석 과정 (12단계)

1. **문제 분석**: API 엔드포인트 경로 불일치 발견
   - 프론트엔드: `/auth/login`
   - 백엔드: `/api/v1/auth/login`

2. **백엔드 API 구조 분석**
   - Base URL: `http://localhost:8081`
   - 응답 형식: `{ success, data, error }`
   - 5개 도메인, 23개 API

3. **우선순위 작업 목록 도출**
   - Level 1: API 클라이언트 기반 수정
   - Level 2: API별 수정 (auth, location, friend, shuttle)
   - Level 3: 페이지별 연동

4-8. **상세 구현 계획 수립**
   - 각 API 파일별 변경사항 정리
   - HTTP 메서드 변경 (PUT → POST/PATCH)
   - 응답 데이터 처리 전략 (response.data.data 추출)

9-12. **테스트 전략 및 리스크 관리**
   - 개발 순서 정의
   - 알려진 이슈 파악 (친구-노선 매핑, 도착 시간 API 미구현)

---

## Phase 1: API 클라이언트 수정 완료 ✅

### 1.1. client.ts 수정

**파일**: `shuttle-tracker-fe/src/lib/api/client.ts`

#### 변경 사항:
1. **Base URL 수정**
   ```typescript
   // 변경 전
   baseURL: 'http://localhost:8080/api'

   // 변경 후
   baseURL: 'http://localhost:8081'
   ```

2. **백엔드 응답 형식 처리**
   ```typescript
   interface BackendResponse<T> {
     success: boolean;
     data: T | null;
     error: {
       code: string;
       message: string;
       httpStatus: number;
     } | null;
   }
   ```

3. **Response Interceptor 개선**
   - 백엔드 에러 형식 (`error.message`, `error.code`) 정확히 추출
   - 401 에러 시 자동 로그아웃 유지

---

### 1.2. auth.ts 수정

**파일**: `shuttle-tracker-fe/src/lib/api/auth.ts`

#### 주요 변경 사항:

| 기능 | 변경 전 | 변경 후 |
|------|---------|---------|
| 로그인 | `POST /auth/login` | `POST /api/v1/auth/login` |
| 회원가입 | `POST /auth/signup` | `POST /api/v1/auth/register` |
| 내 정보 조회 | `GET /auth/me` | `GET /api/v1/users/me` |
| 비밀번호 변경 | `PUT /auth/password` | `POST /api/v1/users/me/password` |
| 위치 동의 변경 | `PUT /auth/location-share-agree` | `PATCH /api/v1/users/me/location-agree` |

#### 코드 예시:
```typescript
// 로그인 - response.data.data 추출
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<BackendResponse<AuthResponse>>('/api/v1/auth/login', data);
  return response.data.data!;  // ✅ 백엔드 응답 형식에 맞춤
};
```

---

### 1.3. location.ts 수정

**파일**: `shuttle-tracker-fe/src/lib/api/location.ts`

#### 주요 변경 사항:

| 기능 | 변경 전 | 변경 후 |
|------|---------|---------|
| 위치 공유 시작 | `POST /location/start` | `POST /api/v1/location/start` |
| 위치 공유 중지 | `POST /location/stop` | `POST /api/v1/location/stop` |
| 위치 업데이트 | `PUT /location/update` | `POST /api/v1/location/update` |
| 내 위치 조회 | `GET /location/me` | `GET /api/v1/location/me` |
| 친구 위치 조회 | `GET /location/friend/:id` | `GET /api/v1/location/friends` (전체 조회) |

#### 주요 개선:
1. **함수 시그니처 변경**
   ```typescript
   // 변경 전
   startLocationSharing(location: Location)

   // 변경 후
   startLocationSharing(latitude: number, longitude: number)
   ```

2. **친구 위치 조회 변경**
   - 단일 친구 조회 → 전체 친구 위치 조회
   - `FriendLocation` 타입 추가

---

### 1.4. friend.ts 수정

**파일**: `shuttle-tracker-fe/src/lib/api/friend.ts`

#### 주요 변경 사항:

| 기능 | 변경 전 | 변경 후 |
|------|---------|---------|
| 친구 요청 보내기 | `POST /friends/request` | `POST /api/v1/friends/request` |
| 받은 요청 조회 | `GET /friends/pending` | `GET /api/v1/friends/requests/received` |
| **보낸 요청 조회** | ❌ 없음 | `GET /api/v1/friends/requests/sent` (신규) |
| 요청 수락 | `PUT /friends/:id/accept` | `POST /api/v1/friends/accept/:friendshipId` |
| 요청 거절 | `PUT /friends/:id/reject` | `POST /api/v1/friends/reject/:friendshipId` |
| 친구 목록 조회 | `GET /friends` | `GET /api/v1/friends` |
| 친구 삭제 | `DELETE /friends/:id` | `DELETE /api/v1/friends/:friendId` |

#### 주요 개선:
1. **친구 요청 파라미터 변경**
   ```typescript
   // 변경 전
   sendFriendRequest(toUserId: number)

   // 변경 후
   sendFriendRequest(toUserEmail: string)  // ✅ 이메일로 변경
   ```

2. **타입 정의 추가**
   ```typescript
   export interface Friend {
     friendId: number;
     friendEmail: string;
     friendName: string;
   }

   export interface FriendRequest {
     friendshipId: number;
     friendId: number;
     friendEmail: string;
     friendName: string;
     status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
     createdAt: string;
   }
   ```

---

### 1.5. shuttle.ts 수정

**파일**: `shuttle-tracker-fe/src/lib/api/shuttle.ts`

#### 주요 변경 사항:

| 기능 | 변경 전 | 변경 후 |
|------|---------|---------|
| 노선 목록 조회 | `GET /shuttle/routes` | `GET /api/v1/shuttle/routes` |
| **노선 상세 조회** | ❌ 없음 | `GET /api/v1/shuttle/routes/:routeId` (신규) |
| 경유지 조회 | `GET /shuttle/routes/:id/stops` | `GET /api/v1/shuttle/routes/:routeId/stops` |
| **남은 경유지 조회** | ❌ 없음 | `GET /api/v1/shuttle/routes/:routeId/stops/remaining` (신규) |
| 노선 검색 | `GET /shuttle/routes/search?q=` | `GET /api/v1/shuttle/routes/search?keyword=` |
| **경유지 검색** | ❌ 없음 | `GET /api/v1/shuttle/stops/search?keyword=` (신규) |

#### 새로 추가된 API:
```typescript
// 1. 노선 상세 조회 (경유지 포함)
export const getRouteDetail = async (routeId: number): Promise<ShuttleRouteDetail> => {
  const response = await apiClient.get<BackendResponse<ShuttleRouteDetail>>(`/api/v1/shuttle/routes/${routeId}`);
  return response.data.data!;
};

// 2. 남은 경유지 조회
export const getRemainingStops = async (routeId: number, fromSequence: number): Promise<ShuttleStop[]> => {
  const response = await apiClient.get<BackendResponse<ShuttleStop[]>>(
    `/api/v1/shuttle/routes/${routeId}/stops/remaining`,
    { params: { fromSequence } }
  );
  return response.data.data || [];
};
```

---

## 주요 변경 사항

### 1. API 엔드포인트 통일

모든 API에 `/api/v1` prefix 추가:
```typescript
// ❌ 변경 전
'/auth/login'
'/location/start'
'/friends'

// ✅ 변경 후
'/api/v1/auth/login'
'/api/v1/location/start'
'/api/v1/friends'
```

### 2. HTTP 메서드 변경

| API | 변경 전 | 변경 후 |
|-----|---------|---------|
| 위치 업데이트 | `PUT` | `POST` |
| 비밀번호 변경 | `PUT` | `POST` |
| 위치 동의 변경 | `PUT` | `PATCH` |
| 친구 요청 수락/거절 | `PUT` | `POST` |

### 3. 백엔드 응답 형식 처리

**백엔드 응답 구조:**
```json
{
  "success": true,
  "data": { /* 실제 데이터 */ },
  "error": null
}
```

**프론트엔드 처리:**
```typescript
// ✅ response.data.data로 실제 데이터 추출
const response = await apiClient.get('/api/v1/users/me');
return response.data.data;  // { id, email, name, ... }
```

### 4. 함수 시그니처 개선

```typescript
// 1. 위치 공유 - 객체 → 개별 파라미터
startLocationSharing(latitude: number, longitude: number)

// 2. 친구 요청 - ID → 이메일
sendFriendRequest(toUserEmail: string)

// 3. 친구 목록 - 단일 조회 → 전체 조회
getFriendsLocations(): Promise<FriendLocation[]>
```

---

## Phase 2: 인증 페이지 수정 완료 ✅

### 2.1. 로그인 페이지

**파일**: `shuttle-tracker-fe/src/app/(auth)/login/page.tsx`

#### 변경 사항:
1. **Mock 데이터 제거**
   - 기존의 하드코딩된 사용자 정보 제거
   - 실제 API 호출로 대체

2. **로그인 프로세스 개선**
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validate()) return;

     setIsLoading(true);
     try {
       // 1. 로그인 API 호출 - 토큰 받기
       const authResponse = await login(formData);
       const token = authResponse.accessToken;

       // 2. 사용자 상세 정보 조회
       const userInfo = await getMyInfo();

       // 3. Zustand 스토어에 저장
       setAuth(userInfo, token);

       showToast('로그인 성공!', 'success');
       setTimeout(() => router.push('/'), 1000);
     } catch (error: any) {
       const errorMessage = error?.message || '로그인에 실패했습니다.';
       showToast(errorMessage, 'error');
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **에러 처리**
   - 백엔드 에러 메시지를 Toast로 표시
   - `INVALID_CREDENTIALS`, `USER_NOT_FOUND` 등의 에러 코드 처리

### 2.2. 회원가입 페이지

**파일**: `shuttle-tracker-fe/src/app/(auth)/signup/page.tsx`

#### 변경 사항:
1. **Mock 데이터 제거**
   - 실제 `signup()` API 호출

2. **회원가입 프로세스**
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validate()) return;

     setIsSearching(true);
     try {
       await signup({
         email: formData.email,
         password: formData.password,
         name: formData.name,
       });

       showToast('회원가입 성공! 로그인 페이지로 이동합니다.', 'success');
       setTimeout(() => router.push('/login'), 1500);
     } catch (error: any) {
       const errorMessage = error?.message || '회원가입에 실패했습니다.';
       showToast(errorMessage, 'error');
     } finally {
       setIsSearching(false);
     }
   };
   ```

3. **에러 처리**
   - 중복 이메일 (`DUPLICATE_EMAIL`) 에러 처리
   - 유효성 검사 실패 메시지 표시

---

## Phase 3: 홈 페이지 수정 완료 ✅

### 3.1. useGeolocation Hook 수정

**파일**: `shuttle-tracker-fe/src/hooks/useGeolocation.ts`

#### 변경 사항:
1. **API import 수정**
   ```typescript
   import { updateMyLocation } from '@/lib/api/location';
   ```

2. **위치 업데이트 로직**
   ```typescript
   const id = watchPosition(
     async (location) => {
       setMyLocation(location);

       // 위치 공유 중이면 서버에 업데이트
       try {
         await updateMyLocation(location.lat, location.lng);
       } catch (error) {
         console.error('Failed to update location to server:', error);
       }
     },
     (error) => {
       console.error('Geolocation error:', getGeolocationErrorMessage(error));
     }
   );
   ```

### 3.2. 홈 페이지

**파일**: `shuttle-tracker-fe/src/app/page.tsx`

#### 변경 사항:
1. **페이지 로드 시 위치 공유 세션 복원**
   ```typescript
   useEffect(() => {
     if (!isAuthenticated) return;

     const restoreLocationShare = async () => {
       try {
         const locationShare = await getMyLocationShare();
         if (locationShare && locationShare.isActive) {
           // 위치 공유 중인 세션 복원
           startLocationSharing(locationShare);
           // 위치 추적 재시작
           await startTracking();
         }
       } catch (error) {
         console.log('No active location share session');
       }
     };

     restoreLocationShare();
   }, [isAuthenticated]);
   ```

2. **위치 공유 시작 로직**
   ```typescript
   const handleStartSharing = async () => {
     // 인증 체크
     if (!isAuthenticated) {
       const shouldRedirect = confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?');
       if (shouldRedirect) router.push('/login');
       return;
     }

     // 위치 동의 체크
     if (!user?.locationShareAgree) {
       showToast('설정에서 위치 공유 동의를 먼저 활성화해주세요.', 'error');
       return;
     }

     setIsLoading(true);
     try {
       // 1. 현재 위치 가져오기
       const currentLocation = await getCurrentPosition();

       // 2. 백엔드에 위치 공유 시작 요청
       const locationShare = await apiStartLocationSharing(
         currentLocation.lat,
         currentLocation.lng
       );

       // 3. Zustand 스토어에 저장
       startLocationSharing(locationShare);

       // 4. 위치 추적 시작
       await startTracking();

       showToast('위치 공유가 시작되었습니다. (1시간)', 'success');
     } catch (error: any) {
       const errorMessage = error?.message || '위치 공유를 시작할 수 없습니다.';
       showToast(errorMessage, 'error');
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **위치 공유 중지 로직**
   ```typescript
   const handleStopSharing = async () => {
     setIsLoading(true);
     try {
       await apiStopLocationSharing();
       stopTracking();
       stopLocationSharing();
       showToast('위치 공유가 중지되었습니다.', 'info');
     } catch (error: any) {
       const errorMessage = error?.message || '위치 공유를 중지할 수 없습니다.';
       showToast(errorMessage, 'error');
     } finally {
       setIsLoading(false);
     }
   };
   ```

---

## Phase 4: 친구 관리 페이지 수정 완료 ✅

**파일**: `shuttle-tracker-fe/src/app/friends/page.tsx`

### 변경 사항:

1. **Mock 데이터 완전 제거**
   - 하드코딩된 친구 목록 제거
   - 실제 API 호출로 대체

2. **데이터 로딩**
   ```typescript
   const loadFriendsData = async () => {
     setIsLoading(true);
     try {
       const [friendsData, requestsData] = await Promise.all([
         getFriends(),
         getReceivedFriendRequests(),
       ]);

       setFriends(friendsData);
       setPendingRequests(requestsData);
     } catch (error: any) {
       showToast('친구 목록을 불러오는데 실패했습니다.', 'error');
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **이메일 기반 친구 요청**
   ```typescript
   const handleAddFriend = async () => {
     if (!searchEmail.trim()) {
       showToast('이메일을 입력해주세요.', 'error');
       return;
     }

     // 이메일 형식 검증
     if (!/\S+@\S+\.\S+/.test(searchEmail)) {
       showToast('유효한 이메일 주소를 입력해주세요.', 'error');
       return;
     }

     setIsSearching(true);
     try {
       await sendFriendRequest(searchEmail);  // ✅ 이메일로 요청
       showToast('친구 요청을 보냈습니다!', 'success');
       setIsAddModalOpen(false);
       setSearchEmail('');
     } catch (error: any) {
       const errorMessage = error?.message || '친구 요청을 보낼 수 없습니다.';
       showToast(errorMessage, 'error');
     } finally {
       setIsSearching(false);
     }
   };
   ```

4. **친구 요청 수락/거절**
   ```typescript
   const handleAcceptRequest = async (friendshipId: number) => {
     try {
       await acceptFriendRequest(friendshipId);
       setPendingRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
       showToast('친구 요청을 수락했습니다.', 'success');
       loadFriendsData(); // 목록 갱신
     } catch (error: any) {
       showToast('친구 요청 수락에 실패했습니다.', 'error');
     }
   };

   const handleRejectRequest = async (friendshipId: number) => {
     try {
       await rejectFriendRequest(friendshipId);
       setPendingRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
       showToast('친구 요청을 거절했습니다.', 'info');
     } catch (error: any) {
       showToast('친구 요청 거절에 실패했습니다.', 'error');
     }
   };
   ```

5. **친구 삭제**
   ```typescript
   const handleDeleteFriend = async (friendId: number, friendName: string) => {
     const confirmed = confirm(`${friendName}님을 친구 목록에서 삭제하시겠습니까?`);
     if (!confirmed) return;

     try {
       await deleteFriend(friendId);
       setFriends((prev) => prev.filter((f) => f.friendId !== friendId));
       showToast('친구가 삭제되었습니다.', 'info');
     } catch (error: any) {
       showToast('친구 삭제에 실패했습니다.', 'error');
     }
   };
   ```

---

## Phase 5: 마이페이지 수정 완료 ✅

**파일**: `shuttle-tracker-fe/src/app/mypage/page.tsx`

### 변경 사항:

1. **페이지 로드 시 최신 사용자 정보 가져오기**
   ```typescript
   useEffect(() => {
     if (isAuthenticated) {
       loadUserInfo();
     }
   }, [isAuthenticated]);

   const loadUserInfo = async () => {
     try {
       const userInfo = await getMyInfo();
       updateUser(userInfo);
       setLocationShareAgree(userInfo.locationShareAgree);
     } catch (error) {
       console.error('Failed to load user info:', error);
     }
   };
   ```

2. **위치 공유 동의 토글**
   ```typescript
   const handleLocationShareToggle = async (enabled: boolean) => {
     setIsUpdatingLocation(true);
     try {
       await updateLocationShareAgree(enabled);
       setLocationShareAgree(enabled);
       updateUser({ locationShareAgree: enabled });
       showToast(
         enabled ? '위치 공유 동의가 활성화되었습니다.' : '위치 공유 동의가 비활성화되었습니다.',
         'success'
       );
     } catch (error: any) {
       const errorMessage = error?.message || '위치 공유 동의 설정을 변경할 수 없습니다.';
       showToast(errorMessage, 'error');
     } finally {
       setIsUpdatingLocation(false);
     }
   };
   ```

3. **비밀번호 변경**
   ```typescript
   const handlePasswordChange = async (e: React.FormEvent) => {
     e.preventDefault();

     if (!validatePassword()) return;

     setIsChangingPassword(true);
     try {
       await changePassword({
         currentPassword: passwordForm.currentPassword,
         newPassword: passwordForm.newPassword,
         newPasswordConfirm: passwordForm.confirmPassword,
       });

       showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
       setPasswordForm({
         currentPassword: '',
         newPassword: '',
         confirmPassword: '',
       });
       setPasswordErrors({});
     } catch (error: any) {
       const errorMessage = error?.message || '비밀번호 변경에 실패했습니다.';
       showToast(errorMessage, 'error');
     } finally {
       setIsChangingPassword(false);
     }
   };
   ```

4. **유효성 검사**
   - 현재 비밀번호 필수 체크
   - 새 비밀번호 최소 6자 이상 체크
   - 새 비밀번호 확인 일치 여부 체크

---

## 알려진 이슈 및 제한사항

### 1. 친구-노선 매핑 정보 없음 ⚠️

**문제**: 친구가 어떤 노선을 타고 있는지 정보가 없음

**현재 응답**:
```json
{
  "friendId": 2,
  "friendName": "김철수",
  "latitude": 35.135292,
  "longitude": 126.859202,
  "isActive": true
  // ❌ routeId, routeName 없음
}
```

**해결 방안**:
1. **(임시)** 프론트엔드에서 첫 번째 노선을 기본값으로 사용
2. **(권장)** 백엔드 API 수정 필요 - `location_share` 테이블에 `route_id` 추가

### 2. 도착 시간 예측 API 미구현 ⚠️

**문제**: 카카오 모빌리티 API를 사용한 도착 시간 예측 기능이 백엔드에 없음

**필요한 API**:
```http
POST /api/v1/shuttle/arrival-time
{
  "friendId": 2,
  "myLocation": { "latitude": 35.135292, "longitude": 126.859202 },
  "selectedStopSequence": 3
}
```

**해결 방안**:
- 백엔드 개발 필요
- 현재는 경유지 표시까지만 구현 (도착 시간은 TODO)

### 3. 사용자 이메일 검색 API 없음 ℹ️

**문제**: 친구 추가 시 이메일로 사용자 존재 여부 확인 불가

**해결 방안**:
- 백엔드에서 친구 요청 시 검증 (존재하지 않는 이메일은 에러 반환)
- 프론트엔드는 에러 메시지 표시

---

## 테스트 방법

### 1. 백엔드 서버 실행 확인

```bash
cd shuttle-tracker-be-backup
./gradlew bootRun
```

**확인사항**:
- 서버가 `http://localhost:8081`에서 실행 중
- MySQL (3307), Redis (6380) 실행 중
- 셔틀 노선 데이터 초기화 완료

### 2. 프론트엔드 개발 서버 실행

```bash
cd shuttle-tracker-fe
npm run dev
```

### 3. API 테스트 체크리스트

- [ ] 회원가입 성공
- [ ] 로그인 성공 및 토큰 저장
- [ ] 내 정보 조회
- [ ] 위치 공유 시작/중지
- [ ] 친구 요청/수락
- [ ] 친구 위치 조회
- [ ] 노선 및 경유지 조회

### 4. 에러 테스트

- [ ] 중복 이메일 회원가입 → `DUPLICATE_EMAIL` 에러
- [ ] 잘못된 비밀번호 로그인 → `INVALID_CREDENTIALS` 에러
- [ ] 401 에러 → 자동 로그아웃 및 로그인 페이지 리다이렉트

---

## 참고 문서

- `API_MAPPING.md` - 백엔드 API 매핑 테이블
- `FRONTEND_DEVELOPMENT_GUIDE.md` - 프론트엔드 개발 가이드 (상세)
- `QUICK_START.md` - 빠른 시작 가이드
- `DEVELOPMENT.md` - 개발 히스토리 (프론트엔드)
- `API_DOCUMENTATION.md` - 백엔드 API 명세 (백엔드 프로젝트)

---

## 작업 완료 체크리스트

### Phase 1: API 클라이언트 ✅ (완료)
- [x] client.ts baseURL 및 에러 처리 수정
- [x] auth.ts 엔드포인트 수정
- [x] location.ts 엔드포인트 수정
- [x] friend.ts 엔드포인트 수정
- [x] shuttle.ts 엔드포인트 수정

### Phase 2: 인증 페이지 ✅ (완료)
- [x] 로그인 페이지 - Mock 데이터 제거, 실제 API 연동
- [x] 회원가입 페이지 - Mock 데이터 제거, 실제 API 연동

### Phase 3: 홈 페이지 ✅ (완료)
- [x] 위치 공유 시작/중지 - 실제 API 연동
- [x] 페이지 로드 시 위치 공유 세션 복원
- [x] 위치 자동 업데이트 (useGeolocation 훅 수정)

### Phase 4: 친구 관리 페이지 ✅ (완료)
- [x] 친구 목록, 받은 요청 조회 - 실제 API 연동
- [x] 친구 요청 보내기 (이메일 기반)
- [x] 요청 수락/거절, 친구 삭제

### Phase 5: 마이페이지 ✅ (완료)
- [x] 내 정보 조회 - 실제 API 연동
- [x] 위치 공유 동의 토글 - 실제 API 연동
- [x] 비밀번호 변경 - 실제 API 연동

### Phase 6: 셔틀 맵 페이지 ✅ (부분 완료)
- [x] 친구 위치 조회 및 마커 표시 - API 연동 완료
- [x] 노선 정보 조회 - API 연동 완료
- [x] 경유지 정보 조회 - API 연동 완료
- [ ] **도착 시간 예측** - ⚠️ 백엔드 API 미구현 (TODO)

#### 변경 사항:

**파일**: `shuttle-tracker-fe/src/app/map/page.tsx`

1. **친구 위치 조회 API 연동**
   ```typescript
   const friendLocations = await getFriendsLocations();

   // FriendLocation → Friend 타입 변환
   const friendsData: Friend[] = friendLocations
     .filter((fl) => fl.isActive) // 위치 공유 중인 친구만
     .map((fl) => ({
       id: fl.friendId,
       name: fl.friendName,
       email: fl.friendEmail,
       currentLocation: { lat: fl.latitude, lng: fl.longitude },
       isLocationSharing: true,
     }));
   ```

2. **노선 정보 조회 API 연동**
   ```typescript
   const routesData = await getAllRoutes();

   // ShuttleRoute API 응답 → types 변환 (routeId → id)
   const routes: ShuttleRoute[] = routesData.map((route, index) => ({
     id: route.routeId,
     routeName: route.routeName,
     color: ['#FF0000', '#0000FF', '#00FF00', '#FFA500'][index % 4],
   }));
   ```

3. **경유지 정보 조회 API 연동**
   ```typescript
   const stopsData = await getRouteStops(routeId);

   // ShuttleStop API 응답 → types 변환
   const stops: ShuttleStop[] = stopsData.map((stop) => ({
     id: stop.stopId,
     routeId,
     sequence: stop.sequence,
     stopName: stop.stopName,
     lat: stop.latitude,
     lng: stop.longitude,
     isTerminal: stop.isTerminal,
   }));
   ```

#### 한계사항:
- **busRoute 정보 없음**: 백엔드가 친구가 어떤 노선을 타고 있는지 정보를 제공하지 않음
- **도착 시간 예측 API 없음**: 카카오 모빌리티 API를 사용한 도착 시간 예측 기능 미구현

---

**작업 완료**: Phase 1-6 완료 (2025-11-11)

**총 소요 시간**: 약 3시간

**문의**: 이 문서를 참조하여 진행하시고, 궁금한 사항이 있으면 언제든지 물어보세요!
