# LOCATION Figma Atomic Design Reference

## Color Tokens

기본 팔레트:

```text
Base: #FFFFFF
Surface: #F8FAFC
Text Strong: #1F2933
Text Default: #374151
Text Muted: #6B7280
Line: #E5E7EB
Primary: #E94B5F
Primary Hover: #D93F52
Primary Pressed: #C93649
Primary Soft: #FFF1F3
Marker Stroke: #B92F42
```

일본인 타겟을 고려해 원색 빨강보다 부드러운 딥 코랄 레드를 사용한다. K-pop, 여행, 음식 추천 맥락을 함께 담을 수 있고 화이트 UI 위에서 버튼, 마커, 선택 상태가 잘 보인다.

## Figma Page Structure

```text
00. Cover
01. Foundations
02. Atoms
03. Molecules
04. Organisms
05. Templates
06. Pages
07. Prototype / Flow
```

## Layout Construction Rules

Figma는 정적인 그림이 아니라 구현 가능한 레이아웃 설계도로 만든다. 좌표 중심 배치보다 Auto Layout과 부모-자식 spacing 규칙을 우선한다.

기본 규칙:

```text
Parent Frame
- Auto Layout: vertical or horizontal
- padding: token value
- gap: token value
- width: fixed frame or fill container
- height: hug contents or fill container

Child
- width: fill container when it should stretch
- height: hug contents unless fixed format is required
- min/max size when text or viewport changes can break layout
```

피해야 할 방식:

```text
Element A: x=24, y=128
Element B: x=24, y=202
Element C: x=24, y=276
```

권장 방식:

```text
Content Frame
- Auto Layout: vertical
- padding: 20
- gap: 12

Rows
- width: fill container
- height: hug contents
```

absolute/floating 배치 허용 사례:

```text
Map marker
Current location marker
Cluster marker
Close button over hero image
Loading overlay
Bottom sheet over map
Floating map controls
Language dropdown overlay
```

그 외의 일반 UI는 부모 프레임 안에서 흐름대로 배치한다.

## Responsive Sizing Rules

기본 sizing 원칙:

```text
Full-screen regions
- Header: fill container width
- BottomSheet: fill container width
- Overlay: fill container width and height
- MapCanvas: fill container width and height

Flexible content
- Panel content: fill container width, hug contents height
- List: fill container width, hug contents height
- ButtonGroup: fill container width
- TextStack: fill container width or defined max width

Fixed controls
- IconButton: fixed square
- Marker: fixed square/circle
- Handle: fixed 44 x 4
- Rating star/icon: fixed visual size
```

고정 모바일 프레임이 `393 x 852`이더라도 헤더와 바텀시트는 구조상 393px에 박힌 그림이 아니라 부모 폭을 채우는 full-width layer로 설계한다.

## Screen Shell

모바일 화면은 다음 shell을 기본으로 한다.

```text
Screen / Mobile
- width: 393
- height: 852
- clips content: true

MapCanvas
- width: fill screen
- height: fill screen

MapMarkers
- overlay layer
- coordinate placement allowed

HeaderLayer
- width: fill screen
- top aligned

BottomSheetLayer
- width: fill screen
- bottom aligned

ModalOverlayLayer
- width: fill screen
- height: fill screen
- center aligned
```

Layer stack:

```text
0. MapCanvas
1. MapMarkers
2. Header / Controls
3. BottomSheet / FloatingPanel
4. Modal / LoadingOverlay
```

## Component Contracts

Header:

```text
Organism/Header/Default
- width: fill container
- height: 56 to 64
- Auto Layout: horizontal
- padding: 12 16
- primaryAxisAlignItems: space-between
- counterAxisAlignItems: center
- Brand left
- LanguageSelector right
```

BottomSheet:

```text
Organism/BottomSheet/Category
- width: fill container
- Auto Layout: vertical
- padding: 10 16 28
- gap: 16
- radius: top-left 24, top-right 24

HandleArea
- width: fill container
- Auto Layout: horizontal
- primaryAxisAlignItems: center

Handle
- width: 44
- height: 4
- radius: 999

HeaderRow
- width: fill container
- Auto Layout: horizontal
- primaryAxisAlignItems: space-between

CategoryList
- width: fill container
- Auto Layout: horizontal
- gap: 12
```

CenteredOverlay:

```text
Organism/Overlay/Loading
- width: fill screen
- height: fill screen
- Auto Layout: vertical or stack equivalent
- center card horizontally and vertically

Dim layer
- fills entire screen evenly

Card
- width: fixed or max width
- height: hug contents
- padding: 20 to 24
- gap: 12
```

IconButton:

```text
Atom/IconButton/Close
- fixed square: 28 to 40
- Auto Layout: horizontal
- primaryAxisAlignItems: center
- counterAxisAlignItems: center
- icon centered
- no loose text node outside button frame
```

FloatingPanel:

```text
Organism/Panel/*
- width: defined or max width
- Auto Layout: vertical
- surface fill: Base
- radius: 16 to 18
- shadow: visible over map
- internal padding/gap controls spacing
```

Image Asset Contract:

```text
Hero Image
- bitmap image fill
- represents place/category context
- may use subtle overlay for text contrast
- must not remain a flat solid color in final pages

Category Image
- bitmap image fill
- visually distinguishes category
- label remains readable
- no generic gradient/color block as final asset

Generated Images
- use when real image asset is unavailable and user allows generation
- prompt should describe subject, city context, mood, and usage size
- upload generated asset into Figma and apply as image fill
```

## Atoms

최소 단위 컴포넌트:

```text
Text styles
Icon
Flag
Badge
Button
Icon Button
Input Field
Divider
Marker Dot
Rating Star
Loading Spinner
Handle Bar
```

권장 컴포넌트:

```text
Atom/Button/Primary
Atom/Button/Secondary
Atom/Button/Ghost
Atom/IconButton/Close
Atom/IconButton/Share
Atom/IconButton/Save
Atom/Badge/Open
Atom/Badge/Category
Atom/Badge/Distance
Atom/MapMarker/Default
Atom/MapMarker/Selected
Atom/MapMarker/Cluster
Atom/HandleBar/Default
```

## Molecules

작은 기능 단위:

```text
Molecule/LanguageSelector/Default
Molecule/SearchBar/Default
Molecule/CategoryChip/Default
Molecule/CategoryCard/Image
Molecule/PlaceSummaryRow/Default
Molecule/RatingSummary/Default
Molecule/ActionButtonGroup/Route
Molecule/InfoRow/Default
Molecule/ReviewItem/Default
Molecule/ClusterPlaceRow/Default
Molecule/LoadingMessage/Default
```

`InfoRow`는 장소 상세의 주소, 영업시간, 전화번호, 웹사이트에 공통으로 사용한다.

`ClusterPlaceRow`는 클러스터 선택 패널 전용으로 만든다. 일반 `InfoRow`를 줄여서 쓰지 않는다.

권장 구조:

```text
Molecule/ClusterPlaceRow/Default
- Auto Layout: horizontal
- width: fill container
- height: hug contents
- padding: 12 14
- gap: 12

Number Badge
- fixed 28 x 28
- radius: 999
- primary soft fill or primary fill

Text Stack
- Auto Layout: vertical
- width: fill container
- gap: 2

Chevron
- fixed icon area
```

## Organisms

화면의 주요 섹션:

```text
Organism/Header/Default
Organism/MapCanvas/Default
Organism/BottomSheet/Category
Organism/Panel/PlaceDetail
Organism/Panel/ClusterSelection
Organism/Overlay/Loading
Organism/Panel/PermissionError
Organism/Dropdown/Language
```

예시 조립:

```text
Bottom Category Sheet
= Handle Bar
+ Section Header
+ Category Image Card List
```

```text
Place Detail Panel
= Hero Image
+ Place Header
+ Action Button Group
+ Quick Actions
+ Tab Navigation
+ Info Row List
+ Review List
```

Cluster Selection Panel 조립:

```text
Cluster Selection Panel
= Panel Surface
+ Header
   - Title: "{n}개 장소"
   - Close Icon Button
+ Place List
   - ClusterPlaceRow
   - ClusterPlaceRow
   - ClusterPlaceRow
```

Cluster Selection Panel 규칙:

```text
Panel
- width: 300 to 320
- Auto Layout: vertical
- padding: 0 or 12 depending on header style
- radius: 16 to 18
- shadow strong enough to separate from map

Header
- Auto Layout: horizontal
- padding: 12 14
- gap: 8
- primaryAxisAlignItems: space-between

Close button
- fixed 28 x 28
- independent icon button
- never concatenate with title text

List
- Auto Layout: vertical
- width: fill container
- gap: 0 or 4
```

Place Detail Panel 레이아웃 예:

```text
Organism/Panel/PlaceDetail
- Auto Layout: vertical
- width: fill container or fixed panel width
- height: fill container
- padding: 0
- gap: 0

Hero Image
- width: fill container
- height: fixed 220

Content
- Auto Layout: vertical
- width: fill container
- height: hug contents
- padding: 20
- gap: 16

Place Header
- Auto Layout: vertical
- width: fill container
- gap: 6

Action Button Group
- Auto Layout: horizontal
- width: fill container
- gap: 8

Info List
- Auto Layout: vertical
- width: fill container
- gap: 0
```

## Templates

데이터가 들어가기 전 화면 골격:

```text
Template/Mobile/MapDefault
Template/Mobile/MapWithBottomSheet
Template/Mobile/MapWithDetailPanel
Template/Mobile/Loading
Template/Mobile/Error
Template/Desktop/MapDefault
```

## Pages

실제 상태별 화면:

```text
Page/Home/Empty
Page/Home/CategorySelected
Page/Home/Loading
Page/Home/Results
Page/Home/ClusterOpen
Page/Place/Detail
Page/Place/DetailWithReviews
Page/Permission/LocationDenied
Page/Language/DropdownOpen
```

## Naming Rules

Figma 컴포넌트 이름은 검색과 Code Connect를 고려해 슬래시 구조를 사용한다.

```text
Atom/Button/Primary
Atom/Button/Secondary
Atom/IconButton/Close
Atom/Badge/Open
Molecule/PlaceInfoRow/Default
Molecule/CategoryCard/Image
Molecule/ReviewItem/Default
Organism/Header/Default
Organism/BottomSheet/Category
Organism/Panel/PlaceDetail
Template/Mobile/MapDefault
Page/Home/Results
```

## Variants

Button:

```text
variant: primary / secondary / ghost
size: sm / md / lg
state: default / hover / pressed / disabled
```

Map Marker:

```text
type: place / cluster / current-location
state: default / selected
```

Category Card:

```text
category: kpop / ramen / default
state: default / selected / loading
```

## Prototype Flow

기본 연결:

```text
Home / Empty
-> Category Selected
-> Loading
-> Results
-> Cluster Open
-> Place Detail
```

보조 연결:

```text
Header language button -> Language Dropdown Open
Location denied -> Permission / Location Denied
Place Detail route button -> external Google Maps intent
```

## Quality Bar

- 모바일 화면에서 텍스트가 버튼이나 패널 밖으로 넘치지 않아야 한다.
- 지도 위 UI는 지도 내용을 과하게 가리지 않아야 한다.
- 지도 위 floating panel은 배경 마커와 충돌하지 않아야 하며, 마커가 패널 내부 요소처럼 보이면 실패로 본다.
- 클러스터 패널 헤더의 닫기 버튼은 제목과 분리된 독립 control이어야 한다.
- 클러스터 장소 목록은 번호 배지, 텍스트 스택, chevron이 있는 전용 row로 만든다.
- 상세 패널은 장소명, 평점, 영업 상태, 주소, 전화, 공유/저장/길찾기를 빠르게 찾을 수 있어야 한다.
- 이미지 카드는 앱의 주요 정보 전달을 보조해야 하며 장식용으로만 쓰지 않는다.
- 최종 화면의 히어로/카테고리 이미지가 단색 분홍/주황 placeholder로 남아 있으면 실패로 본다.
- 과한 그라데이션, 보라색 위주 팔레트, 카드 남용, 랜딩 페이지식 히어로 구성을 피한다.
