---
name: location-project
description: "LOCATION 모노레포 작업에 사용한다. Next.js 프론트엔드, Express 백엔드, Yarn workspace 명령어, 환경 변수, 장소 추천 API, Leaflet 지도 동작, Gemini/Google Places 연동, 배포 변경을 다룬다. packages/frontend, packages/backend, README.md, DEPLOYMENT.md, package.json, CI/배포/설정 파일을 수정할 때 사용한다."
---

# LOCATION 프로젝트

## 기본 작업 흐름

- 이 저장소는 `packages/frontend`와 `packages/backend`를 가진 Yarn workspaces 모노레포로 다룬다.
- 동작을 바꾸기 전에 `README.md`, `package.json`, 관련 패키지 파일을 먼저 읽는다.
- 사용자가 명시적으로 end-to-end 변경을 요청하지 않는 한 프론트엔드, 백엔드, 배포 변경을 분리해서 다룬다.
- 새 패키지를 추가하기 전에 기존 의존성과 로컬 패턴을 우선 사용한다.
- `.env`, `.env.local`, 빌드 산출물, `.next`, `dist`, `node_modules`는 커밋하지 않는다.

## 언어 규칙

- 이 프로젝트의 Markdown 문서는 사용자가 다른 언어를 명시하지 않는 한 한국어로 작성한다.
- 새 Markdown 문서를 만들거나 기존 Markdown 문서를 수정할 때 제목, 설명, 체크리스트, 주석성 문구를 한국어로 유지한다.
- 커밋 메시지는 항상 한국어로 작성한다.

## 명령어

- 의존성 설치에는 `yarn install`을 사용한다.
- 프론트엔드는 `yarn dev:frontend` 또는 `yarn dev`로 실행한다.
- 백엔드는 `yarn dev:backend`로 실행한다.
- 두 서버가 모두 필요할 때만 `yarn dev:all`을 사용한다.
- 변경한 패키지에 따라 `yarn build:frontend`, `yarn build:backend`, `yarn build`를 선택한다.
- 프론트엔드 코드를 변경했으면 `yarn lint`로 lint를 확인한다.

## 아키텍처

- 프론트엔드: Next.js 16, React 19, TypeScript, styled-components, Leaflet, react-leaflet.
- 백엔드: Express, TypeScript, Gemini API, 선택적 Google Places API.
- 데이터 흐름: 프론트엔드가 위치와 카테고리 데이터를 백엔드로 보내고, 백엔드는 추천 장소를 반환하며, 프론트엔드는 OpenStreetMap/Leaflet 위에 마커와 상세 정보를 표시한다.
- 프론트엔드의 공개 API URL은 `NEXT_PUBLIC_API_URL`에서 가져온다.
- 백엔드는 `GEMINI_API_KEY`가 필요하고, `GOOGLE_PLACES_API_KEY`는 선택 사항이다.

## 프론트엔드 변경 시

- 기존 패턴 확인을 위해 `packages/frontend/src/app`, `packages/frontend/src/components`, `packages/frontend/src/lib`를 먼저 살핀다.
- 브라우저 전용 지도 코드는 Next.js 렌더링 제약과 충돌하지 않게 유지한다.
- 화면에 표시하는 장소 데이터는 백엔드 응답 필드와 맞춘다.
- 사용자에게 보이는 문구를 바꿀 때는 한국어 UI 맥락에서 문장과 레이아웃을 확인한다.

## 백엔드 변경 시

- API 동작은 먼저 `packages/backend/src/server.ts`에서 확인한다.
- 사용자가 명시적으로 API 변경을 요청하지 않는 한 `/health`, `POST /api/recommend`, `GET /api/places/:placeId` 계약을 유지한다.
- `GOOGLE_PLACES_API_KEY`가 없어도 Gemini 단독 모드로 정상 동작해야 한다.
- 시크릿이나 원본 API 키를 로그에 남기지 않는다.

## 참조 문서

- 프로젝트 구조, API 계약, 배포 메모가 필요하면 `references/project.md`를 읽는다.
- 스킬 자체의 목적과 사용 방법 설명이 필요하면 `references/skill.md`를 읽는다.
