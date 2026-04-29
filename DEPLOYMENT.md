# CI/CD 및 배포 가이드

## 배포 구조

- Frontend: Vercel 권장, Root Directory는 `packages/frontend`
- Backend: Railway, Render, Fly.io, Docker 중 선택
- 지도: Google Maps JavaScript API 사용, 프론트 지도 API 키 필요
- 추천: Gemini 필수, Google Places API는 실제 장소 후보 검색용 선택 기능

## GitHub Secrets

### Frontend 배포

| Secret Name | 설명 |
| --- | --- |
| `VERCEL_TOKEN` | Vercel 인증 토큰 |
| `VERCEL_ORG_ID` | Vercel 조직 ID |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID |
| `NEXT_PUBLIC_API_URL` | 배포된 백엔드 URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API 키 |

### Backend 배포

| Secret Name | 설명 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini 추천 API 키 |
| `GOOGLE_PLACES_API_KEY` | 선택, Google Places API 후보 검색 키 |
| `RAILWAY_TOKEN` | 선택, Railway 배포 토큰 |
| `RENDER_DEPLOY_HOOK` | 선택, Render 배포 훅 |

## Vercel 설정

```bash
cd packages/frontend
vercel link
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

Vercel Dashboard에서 직접 연결하는 경우:

- Root Directory: `packages/frontend`
- Build Command: `yarn build`
- Output Directory: `.next`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL=https://your-backend.example.com`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key`

## 백엔드 배포

### Railway

1. GitHub 저장소 연결
2. 서비스 Root Directory를 `packages/backend`로 설정
3. 환경변수 설정:
   - `GEMINI_API_KEY`
   - `GOOGLE_PLACES_API_KEY` 선택
   - `PORT`
4. 생성된 백엔드 URL을 프론트의 `NEXT_PUBLIC_API_URL`에 설정

### Render

- Root Directory: `packages/backend`
- Build Command: `yarn install --frozen-lockfile && yarn build`
- Start Command: `yarn start`
- Environment Variables:
  - `GEMINI_API_KEY`
  - `GOOGLE_PLACES_API_KEY` 선택
  - `NODE_ENV=production`

### Docker

```bash
cd packages/backend
docker build -t location-backend .
docker run -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  -e GOOGLE_PLACES_API_KEY=your_places_key \
  location-backend
```

`GOOGLE_PLACES_API_KEY` 없이 실행하면 Gemini 단독 추천으로 동작합니다.

## 환경 변수

### Frontend

```env
NEXT_PUBLIC_API_URL=https://your-backend.example.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Backend

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
PORT=3001
NODE_ENV=production
```

## 배포 체크리스트

- [ ] 백엔드 `/health` 응답 확인
- [ ] 프론트 `NEXT_PUBLIC_API_URL`이 배포 백엔드 URL인지 확인
- [ ] 프론트 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 설정 확인
- [ ] 백엔드 CORS가 프론트 도메인 요청을 허용하는지 확인
- [ ] `GEMINI_API_KEY` 설정 확인
- [ ] 실제 장소 후보 검색이 필요하면 `GOOGLE_PLACES_API_KEY` 설정 확인
- [ ] `POST /api/recommend` 응답에 `places` 배열이 포함되는지 확인

## CI/CD 워크플로

### CI

```text
push/PR -> install -> frontend build -> backend build -> backend test
```

### CD

```text
push main -> Vercel frontend deploy -> optional backend deploy
```

## 문제 해결

### 프론트에서 추천 API 호출 실패

- `NEXT_PUBLIC_API_URL` 값 확인
- 백엔드 `/health` 확인
- 브라우저 콘솔의 CORS 오류 확인

### 장소 추천 실패

- `GEMINI_API_KEY` 설정 확인
- 백엔드 로그에서 Gemini 응답 파싱 오류 확인
- Google Places를 쓰는 경우 Places API (New)가 활성화되어 있는지 확인

### 장소 정확도가 낮음

- `GOOGLE_PLACES_API_KEY`를 설정해 Google Places 후보 검색을 활성화
- 카테고리별 `keyword`를 더 구체적으로 조정
