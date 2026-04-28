# LOCATION 프로젝트 참조

## 목적

LOCATION은 사용자의 현재 위치와 선택한 카테고리를 기준으로 한국의 장소를 추천하고, 추천 결과를 Leaflet/OpenStreetMap 지도에 표시한다.

## 저장소 구조

- 루트 패키지: `location-monorepo`
- 워크스페이스: `packages/*`
- 프론트엔드: `packages/frontend`
- 백엔드: `packages/backend`
- 배포 가이드: `DEPLOYMENT.md`

## 루트 명령어

- `yarn dev` 또는 `yarn dev:frontend`: 프론트엔드를 실행한다.
- `yarn dev:backend`: 백엔드를 실행한다.
- `yarn dev:all`: 프론트엔드와 백엔드를 함께 실행한다.
- `yarn build` 또는 `yarn build:frontend`: 프론트엔드를 빌드한다.
- `yarn build:backend`: 백엔드를 빌드한다.
- `yarn lint`: 프론트엔드 lint를 실행한다.

## 런타임 설정

프론트엔드:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

백엔드:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_key_here
PORT=3001
NODE_ENV=development
```

`GOOGLE_PLACES_API_KEY`는 선택 사항이다. 값이 없어도 백엔드는 Gemini 단독 모드로 동작해야 한다.

## API 계약

`GET /health`

- 백엔드 상태를 반환한다.

`POST /api/recommend`

- 카테고리, 키워드, 위도, 경도를 받는다.
- `places` 배열과 source 정보를 반환한다.
- `GOOGLE_PLACES_API_KEY`가 설정되어 있으면 Google Places 후보를 우선 가져오고, Gemini로 순서와 설명을 정리한다.

`GET /api/places/:placeId`

- 선택한 장소의 Google Place Details를 가져온다.
- `GOOGLE_PLACES_API_KEY`가 필요하다.

## 배포

- 프론트엔드: Vercel을 사용하고 Root Directory는 `packages/frontend`로 둔다.
- 백엔드: Railway, Render, Fly.io, Docker 중 하나를 사용할 수 있다.
- 프론트엔드 배포에는 배포된 백엔드 URL을 가리키는 `NEXT_PUBLIC_API_URL`이 필요하다.
- 백엔드 배포에는 `GEMINI_API_KEY`가 필요하고, `GOOGLE_PLACES_API_KEY`는 선택 사항이다.
- 배포 후 `/health`와 `POST /api/recommend`를 확인한다.
