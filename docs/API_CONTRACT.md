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

## 추천 카테고리 모델

바텀시트에 표시하는 추천 카테고리 모델은 다음 구조를 기준으로 한다.

```ts
interface RecommendedCategory {
  id: string;
  title: string;
  subtitle: string;
  keyword: string;
  reason: string;
  image: string;
  themeColor: string;
  searchRadius: number;
  priority: number;
}
```

필수 필드:

- `id`
- `title`
- `subtitle`
- `keyword`
- `image`

`keyword`는 이후 `POST /api/recommend` 요청에 그대로 사용할 수 있어야 한다.

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
  "language": "ko",
  "latitude": 37.5665,
  "longitude": 126.978
}
```

요청 필드:

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `category` | 선택 | 사용자에게 보이는 카테고리 이름. 없으면 `추천 장소`로 처리한다. |
| `keyword` | 선택 | Google Places와 Gemini 프롬프트에 사용할 검색 키워드. 없으면 category 값을 사용한다. |
| `language` | 선택 | 응답 설명과 Google Places 검색 언어. `ko`, `en`, `ja`, `zh`, `fr`를 지원하고 기본값은 `ko`다. |
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
| `empty` | Places 후보가 없고 Gemini가 일시 장애라 빈 결과를 반환했다. |

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

## `POST /api/categories/recommend`

현재 위치와 시간대에 맞는 탐색 카테고리 버튼을 추천한다.

요청:

```http
POST /api/categories/recommend
Content-Type: application/json
```

요청 본문:

```json
{
  "latitude": 37.5665,
  "longitude": 126.978,
  "localTime": "2026-05-28T20:30:00+09:00",
  "language": "ko",
  "userType": "japanese-tourist",
  "recentSelectedCategoryIds": ["kpop"]
}
```

요청 필드:

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `latitude` | 필수 | 사용자 위치 위도 |
| `longitude` | 필수 | 사용자 위치 경도 |
| `localTime` | 선택 | 사용자의 현지 시간. 없으면 서버 현재 시간을 사용한다. |
| `language` | 선택 | UI와 추천 카테고리 언어. `ko`, `en`, `ja`, `zh`, `fr`를 지원하고 기본값은 `ko`다. |
| `userType` | 선택 | 사용자 유형. 기본값은 `japanese-tourist`다. |
| `recentSelectedCategoryIds` | 선택 | 최근 선택한 카테고리 ID 배열 |

성공 응답:

```json
{
  "categories": [
    {
      "id": "night-view",
      "title": "야경 명소",
      "subtitle": "저녁에 가기 좋은 뷰",
      "keyword": "야경 명소, 전망대, 밤 산책 명소",
      "reason": "저녁 시간대에 잘 맞는 주제입니다.",
      "image": "https://images.unsplash.com/...",
      "themeColor": "#3F51B5",
      "searchRadius": 4000,
      "priority": 1
    }
  ],
  "source": "gemini"
}
```

`source` 값:

| 값 | 의미 |
| --- | --- |
| `gemini` | Gemini가 후보 풀에서 현재 상황에 맞는 카테고리를 골랐다. |
| `fallback` | Gemini 없이 서버 fallback 카테고리를 반환했다. |

위도 또는 경도가 유효하지 않으면 400을 반환한다.

```json
{
  "error": "위치 정보가 필요합니다."
}
```

Gemini 호출이나 JSON 파싱이 실패해도 가능한 경우 500 대신 fallback 카테고리를 반환한다.

## `GET /api/places/:placeId`

Google Places 상세 정보를 조회한다.

요청:

```http
GET /api/places/{placeId}?language=ko
```

`placeId`는 Google Places의 `id` 또는 `places/{id}` 형식을 받을 수 있다.

쿼리 필드:

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `language` | 선택 | Google Places 상세 정보 언어. `ko`, `en`, `ja`, `zh`, `fr`를 지원하고 기본값은 `ko`다. |

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
  "photos": [
    {
      "name": "places/examplePlaceId/photos/examplePhotoName",
      "widthPx": 1200,
      "heightPx": 800
    }
  ],
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

## `GET /api/place-photo`

Google Places Photo를 백엔드에서 프록시한다. 프론트엔드에 `GOOGLE_PLACES_API_KEY`를 노출하지 않기 위해 직접 Google Photo URL을 만들지 않는다.

요청:

```http
GET /api/place-photo?name={photoName}
```

쿼리 필드:

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `name` | 필수 | Google Places Details 응답의 `photos[].name` 값 |

성공 응답:

- `Content-Type`: Google에서 내려준 이미지 MIME 타입
- Body: 이미지 바이너리
- `Cache-Control`: `public, max-age=86400`

실패 응답:

```json
{
  "error": "장소 사진을 가져오지 못했습니다.",
  "details": "실패 상세 메시지"
}
```

사진이 없거나 로드에 실패하면 프론트엔드는 카테고리 대표 이미지를 fallback으로 사용한다.

## 외부 API 연동

Gemini:

- 모델: `gemini-2.5-flash`
- 응답 형식: JSON
- 온도: `0.2`
- 역할: 추천 카테고리 큐레이션, 후보 장소 정리, 설명 생성, fallback 추천

Google Places:

- Text Search endpoint: `https://places.googleapis.com/v1/places:searchText`
- Details endpoint: `https://places.googleapis.com/v1/places/{placeId}`
- Photo media endpoint: `https://places.googleapis.com/v1/{photoName}/media`
- 언어: `ko`
- 지역: `KR`
- 후보 검색 반경: 사용자 위치 기준 2000m
- 최대 추천 수: 10

## 호환성 규칙

- 프론트엔드의 `Place` 타입에 필수 필드를 추가하려면 이 문서와 백엔드 응답을 같이 수정한다.
- `POST /api/recommend`의 요청 필드는 기존 클라이언트 호환성을 깨지 않는 방식으로 확장한다.
- `POST /api/categories/recommend`는 후보 풀 안의 카테고리만 반환해야 한다.
- Gemini 일시 장애와 Places 후보 없음이 동시에 발생하면 500 대신 빈 `places` 배열과 `source: "empty"`를 반환할 수 있다.
- 상세 조회 실패는 장소 패널 전체 실패가 아니라 상세 정보 일부 누락으로 표현한다.
- Places Photo는 백엔드 프록시를 통해서만 호출하고 프론트엔드에 백엔드 Places 키를 노출하지 않는다.
- `GOOGLE_PLACES_API_KEY`가 없어도 추천 API는 Gemini 단독 모드로 동작할 수 있어야 한다.
