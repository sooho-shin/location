# LOCATION 피어 리뷰 로그

## 2026-06-04 21:18 KST - Review 1

### Scope

- 저장소 루트, 워크스페이스 스크립트, 프론트엔드 App Router 진입점, 지도/바텀시트/상세 패널 컴포넌트, 백엔드 Express API, 기준 문서와 배포 문서를 처음부터 점검했다.
- 기준 문서 확인: `docs/PRODUCT_SPEC.md`, `docs/API_CONTRACT.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/ROADMAP.md`.

### Compared With Previous Review Log

- 기존 리뷰 문서가 없어 비교 대상은 없었다.
- 이번 회차에서 `PEER_REVIEW.md`를 새로 만들었다.

### Findings

1. 추천 요청 로그가 사용자 위치 좌표를 그대로 남긴다.
   - Evidence: `docs/PRODUCT_SPEC.md:110`에서 개인 위치 정보를 로그에 과도하게 남기지 말라고 정하고 있지만, `packages/backend/src/server.ts:245`는 `Recommendation request: ... at (${lat}, ${lng})` 형태로 위도/경도를 그대로 출력한다.
   - Current impact: 운영 로그나 호스팅 로그에 사용자의 정확한 위치가 남을 수 있다. 제품 금지 사항과도 충돌한다.
   - Recommended action: 좌표는 제거하거나 coarse geohash/반올림/요청 ID 중심으로 축소하고, 디버그 모드에서만 제한적으로 남긴다.

2. 외부 길찾기 새 창이 `window.opener`를 끊지 않는다.
   - Evidence: `packages/frontend/src/components/PlaceDetailPanel.tsx:144`-`146`에서 `window.open(url, "_blank")`를 호출하지만 `noopener,noreferrer` 옵션을 주지 않는다. 같은 파일의 웹사이트 링크는 `rel="noreferrer"`를 사용한다(`packages/frontend/src/components/PlaceDetailPanel.tsx:271`).
   - Current impact: Google Maps 또는 fallback 링크가 새 탭에서 열릴 때 opener 참조가 유지될 수 있어 보안 관점에서 취약하다.
   - Recommended action: `window.open(url, "_blank", "noopener,noreferrer")`로 열고, 반환된 창이 있으면 `opener = null` 처리까지 방어적으로 추가한다.

3. 프론트엔드 lint 스크립트가 현재 Next.js 버전에서 실패한다.
   - Evidence: `packages/frontend/package.json:9`의 `lint`가 `next lint`인데, `yarn lint` 실행 결과 `Invalid project directory provided, no such directory: .../packages/frontend/lint`로 실패했다. 프론트엔드는 Next.js `16.2.4`를 사용한다(`packages/frontend/package.json:15`).
   - Current impact: 기본 검증 루틴이 빌드 외 정적 품질 문제를 잡지 못한다. CI가 이 명령을 쓰면 실패하고, 쓰지 않으면 lint 공백이 생긴다.
   - Recommended action: Next 16에 맞게 ESLint 설정과 스크립트를 `eslint .` 계열로 전환하거나, 공식 마이그레이션 기준에 맞춰 lint 검증 명령을 재정의한다.

4. 백엔드 test 스크립트가 테스트 부재만으로 실패한다.
   - Evidence: `packages/backend/package.json`의 `test`는 `jest`이고, `yarn workspace backend test --runInBand` 실행 결과 `No tests found, exiting with code 1`로 종료됐다.
   - Current impact: 현재 코드가 깨진 것은 아니지만 CI/CD 문서의 `backend test` 단계(`DEPLOYMENT.md`의 CI 흐름)가 그대로 적용되면 테스트가 없어도 파이프라인이 실패한다.
   - Recommended action: 최소 smoke test를 추가하거나, 테스트 도입 전까지는 `--passWithNoTests`를 명시해 의도한 실패/성공 기준을 정한다.

5. README의 장소 상세 API 응답 예시가 실제 계약과 다르다.
   - Evidence: `README.md:153`-`172`는 `GET /api/places/:placeId` 응답을 `{ places, source }` 형태로 설명한다. 실제 API는 `fetchGooglePlaceDetail` 결과를 그대로 반환한다(`packages/backend/src/server.ts:284`-`285`), 그리고 정식 계약 문서도 Google Places 상세 객체 형태를 명시한다(`docs/API_CONTRACT.md:271`-`299`).
   - Current impact: 새 개발자가 상세 API를 추천 API 응답 형태로 오해할 수 있고, 클라이언트 연동이나 수동 테스트가 잘못 작성될 수 있다.
   - Recommended action: README의 `GET /api/places/:placeId` 예시를 `docs/API_CONTRACT.md`와 같은 상세 객체 예시로 교체한다.

6. 추천 카테고리 요청 시간이 한국 현지 시간이 아니라 UTC 문자열로 전송된다.
   - Evidence: 제품 흐름은 현지 시간 기반 추천을 요구한다(`docs/PRODUCT_SPEC.md:45`-`46`). API 예시도 `+09:00` 오프셋이 있는 값을 사용한다(`docs/API_CONTRACT.md:199`-`205`). 그러나 프론트엔드는 `new Date().toISOString()`을 보낸다(`packages/frontend/src/components/BottomSheet.tsx:64`).
   - Current impact: 백엔드 프롬프트가 시간대 맥락을 UTC 기준으로 해석하면 저녁/야경/실내 코스 같은 추천 우선순위가 실제 한국 시간과 어긋날 수 있다.
   - Recommended action: 브라우저의 timezone offset을 포함한 로컬 ISO 문자열을 보내거나, `timeZone: "Asia/Seoul"` 기준 값을 명시적으로 계산한다.

### Verification

- `pwd`: `/Users/sinsuho/Desktop/mywork/location`.
- `git status --short`: 변경 전 작업 트리는 깨끗했다.
- `rg --files`: 프론트엔드, 백엔드, 문서, 배포 파일 목록을 확인했다.
- `rg -n "TODO|FIXME|any|useEffect|target=\"_blank\"|<img|console\\.|eslint-disable|href=\"#\"|router.push|prefers-reduced-motion|window\\.open|navigator\\.clipboard|alert\\(" packages docs README.md DEPLOYMENT.md`: 로그, 새 창, 클립보드, alert, effect 사용 지점을 점검했다.
- `yarn build:frontend`: 성공. Next.js가 `.babelrc` 제거 가능 경고를 출력했다.
- `yarn build:backend`: 성공.
- `yarn lint`: 실패. `next lint`가 `packages/frontend/lint`를 프로젝트 디렉터리로 해석하며 종료 코드 1을 반환했다.
- `yarn workspace backend test --runInBand`: 실패. 테스트 파일이 없어 Jest가 종료 코드 1을 반환했다.

### Next Review Angle

- 다음 회차에서는 Google Places fallback 경로, 상세 패널 모바일 레이아웃, 클러스터 패널의 작은 화면 위치 보정, API 에러 메시지 노출 범위를 더 깊게 본다.
