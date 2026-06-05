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

## 2026-06-05 18:05 KST - Review 2

### Scope

- 현재 `main` 기준 전체 파일 목록, git 상태, 제품/API/개발/로드맵 문서, 프론트엔드 entrypoint, 지도/바텀시트/상세/클러스터/언어 모듈, 백엔드 API 서버와 검증 스크립트를 다시 점검했다.
- 이번 회차에서는 최근 다국어 전환 변경 이후의 지도 재초기화, 검증 명령 안정성, 기존 Review 1 지적의 해소 여부를 중점 확인했다.

### Compared With Previous Review Log

- 해소됨: Review 1의 사용자 좌표 로그는 현재 `Recommendation request: ${normalizedCategory}`만 남겨 정확 좌표를 출력하지 않는다.
- 해소됨: Review 1의 `window.open` 보안 속성은 현재 `noopener,noreferrer`와 `opener = null` 처리가 적용되어 있다.
- 해소됨: Review 1의 백엔드 테스트 부재는 `packages/backend/src/server.test.ts` 추가로 `yarn workspace backend test --runInBand`가 통과한다.
- 해소됨: Review 1의 README 상세 API 응답 예시 불일치는 현재 API 계약과 같은 Google Places 상세 객체 형태로 정리되어 있다.
- 해소됨: Review 1의 추천 카테고리 UTC 전송은 `getKoreaLocalIsoString()`의 `+09:00` 값으로 바뀌었다.
- 변경됨: Review 1의 프론트 lint 문제는 `next lint` 자체는 제거됐지만, clean 상태에서 `tsc --noEmit`이 `.next/types` 부재에 의존하는 새 문제가 남아 있다.

### Findings

1. 언어 변경으로 Google Maps를 다시 만들 때 기존 마커 ref가 새 지도에 재부착되지 않을 수 있다.
   - Evidence: `packages/frontend/src/components/MapComponent.tsx:248`-`257`에서 언어 변경 시 `mapRef.current = null` 후 새 `maps.Map`을 만든다. 그러나 현재 위치 마커 effect는 `center`, `mapReady`에만 의존한다(`packages/frontend/src/components/MapComponent.tsx:280`-`300`), 장소 마커 effect도 `clusters`, `mapReady`, `markerColor`, `selectedPlace`에만 의존한다(`packages/frontend/src/components/MapComponent.tsx:313`-`375`). 새 map 인스턴스 생성 후 `mapReady`가 이미 `true`이면 값 변화가 없어 두 effect가 다시 실행되지 않을 수 있다.
   - Current impact: 사용자가 언어 드롭다운을 바꾼 뒤 지도 스크립트/지도 인스턴스는 바뀌어도 현재 위치 마커와 추천 장소 마커가 기존 지도 인스턴스에 남거나 사라진 상태가 될 수 있다. 다국어 전환 후 지도 탐색 흐름이 깨질 위험이 있다.
   - Recommended action: 지도 인스턴스 생성 세대값(`mapInstanceVersion`)을 상태로 두고 current-location/places marker effect dependency에 포함하거나, 지도 재생성 직전에 `markersRef`, `currentLocationMarkerRef`, `appliedLocationRef`, `selectedPlace`, `clusterSelection`을 명시적으로 초기화한다.

2. 프론트엔드 lint가 clean 환경에서 build 선행 여부에 의존한다.
   - Evidence: `packages/frontend/tsconfig.json:26`-`32`가 `.next/types/**/*.ts`와 `.next/dev/types/**/*.ts`를 직접 include한다. 이번 회차에서 `yarn lint`를 먼저 실행했을 때 `.next/types/cache-life.d.ts`, `.next/types/routes.d.ts`, `.next/types/validator.ts`를 찾지 못해 실패했다. 이후 `yarn build:frontend`가 `.next/types`를 생성한 뒤 다시 `yarn lint`를 실행하면 통과했다.
   - Current impact: 새 클론, CI 캐시 초기화, `.next` 삭제 후에는 `yarn lint` 단독 실행이 실패한다. 검증 순서가 `lint -> build`인 파이프라인에서 불필요한 실패가 발생한다.
   - Recommended action: lint 스크립트를 `next build` 산출물에 의존하지 않는 타입체크로 조정하거나, Next가 생성하는 타입을 `next typegen && tsc --noEmit`처럼 명시적으로 선행 생성하는 스크립트로 바꾼다.

3. 백엔드 lint 스크립트가 ESLint 설정 부재로 실패한다.
   - Evidence: `packages/backend/package.json:10`은 `tsc --noEmit && eslint . --ext .ts`를 실행한다. 저장소에는 `packages/backend/.eslintrc*` 또는 `packages/backend/eslint.config.*`가 없고, `yarn workspace backend lint` 실행 결과 ESLint가 configuration file을 찾지 못해 종료 코드 2를 반환했다.
   - Current impact: 백엔드 변경 시 개발 가이드의 검증 루틴을 확장하려 해도 lint가 항상 실패한다. CI에 백엔드 lint를 추가하면 실제 코드 품질과 무관하게 파이프라인이 깨진다.
   - Recommended action: 백엔드 ESLint 설정을 추가하거나, 현재 단계에서 lint 목적이 타입체크라면 스크립트를 `tsc --noEmit`으로 축소한다.

### Verification

- `pwd`: `/Users/sinsuho/Desktop/mywork/location`.
- `git status --short`: 리뷰 문서 수정 전 작업 트리는 깨끗했다.
- `rg --files`: 프론트엔드, 백엔드, 문서, 배포, 리뷰 문서 목록을 확인했다.
- `rg -n "TODO|FIXME|any|useEffect|target=\"_blank\"|<img|console\\.|eslint-disable|href=\"#\"|router.push|prefers-reduced-motion|window\\.open|navigator\\.clipboard|alert\\(|localStorage|new Date\\(|Date\\.now|Math\\.random|dangerouslySetInnerHTML" packages docs README.md DEPLOYMENT.md`: 다국어 변경 후 effect, 새 창, clipboard, alert, 시간값, 로그 사용 지점을 점검했다.
- `yarn lint`: 최초 실행 실패. `.next/types/*` 파일 부재 때문에 TypeScript가 종료 코드 2를 반환했다.
- `yarn build:frontend`: 성공.
- `yarn build:backend`: 성공.
- `yarn workspace backend test --runInBand`: 성공. 2 tests passed.
- `yarn workspace backend lint`: 실패. ESLint 설정 파일이 없어 종료 코드 2를 반환했다.
- `yarn lint`: `yarn build:frontend` 이후 재실행 시 성공.

### Next Review Angle

- 다음 회차에서는 언어 변경 후 지도/마커 재생성 경로가 실제 브라우저에서 어떻게 보이는지, 그리고 Gemini/Google Places 다국어 응답이 사용자에게 섞여 보이지 않는지 집중 점검한다.

## 2026-06-05 18:16 KST - Review 3

### Scope

- 3회차 시작 시 현재 변경 파일은 `PEER_REVIEW.md`뿐임을 확인했다.
- 소스가 2회차 이후 바뀌지 않았으므로 프론트/백엔드 핵심 구조와 검증 명령의 유지 여부를 다시 확인했다.

### Compared With Previous Review Log

- 유지됨: Review 2의 지도 언어 변경 후 마커 재부착 리스크는 관련 코드가 바뀌지 않아 그대로 유효하다.
- 유지됨: Review 2의 백엔드 lint 실패는 `yarn workspace backend lint`에서 동일하게 재현됐다.
- 변경 없음: Review 2 이후 소스 파일 변경은 없었고, `git diff --name-only`는 `PEER_REVIEW.md`만 표시했다.
- 환경 의존 유지: Review 2의 프론트 clean lint 이슈는 이번 회차에서는 `.next/types`가 이미 생성된 상태라 `yarn lint`가 통과했다. 다만 `tsconfig.json`의 `.next/types` 직접 include 구조는 바뀌지 않아 clean 환경 리스크는 이전 기록대로 남는다.

### Findings

1. 언어 변경 후 지도 마커 재부착 리스크가 여전히 남아 있다.
   - Evidence: Review 2와 동일하게 `packages/frontend/src/components/MapComponent.tsx:248`-`257`은 새 map 인스턴스를 만들지만, 현재 위치 마커 effect는 `center`, `mapReady`만 본다(`packages/frontend/src/components/MapComponent.tsx:280`-`300`). 장소 마커 effect도 새 map 인스턴스 자체를 dependency로 보지 않는다(`packages/frontend/src/components/MapComponent.tsx:313`-`375`).
   - Current impact: 언어 전환 후 지도는 새로 만들어졌는데 마커들이 새 지도에 다시 붙지 않는 상태가 생길 수 있다.
   - Recommended action: 지도 인스턴스 세대값을 상태로 관리하고 marker effect dependency에 포함하거나, map 재생성 시 marker 관련 ref를 초기화한다.

2. 백엔드 lint 스크립트가 여전히 ESLint 설정 부재로 실패한다.
   - Evidence: `packages/backend/package.json:10`의 `lint`는 `tsc --noEmit && eslint . --ext .ts`다. `yarn workspace backend lint`는 이번 회차에도 ESLint configuration file을 찾지 못해 종료 코드 2로 실패했다.
   - Current impact: 백엔드 lint를 개발/CI 검증 루틴에 넣을 수 없다.
   - Recommended action: 백엔드 ESLint 설정을 추가하거나, 의도한 검증이 타입체크라면 스크립트를 `tsc --noEmit`으로 정리한다.

### Verification

- `git status --short`: `PEER_REVIEW.md`만 수정 상태.
- `rg --files`: 파일 목록 재확인.
- `git diff --name-only`: `PEER_REVIEW.md`만 표시.
- `yarn lint`: 성공. 단, `.next/types`가 이미 생성된 상태에서의 성공이다.
- `yarn build:frontend`: 성공.
- `yarn build:backend`: 성공.
- `yarn workspace backend test --runInBand`: 성공. 2 tests passed.
- `yarn workspace backend lint`: 실패. ESLint 설정 파일 부재로 종료 코드 2.

### Next Review Angle

- 다음 회차에서는 실제 브라우저 실행 없이도 검증 가능한 수준에서 지도 인스턴스 재생성 후 marker effect dependency를 더 엄밀히 추적하고, `.next/types` 의존 lint 문제를 clean 환경 기준으로 재현 가능하게 문서화할 방법을 확인한다.
