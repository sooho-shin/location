# Location Project 스킬

## 이 스킬의 정체

`location-project`는 이 LOCATION 모노레포 전용 Codex 스킬이다.

이 스킬은 아래 경로에 있기 때문에 Codex가 이 저장소 안에서 작업할 때만 발견한다.

```text
.agents/skills/location-project
```

Codex CLI에서는 다음처럼 명시적으로 호출할 수 있다.

```text
$location-project
```

이 프로젝트 안에서 `$`를 입력하면 스킬 자동완성 후보로도 표시된다.

## 다루는 범위

- Yarn workspaces 모노레포 구조.
- `packages/frontend`의 프론트엔드 작업.
- `packages/backend`의 백엔드 작업.
- Next.js, React, TypeScript, styled-components, Leaflet, react-leaflet 사용 방식.
- Express 백엔드 API 동작.
- Gemini API와 선택적 Google Places API 동작.
- 로컬 개발, 빌드, lint, 배포 명령어.
- 필수 및 선택 환경 변수.
- Markdown 문서와 커밋 메시지를 한국어로 작성하는 프로젝트 규칙.

## Codex가 이 스킬을 써야 하는 경우

다음 항목을 다루는 작업에는 이 스킬을 사용한다.

- `packages/frontend`
- `packages/backend`
- `README.md`
- `DEPLOYMENT.md`
- 루트 또는 패키지별 `package.json` 파일
- CI, 배포, 환경 변수, API, 지도, 추천 동작

## 파일 구성

- `SKILL.md`: 스킬을 사용할 때 Codex가 읽는 실제 지침.
- `agents/openai.yaml`: Codex UI 표시에 쓰이는 메타데이터.
- `references/project.md`: 명령어, API 계약, 런타임 설정, 배포 메모를 담은 짧은 프로젝트 참조 문서.
- `references/skill.md`: 스킬 자체를 설명하는 사람이 읽기 위한 문서.

## 메모

이 스킬은 의도적으로 프로젝트 범위에만 적용된다. 이 저장소 밖에서도 적용해야 하는 경우가 아니라면 전역 Codex 스킬 디렉터리로 옮기지 않는다.
