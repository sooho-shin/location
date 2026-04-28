# Location Backend

Express 기반 장소 추천 API입니다. 사용자의 위치, 카테고리, 키워드를 받아 추천 장소 목록을 반환합니다.

## 동작 방식

1. `GOOGLE_PLACES_API_KEY`가 있으면 Google Places API (New)의 Text Search로 실제 장소 후보를 조회합니다.
2. Gemini가 후보 장소 안에서 추천 목록을 정리하고 짧은 설명을 생성합니다.
3. 추천 결과의 Google Place ID로 Place Details API를 호출해 상세 팝업에 필요한 실제 정보를 가져옵니다.
4. Google Places 키가 없으면 Gemini 단독 추천으로 동작합니다.
5. Gemini 응답 JSON 파싱에 실패해도 Google Places 후보가 있으면 후보 목록을 fallback으로 반환합니다.

## 환경 변수

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
PORT=3001
NODE_ENV=development
```

`GOOGLE_PLACES_API_KEY`는 선택입니다.

## 실행

```bash
yarn dev
```

## 빌드

```bash
yarn build
yarn start
```

## API

### `GET /health`

서버 상태를 반환합니다.

### `POST /api/recommend`

요청:

```json
{
  "category": "한강라면",
  "keyword": "한강 공원 편의점, 라면 먹을 수 있는 곳",
  "latitude": 37.5665,
  "longitude": 126.978
}
```

### `GET /api/places/:placeId`

선택한 장소의 Google Place Details 정보를 반환합니다. 주소, 전화번호, 영업시간, 평점, 리뷰, Google Maps URL 등을 포함합니다.

응답:

```json
{
  "places": [
    {
      "name": "장소 이름",
      "description": "추천 설명",
      "latitude": 37.5665,
      "longitude": 126.978,
      "category": "한강라면",
      "source": "google_places"
    }
  ],
  "source": "google_places_gemini"
}
```
