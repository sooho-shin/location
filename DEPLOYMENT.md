# 🚀 CI/CD 및 배포 가이드

## 📋 목차
- [GitHub Secrets 설정](#github-secrets-설정)
- [Vercel 연동](#vercel-연동)
- [백엔드 배포 옵션](#백엔드-배포-옵션)
- [환경변수 설명](#환경변수-설명)

---

## 🔐 GitHub Secrets 설정

GitHub Repository → Settings → Secrets and variables → Actions에서 다음 시크릿을 추가하세요:

### 필수 Secrets

| Secret Name | 설명 | 얻는 방법 |
|-------------|-----|----------|
| `VERCEL_TOKEN` | Vercel 인증 토큰 | [Vercel Settings > Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel 조직 ID | `.vercel/project.json` 또는 Vercel 대시보드 |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | `.vercel/project.json` 또는 Vercel 대시보드 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API 키 | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | 예: `https://your-backend.railway.app` |

### 선택 Secrets (백엔드 배포용)

| Secret Name | 설명 | 필요 서비스 |
|-------------|-----|------------|
| `RAILWAY_TOKEN` | Railway 배포 토큰 | Railway 사용시 |
| `RENDER_DEPLOY_HOOK` | Render 배포 웹훅 URL | Render 사용시 |
| `GEMINI_API_KEY` | Gemini AI API 키 | 백엔드 AI 기능 |

---

## 🔗 Vercel 연동

### 1. Vercel CLI로 프로젝트 설정

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 연결 (frontend 디렉토리에서)
cd packages/frontend
vercel link
```

### 2. 환경변수 설정

```bash
# 환경변수 추가
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
vercel env add NEXT_PUBLIC_API_URL
```

### 3. 수동 배포 테스트

```bash
# Preview 배포
vercel

# Production 배포
vercel --prod
```

### 4. Git 연동 (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard)에서 프로젝트 생성
2. GitHub 저장소 연결
3. Root Directory: `packages/frontend` 설정
4. 환경변수 설정

---

## 🖥️ 백엔드 배포 옵션

### Option 1: Railway (권장 - 쉬움) 🚂

1. [Railway](https://railway.app)에 GitHub 연결
2. `packages/backend` 폴더 선택
3. 환경변수 설정:
   - `GEMINI_API_KEY`
   - `PORT=3001`
4. 배포 URL을 `NEXT_PUBLIC_API_URL`에 설정

### Option 2: Render 🎨

1. [Render](https://render.com)에서 Web Service 생성
2. GitHub 연결 및 `packages/backend` 선택
3. Build Command: `yarn install && yarn build`
4. Start Command: `yarn start`
5. 환경변수 설정

### Option 3: Fly.io 🪁

```bash
# Fly CLI 설치
curl -L https://fly.io/install.sh | sh

# 앱 생성 및 배포
cd packages/backend
fly launch
fly deploy
```

### Option 4: Docker (자체 서버) 🐳

```bash
# 이미지 빌드
cd packages/backend
docker build -t location-backend .

# 실행
docker run -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  location-backend
```

---

## 📝 환경변수 설명

### Frontend (.env.local)

```env
# Google Maps API (필수)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# 백엔드 API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)

```env
# Gemini AI API (필수)
GEMINI_API_KEY=your_gemini_api_key

# 서버 설정
PORT=3001
NODE_ENV=production

# 데이터베이스 (선택)
DATABASE_URL=postgresql://...

# Redis (선택)
REDIS_URL=redis://...
```

---

## ✅ 배포 체크리스트

- [ ] GitHub Secrets 설정 완료
- [ ] Vercel 프로젝트 연결
- [ ] 환경변수 모두 설정
- [ ] 백엔드 배포 플랫폼 선택 및 설정
- [ ] CORS 설정 (백엔드에서 프론트엔드 도메인 허용)
- [ ] API URL 연결 테스트
- [ ] Production 배포 테스트

---

## 🔄 CI/CD 워크플로

### CI (Pull Request)
```
push/PR → Lint → Type Check → Build Frontend → Build Backend → Test
```

### CD (Main Branch)
```
push main → Build → Deploy Frontend (Vercel) → Deploy Backend (선택)
```

### 수동 배포
GitHub Actions → Deploy 워크플로 → Run workflow

---

## 🆘 문제 해결

### Vercel 빌드 실패
- Root Directory 설정 확인 (`packages/frontend`)
- 환경변수 설정 확인
- `yarn.lock` 파일 존재 확인

### 백엔드 연결 실패
- CORS 설정 확인
- API URL 환경변수 확인
- 백엔드 로그 확인

### Google Maps 로딩 실패
- API 키 제한 설정 확인
- 배포 도메인 허용 확인
