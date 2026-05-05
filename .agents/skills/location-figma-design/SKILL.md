---
name: location-figma-design
description: "LOCATION 프로젝트의 Figma 디자인을 기획에서 캔버스로 만들 때 사용한다. 일본인 타겟, 화이트 베이스와 딥 코랄 포인트 컬러, 지도 기반 장소 추천 앱 UI, Figma MCP, 아토믹 디자인 구조, 모바일 우선 화면 설계, 컴포넌트/variants/page 구성 작업에 사용한다."
---

# LOCATION Figma Design

## 목적

이 스킬은 LOCATION 프로젝트의 기획을 Figma 디자인 시스템과 실제 앱 화면으로 전환할 때 사용한다.

핵심 방향:

- 타겟은 일본인 사용자를 우선한다.
- 화면은 랜딩 페이지가 아니라 지도 기반 장소 추천 앱의 실제 사용 화면으로 만든다.
- 전체 톤은 깨끗한 화이트 베이스, 정돈된 지도 서비스, 약간의 K-컬처 감성으로 잡는다.
- 포인트 컬러는 딥 코랄 레드 `#E94B5F`를 기본으로 사용한다.
- Figma 제작은 아토믹 디자인 순서로 진행한다.
- 좌표 기반 절대 배치보다 Auto Layout, 부모-자식 관계, padding, gap, fill/hug 규칙을 우선한다.

## Figma MCP 사용 원칙

- Figma에 직접 그릴 수 있으면 Figma MCP 도구를 사용한다.
- 새 파일이 필요하면 Figma 파일을 먼저 만들거나, 사용자가 제공한 Figma URL의 file key를 사용한다.
- 기본 Figma 프로젝트/파일 정보가 필요하면 `references/figma_file.md`를 읽는다.
- 캔버스 쓰기 작업에는 `figma-use` 계열 지침을 우선 따른다.
- 디자인을 만들기 전에 사용자가 제공한 기획, 현재 코드 구조, 앱의 핵심 플로우를 짧게 정리한다.
- 기존 Figma 라이브러리나 디자인 시스템이 연결되어 있으면 검색 후 재사용한다.

## 제작 순서

1. 제품 구조를 정리한다.
   - 현재 위치 기반 카테고리 선택
   - AI 장소 추천
   - 지도 마커 표시
   - 장소 상세 패널
   - Google Maps 길찾기/정보 확인

2. Figma 페이지를 만든다.
   - `00. Cover`
   - `01. Foundations`
   - `02. Atoms`
   - `03. Molecules`
   - `04. Organisms`
   - `05. Templates`
   - `06. Pages`
   - `07. Prototype / Flow`

3. Foundations를 먼저 만든다.
   - Color
   - Typography
   - Spacing
   - Radius
   - Shadow
   - Icon size
   - Grid
   - Map overlay rules

4. Atoms, Molecules, Organisms 순서로 컴포넌트를 만든다.

5. Templates에서 화면 골격을 만든다.

6. Pages에서 실제 상태별 화면을 완성한다.

7. Prototype 연결을 추가한다.
   - 카테고리 선택
   - Loading
   - Results
   - Place Detail

## 기본 화면 범위

모바일 우선으로 시작한다.

- 기준 프레임: `iPhone 15 Pro / 393 x 852`
- 필요 시 데스크톱 확장: `1440 x 900`

처음 만들 Pages:

- `Home / Empty`
- `Home / Category Selected`
- `Home / Loading`
- `Home / Results`
- `Home / Cluster Open`
- `Place / Detail`
- `Place / Detail With Reviews`
- `Permission / Location Denied`
- `Language / Dropdown Open`

## 디자인 원칙

- 지도는 풀스크린으로 둔다.
- UI는 지도 위에 얹히는 조작 레이어로 만든다.
- 바텀시트는 탐색 중심으로 만든다.
- 장소 상세 패널은 정보 밀도와 가독성을 우선한다.
- 장소 상세 히어로, 카테고리 카드, 추천 장소 썸네일은 최종 화면에서 단색 placeholder로 남기지 않는다.
- 실제 이미지가 없으면 사용자의 동의를 받거나 사용 가능한 이미지 생성 도구로 LOCATION 톤에 맞는 bitmap 이미지를 만들어 Figma asset으로 사용한다.
- 이미지 생성 프롬프트는 일본인 타겟, 서울 로컬 탐색, K-pop/한강/음식/여행 맥락을 반영한다.
- 지도 위 floating UI는 배경 마커, 지도 패턴, 패널 내부 요소가 시각적으로 충돌하지 않게 z-index 성격의 우선순위를 명확히 둔다.
- 카드는 과하게 장식하지 않는다.
- 포인트 컬러는 하나만 강하게 사용한다.
- 카테고리별 색상 남용을 피하고 이미지, 라벨, 아이콘으로 구분한다.
- 버튼, 뱃지, 마커, 정보 행은 컴포넌트로 만들고 화면마다 새로 그리지 않는다.
- 클러스터 선택 패널에는 일반 `InfoRow`를 억지로 재사용하지 않는다. `Molecule/ClusterPlaceRow` 전용 구조를 사용한다.

## 레이아웃 원칙

- Figma 요소를 `x`, `y` 좌표에 하나씩 찍어 배치하는 방식을 피한다.
- 기본 레이아웃은 Auto Layout으로 만든다.
- 간격은 좌표가 아니라 부모의 `padding`과 자식 간 `gap`으로 정의한다.
- 너비와 높이는 가능한 `fill container`, `hug contents`, 명확한 min/max 규칙으로 정의한다.
- 컴포넌트는 실제 프론트엔드의 부모-자식 구조와 비슷하게 중첩한다.
- absolute/floating 배치는 지도 마커, 닫기 버튼, 로딩 오버레이, 지도 위 floating control처럼 실제로 겹침이 필요한 경우에만 사용한다.
- 어쩔 수 없이 좌표 배치를 쓰는 경우에도 그 이유와 소속 레이어를 명확히 둔다.
- 화면 전체 영역 컴포넌트는 고정 좌표 폭이 아니라 부모 기준 `fill container` 또는 100% 역할로 만든다.
- Header, BottomSheet, Overlay, MapCanvas는 기본적으로 화면 너비를 전부 채운다.
- 작은 컨트롤인 IconButton, Marker, Handle은 fixed width/height를 사용한다.
- Panel, List, ButtonGroup, TextStack은 부모 폭 안에서 `fill container`와 `hug contents`를 조합한다.

## 화면 Shell 구조

모바일 page는 다음 layer 구조를 기본으로 한다.

```text
Screen / Mobile
- width: 393
- height: 852
- clips content: true

Layer 0: MapCanvas
- width: fill screen
- height: fill screen

Layer 1: MapMarkers
- markers only
- allowed coordinate placement

Layer 2: Header / Controls
- width: fill screen
- top aligned

Layer 3: BottomSheet / FloatingPanel
- width: fill screen for bottom sheet
- floating panel only when needed

Layer 4: Modal / LoadingOverlay
- width: fill screen
- height: fill screen
- centered content
```

## 컴포넌트 계약

Header:

```text
- width: fill container
- height: 56 to 64 fixed
- Auto Layout: horizontal
- padding: 12 16
- primaryAxisAlignItems: space-between
- left: Brand
- right: LanguageSelector
- no loose absolute children
```

BottomSheet:

```text
- width: fill container
- bottom aligned
- Auto Layout: vertical
- padding: 10 16 28
- gap: 16
- top radius only
- contains HandleArea, HeaderRow, CategoryList
```

BottomSheet Handle:

```text
- HandleArea width: fill container
- HandleArea Auto Layout: horizontal
- HandleArea primaryAxisAlignItems: center
- Handle fixed size: 44 x 4
- handle must never be placed directly by loose x/y coordinates
```

CenteredOverlay:

```text
- full-screen parent frame
- dim background fills entire screen evenly
- card is centered by parent alignment
- card is not positioned by arbitrary x/y unless Figma API requires a controlled fallback
```

IconButton:

```text
- fixed square size, usually 28 to 40
- icon centered in parent
- no concatenated text such as title + ×
- use icon button frame, not loose text
```

FloatingPanel:

```text
- clear surface fill
- radius 16 to 18
- shadow strong enough to separate from map
- internal content uses padding/gap
- must not visually merge with map markers
```

## 이미지 에셋 원칙

- 단색 컬러 블록은 wireframe 또는 skeleton 상태에서만 허용한다.
- 최종 pages와 organisms에는 실제 장소/카테고리 맥락이 느껴지는 bitmap 이미지를 사용한다.
- 외부 이미지가 없고 사용자가 이미지 생성을 허용하면 GPT Image 계열 이미지 생성 도구로 필요한 에셋을 만든다.
- 생성 이미지는 Figma에 업로드해 image fill로 사용한다.
- 이미지 위 텍스트가 올라가는 경우 contrast overlay를 사용하되, 이미지 자체가 검게 뭉개지지 않게 한다.
- 히어로 이미지는 장소 분위기를 보여줘야 하며, 단색 분홍/주황 배경만으로 대체하지 않는다.
- 카테고리 이미지는 K-pop, 한강라면, 서울 로컬 탐색의 실제 맥락을 암시해야 한다.

## 생성 후 QA

- Figma에 전체 구조를 생성한 뒤 반드시 화면별로 시각 QA를 한다.
- `06. Pages`뿐 아니라 `05. Templates`도 같은 기준으로 QA한다. Templates의 모바일 shell이 Auto Layout 부모 안에서 header, bottom sheet, overlay 폭이 줄어들면 실패로 본다.
- 특히 `Home / Cluster Open`, `Place / Detail`, `Language / Dropdown Open`, `Loading`처럼 overlay/floating 요소가 있는 화면을 우선 확인한다.
- `Template/Mobile/MapWithBottomSheet`, `Template/Mobile/MapWithResults`, `Template/Mobile/Loading`은 각각 `393 x 852` 화면 안에서 Header, MapCanvas, BottomSheet, Overlay가 Pages와 동일한 full-width 계약을 지켜야 한다.
- 텍스트, 아이콘, 닫기 버튼, 마커가 패널 경계 밖으로 삐져나오거나 서로 겹치면 실패로 본다.
- 패널 헤더 안의 닫기 버튼은 제목과 붙은 텍스트가 아니라 독립된 icon button으로 보여야 한다.
- 지도 마커가 floating panel 내부 요소처럼 보이면 패널 위치, surface, shadow, 배경 처리 중 하나를 조정한다.
- 생성 결과가 구조 초안 수준이면 바로 완료로 보지 말고, 깨진 organism을 재설계한 뒤 pages에 다시 반영한다.
- Templates가 깨졌을 때는 정상 QA를 통과한 Page 화면을 기준으로 복제하거나 shared organism sizing을 고친 뒤 Templates와 Pages를 함께 다시 검사한다.

## 참조

자세한 아토믹 구성, 컴포넌트 목록, 네이밍 규칙, variants 계획은 `references/figma_atomic_design.md`를 읽는다.
