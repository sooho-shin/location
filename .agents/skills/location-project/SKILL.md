---
name: location-project
description: "LOCATION 모노레포 작업에 사용한다. Next.js 프론트엔드, Express 백엔드, Yarn workspace 명령어, 환경 변수, Google Maps 지도 동작, Gemini/Google Places 연동, 장소 추천 API, 제품 기획 문서, 배포 변경을 다룬다. packages/frontend, packages/backend, docs, README.md, DEPLOYMENT.md, package.json, CI/배포/설정 파일을 수정할 때 사용한다."
---

# LOCATION 프로젝트

## 기본 작업 흐름

- 이 저장소는 `packages/frontend`와 `packages/backend`를 가진 Yarn workspaces 모노레포로 다룬다.
- 동작을 바꾸기 전에 `docs/PRODUCT_SPEC.md`를 먼저 읽고, 구현 방식은 `docs/DEVELOPMENT_GUIDE.md`를 확인한다.
- API 요청/응답, 장소 데이터 모델, Gemini/Google Places 연동을 바꾸면 `docs/API_CONTRACT.md`를 먼저 확인하고 함께 갱신한다.
- 우선순위나 단계 판단이 필요하면 `docs/ROADMAP.md`를 참고한다.
- `README.md`, `package.json`, 관련 패키지 파일은 작업 범위에 맞게 추가로 읽는다.
- 사용자가 명시적으로 end-to-end 변경을 요청하지 않는 한 프론트엔드, 백엔드, 배포 변경을 분리해서 다룬다.
- 새 패키지를 추가하기 전에 기존 의존성과 로컬 패턴을 우선 사용한다.
- `.env`, `.env.local`, 빌드 산출물, `.next`, `dist`, `node_modules`는 커밋하지 않는다.
- 기획 문서와 코드가 충돌하면 임의로 구현을 밀어붙이지 말고, 기획 문서를 갱신해야 하는 변경인지 판단한다.

## 명령어

- 의존성 설치에는 `yarn install`을 사용한다.
- 프론트엔드는 `yarn dev:frontend` 또는 `yarn dev`로 실행한다.
- 백엔드는 `yarn dev:backend`로 실행한다.
- 두 서버가 모두 필요할 때만 `yarn dev:all`을 사용한다.
- 변경한 패키지에 따라 `yarn build:frontend`, `yarn build:backend`, `yarn build`를 선택한다.
- 프론트엔드 코드를 변경했으면 `yarn lint`로 lint를 확인한다.

## 아키텍처

- 프론트엔드: Next.js 16, React 19, TypeScript, styled-components, Google Maps JavaScript API.
- 백엔드: Express, TypeScript, Gemini API, 선택적 Google Places API.
- 데이터 흐름: 프론트엔드가 위치와 카테고리 데이터를 백엔드로 보내고, 백엔드는 추천 장소를 반환하며, 프론트엔드는 Google Maps 위에 마커와 상세 정보를 표시한다.
- 프론트엔드의 공개 API URL은 `NEXT_PUBLIC_API_URL`에서 가져온다.
- 프론트엔드 지도 키는 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`에서 가져온다.
- 백엔드는 `GEMINI_API_KEY`가 필요하고, `GOOGLE_PLACES_API_KEY`는 실제 장소 후보와 상세 정보용 선택 사항이다.

## 프론트엔드 변경 시

- 기존 패턴 확인을 위해 `packages/frontend/src/app`, `packages/frontend/src/components`, `packages/frontend/src/lib`를 먼저 살핀다.
- 새 컴포넌트를 만들기 전에 같은 역할의 공통 컴포넌트가 이미 있는지 반드시 확인한다.
- 여러 화면이나 컴포넌트에서 재사용될 수 있는 UI는 개별 화면 안에 두지 말고 공통 컴포넌트로 분리한다.
- 이미 공통 컴포넌트로 분리된 패턴이 있으면 새 구현을 만들지 말고 그 컴포넌트를 재사용하거나 확장한다.
- UI, 문구, 인터랙션을 변경할 때는 기존 서비스의 톤앤매너와 시각적 스타일을 반드시 유지한다.
- Google Maps 기반 지도 코드는 브라우저 전용이므로 Next.js 렌더링 제약과 충돌하지 않게 유지한다.
- 화면에 표시하는 장소 데이터는 백엔드 응답 필드와 맞춘다.
- 사용자에게 보이는 문구를 바꿀 때는 한국어 UI 맥락에서 문장과 레이아웃을 확인한다.
- 카테고리를 추가하거나 바꾸면 `docs/PRODUCT_SPEC.md`의 카테고리 정책을 함께 확인한다.

## 백엔드 변경 시

- API 동작은 먼저 `packages/backend/src/server.ts`에서 확인한다.
- 사용자가 명시적으로 API 변경을 요청하지 않는 한 `/health`, `POST /api/recommend`, `GET /api/places/:placeId` 계약을 유지한다.
- `GOOGLE_PLACES_API_KEY`가 없어도 Gemini 단독 모드로 정상 동작해야 한다.
- 시크릿이나 원본 API 키를 로그에 남기지 않는다.
- Google Places 후보 검색 실패는 전체 추천 실패로 바로 이어지지 않게 fallback을 유지한다.

## 참조 문서

- 제품 기준은 `docs/PRODUCT_SPEC.md`를 읽는다.
- 개발 방식과 검증 기준은 `docs/DEVELOPMENT_GUIDE.md`를 읽는다.
- API 계약과 장소 모델은 `docs/API_CONTRACT.md`를 읽는다.
- 개발 단계와 우선순위는 `docs/ROADMAP.md`를 읽는다.
- 프로젝트 구조, API 계약, 배포 메모가 필요하면 `references/project.md`를 읽는다.
- 스킬 자체의 목적과 사용 방법 설명이 필요하면 `references/skill.md`를 읽는다.
