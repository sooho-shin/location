# LOCATION 📍

LOCATION에 오신 것을 환영합니다. 이 서비스는 외국인들이 현재 위치와 관심사를 기반으로 한국의 유명 명소와 숨겨진 장소를 쉽게 찾을 수 있도록 돕는 웹 서비스입니다.

## ✨ 주요 기능

- **위치 기반 검색**: 사용자의 현재 위치를 자동으로 가져와 관련성 높은 결과를 제공합니다.
- **AI 기반 추천**: "케이팝", "고궁", "맛집"과 같은 키워드를 입력하면 AI가 주변 명소들을 추천합니다.
- **인터랙티브 지도**: 추천된 장소를 Google 지도 위에 시각적으로 표시합니다.
- **반응형 디자인**: 데스크톱과 모바일 기기 모두에서 완벽하게 접근하고 사용할 수 있습니다.

## 🛠️ 기술 스택

### Frontend
- **프레임워크**: [Next.js](https://nextjs.org/) (React)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **스타일링**: [Styled-Components](https://styled-components.com/)
- **상태 관리**:
  - **클라이언트 상태**: [Zustand](https://github.com/pmndrs/zustand)
  - **서버 상태**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **지도**: [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api)
- **HTTP 클라이언트**: [Axios](https://axios-http.com/)

### Backend
- **프레임워크**: [Express.js](https://expressjs.com/)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **포트**: 3001

### 공통
- **패키지 매니저**: [Yarn Workspaces](https://yarnpkg.com/)
- **모노레포 구조**: `packages/*`

## 📁 프로젝트 구조

```
location/
├── packages/
│   ├── backend/              # Express.js 백엔드 서버 (포트 3001)
│   │   ├── src/
│   │   │   └── index.ts      # 서버 진입점
│   │   ├── docker-compose.yml
│   │   ├── init-db/          # DB 초기화 스크립트
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/             # Next.js 프론트엔드 (포트 3000)
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       ├── package.json
│       └── tsconfig.json
├── package.json              # 루트 (Yarn Workspaces 설정)
└── README.md
```

## 🎨 디자인

- **Figma**: https://www.figma.com/design/vVTTKRVHwWw6S0gMxd8SbM/LOC?node-id=1-26&t=RDgMD6TxLmBVOgaD-1

## 🚀 시작하기

로컬 컴퓨터에서 프로젝트를 설정하고 실행하려면 다음 안내를 따르세요.

### 요구 사항

- [Node.js](https://nodejs.org/en) (v18.x 이상 권장)
- [Yarn](https://yarnpkg.com/getting-started/install)

### 설치

1.  **저장소 복제**

    ```bash
    git clone <repository-url>
    cd location
    ```

2.  **의존성 설치**

    루트에서 한 번만 실행하면 모든 패키지의 의존성이 설치됩니다.

    ```bash
    yarn install
    ```

3.  **환경 변수 설정**

    이 프로젝트는 Google Maps API 키가 있어야 정상적으로 동작합니다.

    - 예제 파일을 복사하여 프로젝트의 루트 경로에 `.env.local` 파일을 생성하세요:
      ```bash
      cp .env.local.example .env.local
      ```
    - 새로 생성된 `.env.local` 파일을 여세요.
    - [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/)에서 API 키를 발급받으세요.
    - `YOUR_API_KEY_HERE` 부분을 발급받은 실제 Google Maps API 키로 교체하세요.

      ```env
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIz... (발급받은 키)
      ```

### 애플리케이션 실행

#### 프론트엔드 (Next.js)

- **개발 모드**

  ```bash
  yarn dev
  ```

  브라우저에서 [http://localhost:3000](http://localhost:3000) 주소로 접속하여 결과를 확인하세요.

#### 백엔드 (Express.js)

- **개발 모드**

  ```bash
  yarn dev:backend
  ```

  서버가 [http://localhost:3001](http://localhost:3001)에서 실행됩니다.
  
  Health check: [http://localhost:3001/health](http://localhost:3001/health)

#### 프로덕션 빌드

- **프론트엔드 빌드**

  ```bash
  yarn build
  ```

- **백엔드 빌드**

  ```bash
  yarn build:backend
  ```

## 📜 사용 가능한 스크립트

`package.json` 파일에서 다음 스크립트들을 사용할 수 있습니다:

| 스크립트 | 설명 |
|---------|------|
| `dev` | 프론트엔드 개발 서버를 시작합니다 (포트 3000) |
| `build` | 프론트엔드 프로덕션 빌드를 생성합니다 |
| `start` | 프론트엔드 프로덕션 서버를 시작합니다 |
| `lint` | Next.js 린터를 실행합니다 |
| `dev:backend` | 백엔드 개발 서버를 시작합니다 (포트 3001) |
| `build:backend` | 백엔드 프로덕션 빌드를 생성합니다 |
| `start:backend` | 백엔드 프로덕션 서버를 시작합니다 |
