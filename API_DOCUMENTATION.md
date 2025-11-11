# 🚀 SSAFY 셔틀 트래커 API 문서

> 작성일: 2025-10-30
> Spring Boot 3.5.7 + Java 21
> Base URL: `http://localhost:8081`

---

## 📋 목차

1. [인증 (Auth)](#1-인증-auth)
2. [사용자 (User)](#2-사용자-user)
3. [친구 (Friend)](#3-친구-friend)
4. [위치 공유 (Location)](#4-위치-공유-location)
5. [셔틀 (Shuttle)](#5-셔틀-shuttle)

---

## 1. 인증 (Auth)

### 1.1. 회원가입
```http
POST /api/v1/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@ssafy.com",
  "password": "password123",
  "name": "홍길동"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### 1.2. 로그인
```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@ssafy.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "student@ssafy.com",
    "name": "홍길동",
    "locationShareAgree": false
  },
  "error": null
}
```

---

## 2. 사용자 (User)

### 2.1. 내 정보 조회
```http
GET /api/v1/users/me
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@ssafy.com",
    "name": "홍길동",
    "locationShareAgree": false
  },
  "error": null
}
```

---

### 2.2. 위치 공유 동의 변경
```http
PATCH /api/v1/users/me/location-agree
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "locationShareAgree": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### 2.3. 비밀번호 변경
```http
POST /api/v1/users/me/password
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456",
  "newPasswordConfirm": "newpassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

## 3. 친구 (Friend)

### 3.1. 친구 요청 보내기
```http
POST /api/v1/friends/request
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "toUserEmail": "friend@ssafy.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### 3.2. 받은 친구 요청 목록 조회
```http
GET /api/v1/friends/requests/received
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "friendshipId": 1,
      "friendId": 2,
      "friendEmail": "friend@ssafy.com",
      "friendName": "김철수",
      "status": "PENDING",
      "createdAt": "2025-10-30T10:00:00"
    }
  ],
  "error": null
}
```

---

### 3.3. 보낸 친구 요청 목록 조회
```http
GET /api/v1/friends/requests/sent
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "friendshipId": 2,
      "friendId": 3,
      "friendEmail": "other@ssafy.com",
      "friendName": "이영희",
      "status": "PENDING",
      "createdAt": "2025-10-30T11:00:00"
    }
  ],
  "error": null
}
```

---

### 3.4. 친구 요청 수락
```http
POST /api/v1/friends/accept/{friendshipId}
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### 3.5. 친구 요청 거절
```http
POST /api/v1/friends/reject/{friendshipId}
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### 3.6. 친구 목록 조회 (ACCEPTED만)
```http
GET /api/v1/friends
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "friendId": 2,
      "friendEmail": "friend@ssafy.com",
      "friendName": "김철수"
    },
    {
      "friendId": 3,
      "friendEmail": "other@ssafy.com",
      "friendName": "이영희"
    }
  ],
  "error": null
}
```

---

### 3.7. 친구 삭제
```http
DELETE /api/v1/friends/{friendId}
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

## 4. 위치 공유 (Location)

### 4.1. 위치 공유 시작 (1시간)
```http
POST /api/v1/location/start
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 35.135292,
  "longitude": 126.859202
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "locationShareId": 1,
    "userId": 1,
    "userEmail": "aaaa@aaaa.com",
    "userName": "홍길동",
    "latitude": 35.135292,
    "longitude": 126.859202,
    "startTime": "2025-11-10T01:02:37.7872213",
    "endTime": "2025-11-10T02:02:37.7872213",
    "isActive": true
  },
  "error": null
}
```

---

### 4.2. 위치 업데이트 (이동 중)
```http
POST /api/v1/location/update
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 35.135292,
  "longitude": 126.859202
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### 4.3. 위치 공유 중지
```http
POST /api/v1/location/stop
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

---

### 4.4. 내 위치 공유 상태 조회
```http
GET /api/v1/location/me
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "locationShareId": 1,
    "userId": 1,
    "userEmail": "student@ssafy.com",
    "userName": "홍길동",
    "latitude": 35.135292,
    "longitude": 126.859202,
    "startTime": "2025-10-30T10:00:00",
    "endTime": "2025-10-30T11:00:00",
    "isActive": true
  },
  "error": null
}
```

---

### 4.5. 친구들의 위치 조회
```http
GET /api/v1/location/friends
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "friendId": 2,
      "friendEmail": "friend@ssafy.com",
      "friendName": "김철수",
      "latitude": 35.135292,
      "longitude": 126.859202,
      "isActive": true
    },
    {
      "friendId": 3,
      "friendEmail": "other@ssafy.com",
      "friendName": "이영희",
      "latitude": 37.504567,
      "longitude": 127.042109,
      "isActive": true
    }
  ],
  "error": null
}
```

---

## 5. 셔틀 (Shuttle)

### 5.1. 모든 노선 조회 (간단)
```http
GET /api/v1/shuttle/routes
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "routeId": 1,
      "routeName": "광주 2호차",
      "description": "SSAFY 광주 캠퍼스 2호차 노선"
    }
  ],
  "error": null
}
```

---

### 5.2. 특정 노선 상세 조회 (경유지 포함)
```http
GET /api/v1/shuttle/routes/{routeId}
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "routeId": 1,
    "routeName": "광주 2호차",
    "description": "SSAFY 광주 캠퍼스 2호차 노선",
    "stops": [
      {
        "stopId": 1,
        "stopName": "효덕초 후문 앞",
        "latitude": 35.1595,
        "longitude": 126.8526,
        "sequence": 1,
        "isTerminal": false
      },
      {
        "stopId": 2,
        "stopName": "주월동 SK주유소 대창석유직영점 건너편",
        "latitude": 35.1489,
        "longitude": 126.8698,
        "sequence": 2,
        "isTerminal": false
      },
      {
        "stopId": 3,
        "stopName": "화정동 유니버시아드3단지 옆 대로변",
        "latitude": 35.1523,
        "longitude": 126.8845,
        "sequence": 3,
        "isTerminal": false
      },
      {
        "stopId": 4,
        "stopName": "금호지구대 앞",
        "latitude": 35.1478,
        "longitude": 126.9012,
        "sequence": 4,
        "isTerminal": false
      },
      {
        "stopId": 5,
        "stopName": "세정아울렛 버스정류장 앞",
        "latitude": 35.1456,
        "longitude": 126.9156,
        "sequence": 5,
        "isTerminal": false
      },
      {
        "stopId": 6,
        "stopName": "하남4번로 산단관리소 사거리 호남파이프 건너편 대로변",
        "latitude": 35.1423,
        "longitude": 126.9287,
        "sequence": 6,
        "isTerminal": false
      },
      {
        "stopId": 7,
        "stopName": "삼성 2공장 냉장고 출하장 앞",
        "latitude": 35.1398,
        "longitude": 126.9423,
        "sequence": 7,
        "isTerminal": true
      }
    ]
  },
  "error": null
}
```

---

### 5.3. 특정 노선의 모든 경유지 조회
```http
GET /api/v1/shuttle/routes/{routeId}/stops
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "stopId": 1,
      "stopName": "효덕초 후문 앞",
      "latitude": 35.1595,
      "longitude": 126.8526,
      "sequence": 1,
      "isTerminal": false
    },
    {
      "stopId": 2,
      "stopName": "주월동 SK주유소 대창석유직영점 건너편",
      "latitude": 35.1489,
      "longitude": 126.8698,
      "sequence": 2,
      "isTerminal": false
    },
    {
      "stopId": 3,
      "stopName": "화정동 유니버시아드3단지 옆 대로변",
      "latitude": 35.1523,
      "longitude": 126.8845,
      "sequence": 3,
      "isTerminal": false
    },
    {
      "stopId": 4,
      "stopName": "금호지구대 앞",
      "latitude": 35.1478,
      "longitude": 126.9012,
      "sequence": 4,
      "isTerminal": false
    },
    {
      "stopId": 5,
      "stopName": "세정아울렛 버스정류장 앞",
      "latitude": 35.1456,
      "longitude": 126.9156,
      "sequence": 5,
      "isTerminal": false
    },
    {
      "stopId": 6,
      "stopName": "하남4번로 산단관리소 사거리 호남파이프 건너편 대로변",
      "latitude": 35.1423,
      "longitude": 126.9287,
      "sequence": 6,
      "isTerminal": false
    },
    {
      "stopId": 7,
      "stopName": "삼성 2공장 냉장고 출하장 앞",
      "latitude": 35.1398,
      "longitude": 126.9423,
      "sequence": 7,
      "isTerminal": true
    }
  ],
  "error": null
}
```

---

### 5.4. 남은 경유지 조회 (특정 sequence 이후)
```http
GET /api/v1/shuttle/routes/{routeId}/stops/remaining?fromSequence=2
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "stopId": 4,
      "stopName": "금호지구대 앞",
      "latitude": 35.1478,
      "longitude": 126.9012,
      "sequence": 4,
      "isTerminal": false
    },
    {
      "stopId": 5,
      "stopName": "세정아울렛 버스정류장 앞",
      "latitude": 35.1456,
      "longitude": 126.9156,
      "sequence": 5,
      "isTerminal": false
    },
    {
      "stopId": 6,
      "stopName": "하남4번로 산단관리소 사거리 호남파이프 건너편 대로변",
      "latitude": 35.1423,
      "longitude": 126.9287,
      "sequence": 6,
      "isTerminal": false
    },
    {
      "stopId": 7,
      "stopName": "삼성 2공장 냉장고 출하장 앞",
      "latitude": 35.1398,
      "longitude": 126.9423,
      "sequence": 7,
      "isTerminal": true
    }
  ],
  "error": null
}
```

---

### 5.5. 노선 검색
```http
GET /api/v1/shuttle/routes/search?keyword=1호차
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "routeId": 1,
      "routeName": "광주 2호차",
      "description": "SSAFY 광주 캠퍼스 2호차 노선"
    }
  ],
  "error": null
}
```

---

### 5.6. 경유지 검색
```http
GET /api/v1/shuttle/stops/search?keyword=역삼
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "stopId": 4,
      "stopName": "금호지구대 앞",
      "latitude": 35.1478,
      "longitude": 126.9012,
      "sequence": 4,
      "isTerminal": false
    }
  ],
  "error": null
}
```

---

## 📊 에러 응답 형식

모든 에러는 다음과 같은 형식으로 반환됩니다:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "httpStatus": 400
  }
}
```

### 주요 에러 코드

| HTTP Status | Error Code | Message |
|------------|------------|---------|
| 400 | DUPLICATE_EMAIL | 이미 사용 중인 이메일입니다. |
| 400 | PASSWORD_MISMATCH | 현재 비밀번호가 일치하지 않습니다. |
| 400 | PASSWORD_CONFIRM_MISMATCH | 새 비밀번호와 비밀번호 확인이 일치하지 않습니다. |
| 400 | DUPLICATE_FRIENDSHIP | 이미 친구 요청이 존재합니다. |
| 401 | INVALID_CREDENTIALS | 이메일 또는 비밀번호가 일치하지 않습니다. |
| 401 | EXPIRED_TOKEN_ERROR | 만료된 토큰입니다. |
| 401 | INVALID_TOKEN_ERROR | 유효하지 않은 토큰입니다. |
| 403 | ACCESS_DENIED | 접근 권한이 없습니다. |
| 404 | NOT_FOUND_USER | 존재하지 않는 사용자입니다. |
| 404 | NOT_FOUND_FRIENDSHIP | 존재하지 않는 친구 관계입니다. |
| 404 | NOT_FOUND_LOCATION_SHARE | 위치 공유 정보를 찾을 수 없습니다. |
| 404 | NOT_FOUND_SHUTTLE_ROUTE | 존재하지 않는 셔틀 노선입니다. |
| 404 | NOT_FOUND_SHUTTLE_STOP | 존재하지 않는 셔틀 정류장입니다. |

---

## 🔐 인증 방식

모든 API (auth 제외)는 JWT 토큰 인증이 필요합니다.

**Authorization 헤더 형식:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**토큰 유효기간:** 24시간

---

## 💡 사용 예시 (Postman)

### 1. 회원가입 → 로그인
```bash
# 1. 회원가입
POST http://localhost:8081/api/v1/auth/register
Body: { "email": "test@ssafy.com", "password": "test1234", "name": "테스터" }

# 2. 로그인 (토큰 발급)
POST http://localhost:8081/api/v1/auth/login
Body: { "email": "test@ssafy.com", "password": "test1234" }
→ accessToken 복사

# 3. 내 정보 조회
GET http://localhost:8081/api/v1/users/me
Headers: Authorization: Bearer {accessToken}
```

### 2. 친구 요청 → 수락
```bash
# 1. 친구 요청 보내기
POST http://localhost:8081/api/v1/friends/request
Headers: Authorization: Bearer {accessToken}
Body: { "toUserEmail": "friend@ssafy.com" }

# 2. (친구가) 받은 요청 확인
GET http://localhost:8081/api/v1/friends/requests/received
Headers: Authorization: Bearer {friendToken}

# 3. (친구가) 요청 수락
POST http://localhost:8081/api/v1/friends/accept/1
Headers: Authorization: Bearer {friendToken}
```

### 3. 위치 공유 → 친구 위치 조회
```bash
# 1. 위치 공유 시작
POST http://localhost:8081/api/v1/location/start
Headers: Authorization: Bearer {accessToken}
Body: { "latitude": 37.501234, "longitude": 127.039876 }

# 2. 친구들의 위치 조회
GET http://localhost:8081/api/v1/location/friends
Headers: Authorization: Bearer {accessToken}
```

---

**문서 작성일:** 2025-10-30
**API 버전:** 1.0
**문의:** SSAFY 셔틀 트래커 팀
