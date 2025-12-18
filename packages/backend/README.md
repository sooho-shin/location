# 📍 Location-Backend: AI 기반 장소 추천 서비스

## 📝 프로젝트 개요

**Location-Backend**는 사용자 맞춤형 장소 추천을 제공하는 AI 기반 백엔드 서비스입니다. 이 프로젝트는 클린 아키텍처(Clean Architecture) 원칙에 따라 설계되어 높은 확장성과 유지보수성을 목표로 합니다.

사용자의 현재 위치와 자연어 쿼리를 기반으로, PostGIS의 지리 공간 쿼리와 pgvector를 활용한 벡터 유사도 검색, 그리고 LangChain과 OpenAI의 대규모 언어 모델(LLM)을 결합하여 최적의 장소를 추천합니다.

---

## ✨ 주요 기능

- **사용자 인증**: `bcryptjs`를 사용한 암호화 및 JWT(Access/Refresh Token) 기반의 안전한 사용자 인증 및 인가 시스템을 제공합니다.
- **위치 기반 검색**: PostGIS의 `ST_DWithin` 함수를 활용하여 특정 지점 반경 내의 장소를 효율적으로 검색합니다.
- **AI 장소 추천 (RAG)**:
    1.  **임베딩 생성**: 사용자의 자연어 쿼리(예: "강남역 근처 조용한 카페")를 OpenAI의 `text-embedding-3-small` 모델을 통해 벡터로 변환합니다.
    2.  **유사도 검색**: `pgvector`를 사용하여 데이터베이스에 저장된 장소 임베딩과 코사인 유사도(Cosine Similarity)를 비교하여 가장 관련성 높은 장소를 검색합니다.
    3.  **LLM 답변 생성**: 검색된 장소 정보를 컨텍스트로 활용하여, `gpt-4o`와 같은 LLM이 사용자에게 자연스러운 언어로 추천 이유를 설명하고 순위를 재조정합니다.
- **API 문서 자동화**: `swagger-ui-express`를 통해 API 문서를 자동으로 생성하고, 개발자가 쉽게 API를 테스트할 수 있는 환경을 제공합니다.

---

## 🏗️ 시스템 아키텍처

본 프로젝트는 클린 아키텍처를 기반으로 각 계층의 역할을 명확히 분리하여 코드의 결합도를 낮추고 테스트 용이성을 높였습니다.

```plaintext
location-backend/
├── prisma/               # Prisma 스키마 및 마이그레이션
├── src/
│   ├── app.ts            # Express 애플리케이션 설정
│   ├── server.ts         # 서버 초기화
│   ├── config/           # 환경변수, Swagger 등 설정
│   ├── core/             # 도메인 모델 및 리포지토리 인터페이스
│   ├── modules/          # 각 기능 모듈 (Auth, Users, Places, AI)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── places/
│   │   └── ai/
│   ├── common/           # 공통 미들웨어 및 유틸리티
│   └── types/            # 타입 정의
├── tests/                # 테스트 코드
└── ...                   # .env, package.json 등
```

- **`modules`**: 기능별로 독립된 모듈(Auth, Users, Places, AI)로 구성됩니다.
    - **`controller.ts`**: HTTP 요청/응답 처리 및 DTO 유효성 검사.
    - **`service.ts`**: 핵심 비즈니스 로직 수행.
    - **`repository.ts`**: 데이터베이스 접근 로직(Prisma).
    - **`dto.ts`**: 데이터 전송 객체(Data Transfer Objects).

---

## 🛠️ 기술 스택

- **언어**: TypeScript
- **프레임워크**: Node.js, Express.js
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **DB 확장**:
    - `PostGIS`: 지리 공간 데이터 처리
    - `pgvector`: 벡터 유사도 검색
- **AI & LLM**:
    - `LangChain`: LLM 파이프라인 오케스트레이션
    - `OpenAI`: 임베딩 생성 및 LLM 추론
- **인증**: JWT, bcryptjs
- **API 문서**: Swagger (swagger-ui-express)
- **기타**:
    - `class-validator`, `class-transformer`: DTO 유효성 검사
    - `Winston`: 로깅
    - `Redis`: 캐싱 (선택 사항)

---

## 🚀 설치 및 실행

### 1. 사전 준비

- Node.js (v18 이상)
- Yarn
- Docker (데이터베이스 구동용)

### 2. 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/your-username/location-backend.git
cd location-backend
yarn install
```

### 3. 데이터베이스 설정 (영속성 보장)

PostgreSQL 데이터베이스의 데이터가 컴퓨터를 재시작하거나 Docker 컨테이너가 종료되어도 유지되도록 Docker 볼륨을 사용합니다.

#### 방법 A: Docker Compose 사용 (권장 ⭐)

`docker-compose.yml`과 초기화 스크립트가 이미 준비되어 있어, 한 줄 명령으로 모든 설정이 완료됩니다.

```bash
# 백엔드 디렉토리로 이동
cd packages/backend

# Docker Compose로 데이터베이스 실행 (PostGIS, pgvector 자동 설치)
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f db
```

> 💡 **참고**: 최초 실행 시 `init-db/01-extensions.sql` 스크립트가 자동으로 실행되어 PostGIS와 pgvector 확장이 설치됩니다.

#### 방법 B: 수동 설정

Docker Compose를 사용하지 않는 경우, 아래 단계를 수동으로 진행합니다.

1.  **Docker 컨테이너 실행**:
    `pgvector/pgvector:pg15` 이미지를 사용하여 데이터베이스 컨테이너를 생성합니다. `-v` 옵션을 통해 `location-db-data`라는 볼륨을 컨테이너의 데이터 폴더에 연결하여 데이터 영속성을 보장합니다.

    ```bash
    docker run -d \
      --name location-db \
      -p 5432:5432 \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=1234 \
      -e POSTGRES_DB=location_db \
      -v location-db-data:/var/lib/postgresql/data \
      pgvector/pgvector:pg15
    ```

2.  **PostGIS 설치**:
    생성된 컨테이너 내부에 접속하여 PostGIS를 설치합니다.

    ```bash
    # 패키지 목록 업데이트
    docker exec -u root location-db apt-get update

    # PostGIS 설치
    docker exec -u root location-db apt-get install -y postgresql-15-postgis-3
    ```

3.  **데이터베이스 확장 활성화**:
    `psql`을 통해 데이터베이스에 접속하여 `postgis`와 `vector` 확장을 활성화합니다.

    ```bash
    # PostGIS 확장 생성
    docker exec location-db psql -U postgres -d location_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"

    # Vector 확장 생성
    docker exec location-db psql -U postgres -d location_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
    ```

### 4. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 각 변수를 자신의 환경에 맞게 수정합니다.

```bash
cp .env.example .env
```

```env
# .env

# Application
NODE_ENV=development
PORT=3000

# Database (Docker로 설정한 값과 일치시켜야 함)
DATABASE_URL="postgresql://postgres:1234@localhost:5432/location_db?schema=public"

# Authentication
JWT_SECRET="your-super-secret-key"
JWT_ACCESS_TOKEN_EXPIRATION="15m"
JWT_REFRESH_TOKEN_EXPIRATION="7d"

# External APIs
GOOGLE_MAPS_API_KEY="your-google-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Caching (Optional)
REDIS_URL="redis://localhost:6379"
```

### 5. Prisma 설정

Prisma 스키마를 데이터베이스에 적용하고 클라이언트를 생성합니다.

```bash
# 데이터베이스 마이그레이션
npx prisma migrate dev --name init

# Prisma 클라이언트 생성
npx prisma generate
```

### 6. 애플리케이션 실행

```bash
# 개발 모드로 실행
yarn dev

# 또는 TypeScript 컴파일 후 실행
yarn build
yarn start
```

서버가 정상적으로 실행되면 `http://localhost:3000`에서 접속할 수 있습니다. API 문서는 `http://localhost:3000/docs`에서 확인할 수 있습니다.

---

## 🔌 API 엔드포인트

### 인증 (Auth)

- `POST /auth/signup`: 회원가입
- `POST /auth/login`: 로그인

### 장소 (Places)

- `GET /places/nearby`: 특정 좌표 반경 내 장소 검색 (Query: `lat`, `lon`, `radius`)
- `GET /places/:id`: 특정 장소 상세 정보 조회

### AI 추천

- `POST /ai/recommend`: AI 기반 장소 추천 요청
  - **Body**: `{ "query": "자연어 쿼리", "lat": 위도, "lon": 경도 }`