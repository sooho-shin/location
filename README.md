# LOCATION

LOCATION은 사용자의 현재 위치와 관심 카테고리를 기준으로 한국의 장소를 추천하고 지도에 표시하는 웹 서비스입니다.

## 주요 기능

- 위치 기반 추천: 브라우저 Geolocation으로 현재 위치를 가져옵니다.
- AI 추천: Gemini가 카테고리와 키워드에 맞는 장소를 추천합니다.
- 실제 장소 후보 결합: `GOOGLE_PLACES_API_KEY`가 있으면 Google Places API 후보를 먼저 가져온 뒤 Gemini가 후보 안에서 설명과 순서를 정리합니다.
- 실제 상세 정보: 추천 장소에 Google Place ID가 있으면 Place Details API로 주소, 전화번호, 영업시간, 평점, 리뷰를 가져옵니다.
- 지도 표시: OpenStreetMap 타일과 Leaflet으로 장소 마커와 클러스터를 표시합니다.
- 장소 상세: 마커 클릭 시 상세 패널과 카카오맵 길찾기 링크를 제공합니다.

## 기술 스택

### Frontend

- Next.js 16
- React 19
- TypeScript
- styled-components
- Leaflet, react-leaflet

### Backend

- Express
- TypeScript
- Gemini API
- Google Places API (선택)

### 공통

- Yarn Workspaces
- 모노레포 구조: `packages/*`

## 프로젝트 구조

```text
location/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.ts    # 실제 Express 서버
│   │   │   └── index.ts     # server.ts 호환 진입점
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       ├── package.json
│       └── tsconfig.json
├── package.json
└── README.md
```

## 환경 변수

### Frontend

`packages/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

지도는 OpenStreetMap + Leaflet 기반이라 프론트엔드 지도 API 키가 필요하지 않습니다.

### Backend

`packages/backend/.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
PORT=3001
NODE_ENV=development
```

`GOOGLE_PLACES_API_KEY`는 선택입니다. 값이 없으면 Gemini 단독 추천으로 동작합니다.

## 실행

의존성 설치:

```bash
yarn install
```

프론트엔드 개발 서버:

```bash
yarn dev
```

기본 주소는 `http://localhost:3000`입니다.

백엔드 개발 서버:

```bash
yarn dev:backend
```

기본 주소는 `http://localhost:3001`입니다.

프론트와 백엔드 동시 실행:

```bash
yarn dev:all
```

## API

### `GET /health`

백엔드 상태를 확인합니다.

### `POST /api/recommend`

현재 위치와 카테고리를 기반으로 장소를 추천합니다.

요청:

```json
{
  "category": "케이팝 헌터스",
  "keyword": "K-pop 관련 명소, 엔터테인먼트 회사, 굿즈샵",
  "latitude": 37.5665,
  "longitude": 126.978
}
```

### `GET /api/places/:placeId`

Google Place Details API를 통해 선택한 장소의 상세 정보를 가져옵니다. `GOOGLE_PLACES_API_KEY`가 설정되어 있어야 합니다.

응답:

```json
{
  "places": [
    {
      "name": "장소 이름",
      "description": "추천 설명",
      "latitude": 37.5665,
      "longitude": 126.978,
      "category": "케이팝 헌터스",
      "source": "google_places"
    }
  ],
  "source": "google_places_gemini"
}
```

## 빌드

프론트엔드:

```bash
yarn build:frontend
```

백엔드:

```bash
yarn build:backend
```

전체 프론트 빌드 alias:

```bash
yarn build
```
