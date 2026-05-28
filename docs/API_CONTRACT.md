# LOCATION API 계약

## 문서 목적

이 문서는 프론트엔드와 백엔드 사이의 API 계약을 정의한다. 백엔드 API, 프론트엔드 데이터 모델, 외부 API 연동 방식을 바꿀 때 반드시 확인하고 갱신한다.

## 기본 정보

로컬 백엔드 기본 주소:

```text
http://localhost:3001
```

프론트엔드는 다음 환경 변수를 통해 백엔드 주소를 읽는다.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

응답은 JSON을 기본으로 한다.

## 공통 장소 모델

프론트엔드와 백엔드가 공유하는 장소 모델은 다음 구조를 기준으로 한다.

```ts
interface Place {
  id?: string;
  placeId?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  source?: "google_places" | "gemini";
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
}
```

필수 필드:

- `name`
- `description`
- `latitude`
- `longitude`
- `category`

Google Places 후보에서 온 장소는 가능하면 다음 필드를 포함한다.

- `id`
- `placeId`
- `source`
- `googleMapsUri`
- `rating`
- `userRatingCount`

## `GET /health`

백엔드 상태를 확인한다.

요청:

```http
GET /health
```

성공 응답:

```json
{
  "status": "ok",
  "timestamp": "2026-05-28T00:00:00.000Z"
}
```

## `POST /api/recommend`

현재 위치와 카테고리를 기반으로 장소 추천을 요청한다.

요청:

```http
POST /api/recommend
Content-Type: application/json
```

요청 본문:

```json
{
  "category": "케이팝 헌터스",
  "keyword": "K-pop 관련 명소, 아이돌 연습실, 엔터테인먼트 회사, 굿즈샵",
  "latitude": 37.5665,
  "longitude": 126.978
}
```

요청 필드:

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `category` | 선택 | 사용자에게 보이는 카테고리 이름. 없으면 `추천 장소`로 처리한다. |
| `keyword` | 선택 | Google Places와 Gemini 프롬프트에 사용할 검색 키워드. 없으면 category 값을 사용한다. |
| `latitude` | 필수 | 사용자 위치 위도 |
| `longitude` | 필수 | 사용자 위치 경도 |

성공 응답:

```json
{
  "places": [
    {
      "id": "places/example",
      "placeId": "examplePlaceId",
      "name": "장소 이름",
      "description": "20자 이내 설명",
      "latitude": 37.5665,
      "longitude": 126.978,
      "category": "케이팝 헌터스",
      "source": "google_places",
      "googleMapsUri": "https://maps.google.com/...",
      "rating": 4.5,
      "userRatingCount": 123
    }
  ],
  "source": "google_places_gemini"
}
```

`source` 값:

| 값 | 의미 |
| --- | --- |
| `google_places_gemini` | Google Places 후보를 가져온 뒤 Gemini로 정리했다. |
| `gemini` | Google Places 후보 없이 Gemini 추천을 사용했다. |

실패 응답:

```json
{
  "error": "장소 추천에 실패했습니다.",
  "details": "실패 상세 메시지"
}
```

위도 또는 경도가 유효하지 않으면 400을 반환한다.

```json
{
  "error": "위치 정보가 필요합니다."
}
```

## `GET /api/places/:placeId`

Google Places 상세 정보를 조회한다.

요청:

```http
GET /api/places/{placeId}
```

`placeId`는 Google Places의 `id` 또는 `places/{id}` 형식을 받을 수 있다.

성공 응답은 Google Places API 응답 일부를 그대로 따른다.

```json
{
  "id": "examplePlaceId",
  "name": "places/examplePlaceId",
  "displayName": {
    "text": "장소 이름"
  },
  "formattedAddress": "주소",
  "googleMapsUri": "https://maps.google.com/...",
  "websiteUri": "https://example.com",
  "nationalPhoneNumber": "02-000-0000",
  "businessStatus": "OPERATIONAL",
  "rating": 4.5,
  "userRatingCount": 123,
  "currentOpeningHours": {
    "openNow": true,
    "weekdayDescriptions": ["월요일: 오전 9:00~오후 6:00"]
  },
  "reviews": []
}
```

실패 응답:

```json
{
  "error": "장소 상세 정보를 가져오지 못했습니다.",
  "details": "실패 상세 메시지"
}
```

`GOOGLE_PLACES_API_KEY`가 없으면 상세 조회는 실패한다.

## 외부 API 연동

Gemini:

- 모델: `gemini-2.5-flash`
- 응답 형식: JSON
- 온도: `0.2`
- 역할: 후보 장소 정리, 설명 생성, fallback 추천

Google Places:

- Text Search endpoint: `https://places.googleapis.com/v1/places:searchText`
- Details endpoint: `https://places.googleapis.com/v1/places/{placeId}`
- 언어: `ko`
- 지역: `KR`
- 후보 검색 반경: 사용자 위치 기준 2000m
- 최대 추천 수: 10

## 호환성 규칙

- 프론트엔드의 `Place` 타입에 필수 필드를 추가하려면 이 문서와 백엔드 응답을 같이 수정한다.
- `POST /api/recommend`의 요청 필드는 기존 클라이언트 호환성을 깨지 않는 방식으로 확장한다.
- 상세 조회 실패는 장소 패널 전체 실패가 아니라 상세 정보 일부 누락으로 표현한다.
- `GOOGLE_PLACES_API_KEY`가 없어도 추천 API는 Gemini 단독 모드로 동작할 수 있어야 한다.
