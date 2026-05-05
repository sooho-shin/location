---
name: figma-design-qa-loop
description: "Figma 디자인을 생성하거나 수정한 뒤 전체 페이지를 반복 QA하고, 깨진 레이아웃/겹침/누락/잘못된 계층을 수정 또는 재생성한 뒤 다시 검사하는 루프가 필요할 때 사용한다. Figma MCP로 만든 디자인의 품질 검증, 재생성, 최종 완료 조건 확인에 사용한다."
---

# Figma Design QA Loop

## 목적

Figma 생성 작업은 한 번의 생성으로 완료하지 않는다. 생성 후 전체 페이지를 검사하고, 문제가 있으면 수정 또는 재생성한 뒤 다시 검사한다.

## 기본 루프

```text
1. Generate
2. Inspect all pages
3. Identify broken layout, overlap, missing frames, wrong hierarchy
4. Fix or regenerate affected components / organisms / pages
5. Inspect again
6. Repeat until no visible issue remains
```

## 검사 원칙

- 전체 페이지를 검사한다.
- 현재 보이는 페이지만 보고 완료하지 않는다.
- 페이지별 top-level frame이 실제로 존재하는지 확인한다.
- `05. Templates`와 `06. Pages`를 모두 검사한다. Pages가 통과해도 Templates가 깨져 있으면 완료하지 않는다.
- 주요 상태 화면이 빠지지 않았는지 확인한다.
- 텍스트, 아이콘, 버튼, 패널, 지도 마커가 서로 겹치거나 잘리지 않는지 확인한다.
- 화면이 구조 초안 수준이면 완료로 보지 않는다.
- 문제가 반복되는 경우 개별 page를 고치기보다 shared component, molecule, organism을 먼저 고친다.

## 실패 조건

다음 중 하나라도 보이면 실패로 본다.

```text
Missing expected page
Missing expected top-level frame
Text overflow or clipped text
Button label/icon overlap
Header title and close button concatenated
Header does not span the full screen width when it should
BottomSheet does not span the full screen width when it should
Overlay does not fill the full screen
Centered overlay card is not visually centered
Full-screen layer has arbitrary fixed width smaller than the screen
Template screen shrinks children because of Auto Layout parent sizing
Template Header, BottomSheet, HandleArea, or Overlay is narrower than the mobile screen
Template Loading overlay appears as a partial card/block instead of covering the whole screen
Hero image or category image remains a flat solid color placeholder in final screens
Image area has no meaningful visual context when the UI requires a place/category image
Floating panel visually mixed with background markers or content
Panel content outside panel bounds
Wrong component reuse
Frames positioned as loose coordinates when Auto Layout should be used
Inconsistent spacing between component and page versions
Layer hierarchy that does not match the intended UI structure
Bottom sheet handle is not centered
Close icon is not centered inside its icon button
Dim background appears as a partial black block instead of full-screen overlay
```

## 수정 원칙

```text
If one atom is wrong, fix the atom and propagate it.
If a molecule is structurally wrong, rebuild the molecule.
If an organism is visually broken, rebuild the organism and update every page that uses it.
If page composition is broken, rebuild the page from corrected organisms.
If multiple pages show the same issue, fix the shared source pattern first.
```

문제 범위가 특정 컴포넌트를 넘어 레이아웃 시스템, organism 조립, page 상태 전반에 영향을 주면 부분 수정으로 끝내지 않는다. 관련 component / organism / page를 함께 재생성한다.

## Figma MCP 검증 팁

- 페이지 목록과 top-level frame 목록을 먼저 확인한다.
- 필요한 경우 각 페이지로 `setCurrentPageAsync` 한 뒤 children을 확인한다.
- Figma MCP가 현재 로드되지 않은 page의 children을 0으로 반환할 수 있으므로, 의심되면 페이지를 직접 current page로 전환해서 확인한다.
- 화면 품질은 metadata만으로 충분하지 않을 수 있으니 필요하면 screenshot을 확인한다.

## Sizing QA

다음 full-width 계약을 검사한다.

```text
Header
- should cover full mobile screen width
- should not float as a narrower block unless intentionally designed

BottomSheet
- should cover full mobile screen width
- handle should be centered through a full-width HandleArea

Overlay
- should cover full screen width and height
- card should be centered by parent alignment

MapCanvas
- should fill the full screen behind controls

Templates
- `Template/Mobile/*` screens should keep the same screen size as corresponding `Page/*` states
- Header, BottomSheet, HandleArea, Overlay, and MapCanvas should not shrink inside a template row or board
- `Template/Mobile/Loading` overlay should cover the full `393 x 852` screen, with the loading card visually centered
```

작은 fixed control은 별도로 검사한다.

```text
IconButton
- fixed square
- icon centered
- no visual padding imbalance

Handle
- fixed 44 x 4 or equivalent
- centered inside HandleArea

Marker
- fixed size
- visually separated from panels
```

## Image Asset QA

다음 경우는 실패로 본다.

```text
Hero image is only a solid pink/orange/color block
Category card image is only a flat color block
Generated or uploaded image is missing from final page state
Image overlay makes the image unreadable or visually muddy
Text on image has insufficient contrast
Image does not match the product context
```

이미지 에셋이 없어서 단색 placeholder가 남아 있으면, 디자인 생성 스킬이나 이미지 생성 도구를 사용해 bitmap 에셋을 만들고 Figma image fill로 반영한다.

## 완료 조건

다음 조건을 모두 만족해야 완료로 보고한다.

```text
All required pages exist.
Each page has expected top-level frames.
Template screens exist and pass the same sizing checks as page screens.
Major states are present.
No obvious overlap, clipping, or broken hierarchy is visible.
Floating UI has clear separation from background content.
Spacing follows parent padding and child gap rules where applicable.
Layer names make the hierarchy understandable.
```

최종 보고 전에는 수행한 QA 방식과 남은 리스크를 짧게 남긴다.
