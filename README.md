# LOCATION 📍

LOCATION에 오신 것을 환영합니다. 이 서비스는 외국인들이 현재 위치와 관심사를 기반으로 한국의 유명 명소와 숨겨진 장소를 쉽게 찾을 수 있도록 돕는 웹 서비스입니다.

## ✨ 주요 기능

- **위치 기반 검색**: 사용자의 현재 위치를 자동으로 가져와 관련성 높은 결과를 제공합니다.
- **AI 기반 추천**: "케이팝", "고궁", "맛집"과 같은 키워드를 입력하면 AI가 주변 명소 10곳을 추천합니다.
- **인터랙티브 지도**: 추천된 장소를 Google 지도 위에 시각적으로 표시합니다.
- **반응형 디자인**: 데스크톱과 모바일 기기 모두에서 완벽하게 접근하고 사용할 수 있습니다.

## 🛠️ 기술 스택

- **프레임워크**: [Next.js](https://nextjs.org/) (React)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **스타일링**: [Styled-Components](https://styled-components.com/)
- **상태 관리**:
  - **클라이언트 상태**: [Zustand](https://github.com/pmndrs/zustand)
  - **서버 상태**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **지도**: [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api)
- **HTTP 클라이언트**: [Axios](https://axios-http.com/)
- **패키지 매니저**: [Yarn](https://yarnpkg.com/)

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

- **개발 모드**

  다음 명령어를 실행하여 개발 서버를 시작하세요:
  ```bash
  yarn dev
  ```
  브라우저에서 [http://localhost:3000](http://localhost:3000) 주소로 접속하여 결과를 확인하세요.

- **프로덕션 빌드**

  프로덕션용으로 최적화된 빌드를 생성하려면 다음 명령어를 실행하세요:
  ```bash
  yarn build
  ```

- **프로덕션 서버 시작**

  프로덕션 빌드를 실행하려면 다음 명령어를 사용하세요:
  ```bash
  yarn start
  ```

## 📜 사용 가능한 스크립트

`package.json` 파일에서 다음 스크립트들을 사용할 수 있습니다:

- `dev`: 개발 모드로 애플리케이션을 시작합니다.
- `build`: 최적화된 프로덕션 빌드를 생성합니다.
- `start`: 프로덕션 서버를 시작합니다.
- `lint`: Next.js 린터를 실행하여 코드 품질과 오류를 검사합니다.# location
