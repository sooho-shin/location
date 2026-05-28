# LOCATION 개발 가이드

## 문서 목적

이 문서는 LOCATION 프로젝트의 개발 작업 기준이다. 코드를 수정하기 전에 `docs/PRODUCT_SPEC.md`를 먼저 확인하고, 구현 방식은 이 문서의 원칙을 따른다.

## 작업 전 확인 순서

1. `docs/PRODUCT_SPEC.md`에서 제품 방향과 현재 기능 범위를 확인한다.
2. API나 데이터 구조를 바꾸는 작업이면 `docs/API_CONTRACT.md`를 확인한다.
3. 프론트엔드 작업이면 `packages/frontend/src/app`, `packages/frontend/src/components`, `packages/frontend/src/lib`의 기존 패턴을 먼저 본다.
4. 백엔드 작업이면 `packages/backend/src/server.ts`의 현재 API 계약과 fallback 동작을 먼저 본다.
5. 새 패키지 추가 전 기존 의존성으로 해결 가능한지 확인한다.

## 저장소 구조

```text
location/
├── docs/
├── packages/
│   ├── frontend/
│   └── backend/
├── .agents/
│   └── skills/
├── AGENTS.md
├── README.md
└── DEPLOYMENT.md
```

## 기술 스택

프론트엔드:

- Next.js 16
- React 19
- TypeScript
- styled-components
- Google Maps JavaScript API

백엔드:

- Express
- TypeScript
- Gemini API
- Google Places API

공통:

- Yarn workspaces
- 환경 변수 기반 설정

## 명령어

의존성 설치:

```bash
yarn install
```

프론트엔드 개발 서버:

```bash
yarn dev
```

백엔드 개발 서버:

```bash
yarn dev:backend
```

프론트엔드와 백엔드 동시 실행:

```bash
yarn dev:all
```

프론트엔드 빌드:

```bash
yarn build:frontend
```

백엔드 빌드:

```bash
yarn build:backend
```

## 프론트엔드 원칙

- 사용자의 첫 화면은 지도 기반 실제 앱 화면이어야 한다.
- 지도 컴포넌트는 브라우저 전용이므로 SSR에서 직접 실행하지 않는다.
- Google Maps 스크립트는 중복 삽입하지 않는다.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`가 없으면 사용자에게 명확한 에러를 표시한다.
- 환경 변수는 `packages/frontend/.env.local`에서 관리한다.
- 공통 UI 패턴은 기존 컴포넌트를 먼저 재사용한다.
- 작은 UI 변경도 모바일 화면에서 텍스트 잘림과 겹침을 확인한다.
- 지도 위 floating UI는 z-index와 클릭 영역을 명확히 한다.
- 새 카테고리는 이미지, 마커 색상, 검색 키워드를 함께 추가한다.

## 백엔드 원칙

- `/health`, `POST /api/recommend`, `GET /api/places/:placeId` 계약을 임의로 깨지 않는다.
- `GEMINI_API_KEY`는 추천 설명과 정렬에 사용한다.
- `GOOGLE_PLACES_API_KEY`는 실제 장소 후보 검색과 상세 정보 조회에 사용한다.
- `GOOGLE_PLACES_API_KEY`가 없어도 후보 없는 Gemini 단독 추천으로 동작할 수 있어야 한다.
- Google Places 호출 실패는 전체 추천 실패로 바로 이어지지 않게 fallback을 유지한다.
- Gemini JSON 파싱 실패 시 후보가 있으면 후보를 반환한다.
- API 키 원문을 로그에 남기지 않는다.
- 사용자 위치 좌표는 요청 처리에 필요한 범위에서만 사용한다.

## 환경 변수 관리

커밋 금지:

- `.env`
- `.env.local`
- 실제 API 키가 포함된 파일

프론트엔드 예시:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

백엔드 예시:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
PORT=3001
NODE_ENV=development
```

## 문서 변경 원칙

- Markdown 문서는 한국어로 작성한다.
- 구현이 제품 동작을 바꾸면 `docs/PRODUCT_SPEC.md`도 함께 갱신한다.
- API 요청/응답이 바뀌면 `docs/API_CONTRACT.md`를 함께 갱신한다.
- 배포 환경 변수가 바뀌면 `DEPLOYMENT.md`를 함께 갱신한다.
- README는 빠른 소개와 실행 가이드 중심으로 유지한다.

## 검증 원칙

변경 범위에 따라 다음 중 필요한 검증을 수행한다.

- 프론트엔드 변경: `yarn build:frontend`
- 백엔드 변경: `yarn build:backend`
- 환경 변수 또는 API 연동 변경: `/health`, 추천 요청, 브라우저 콘솔 확인
- 지도 UI 변경: 로컬 브라우저에서 지도 표시와 마커 표시 확인
- 문서/스킬 변경: 관련 링크와 파일 경로가 실제로 존재하는지 확인

## 금지 사항

- 기획 문서와 다른 방향으로 기능을 암묵적으로 추가하지 않는다.
- API 키를 코드, 문서, 로그, 스크린샷에 노출하지 않는다.
- 지도 스택을 바꿀 때 기획 문서와 개발 가이드를 갱신하지 않은 채 진행하지 않는다.
- 카테고리 하나만을 위한 임시 분기 로직을 여러 파일에 흩뿌리지 않는다.
- 사용자 요청과 무관한 리팩터링을 큰 범위로 섞지 않는다.
