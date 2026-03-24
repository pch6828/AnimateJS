# MAIN PAGE Report

## 개요

메인 페이지를 다이얼 중심의 첫 화면으로 구성했다.  
핵심 방향은 다음과 같다.

- 화면의 주요 오브젝트는 원형 다이얼 하나다.
- 다이얼을 회전해 콘텐츠를 선택한다.
- 선택된 항목 정보는 우측 또는 상단의 `stage-summary`에 표시한다.
- 화면 비율이 좁아지면 레이아웃을 별도로 재구성한다.

## 현재 구조

### 1. 메인 레이아웃

- `main-page > main-shell > main-stage` 구조를 사용한다.
- `main-stage` 안에는 다음 요소가 들어간다.
  - 회전 안내 문구 `stage-hint`
  - 현재 선택 정보 `stage-summary`
  - 다이얼 본체 `wheel-menu`

### 2. 다이얼 구성

- 현재 다이얼은 하나의 원만 사용한다.
- 가장 바깥 원 역할은 `wheel-menu`가 직접 담당한다.
- 배경색은 `--outer-ring-fill`을 사용한다.
- 원형 그림자는 `wheel-menu`의 `box-shadow`로 처리한다.
- 중앙 원과 중간 원은 제거한 상태다.

### 3. 다이얼 버튼

- 버튼은 알파벳만 표시한다.
- 버튼 안에는 제목, 날짜, PC/모바일 지원 표시는 없다.
- 색상은 세부 페이지 존재 여부로 결정한다.
  - 세부 페이지가 있으면 진한 색
  - 세부 페이지가 없으면 회색

## 선택 규칙

### 기본 화면

- 기본 화면에서는 다이얼 버튼이 우측 상단 쪽에 왔을 때 선택된다.
- 선택된 항목이 세부 페이지를 가지면 `stage-summary`에 제목과 날짜를 표시한다.
- `stage-summary`를 클릭하면 해당 콘텐츠 페이지로 이동한다.

### 좁은 화면

- 화면 비율이 `1.2:1`보다 작으면 별도 배치를 사용한다.
- 이 구간에서는 다이얼 버튼이 중앙 상단에 왔을 때 선택된다.

## 다이얼 위치와 크기 계산

### 1. 기준 변수

- 다이얼 크기의 기준은 CSS 변수 `--dial-radius`다.
- `main.jsx`에서 `dialConfig.radiusCss`를 계산하고 `main-stage`에 인라인 CSS 변수로 내려준다.
- 즉, JSX와 CSS가 같은 다이얼 반지름 값을 공유한다.

### 2. 관련 계산

- 버튼 궤도 비율은 `--slot-orbit-ratio`
- 버튼 크기는 `--slot-size`
- 다이얼 실제 크기는 아래 식으로 계산한다.

```css
width: calc((var(--dial-radius) * var(--slot-orbit-ratio) * 2) + var(--slot-size));
height: calc((var(--dial-radius) * var(--slot-orbit-ratio) * 2) + var(--slot-size));
```

- 기본 레이아웃에서는 다이얼 중심이 화면의 왼쪽 하단 바깥쪽에 걸치도록 배치한다.
- 좁은 화면 레이아웃에서는 다이얼이 하단 중앙에 오도록 재배치한다.

## 반응형 처리

### 1. 기본 레이아웃

- 화면이 충분히 넓을 때는
  - `stage-summary`가 우측 중앙
  - 다이얼이 좌하단 쪽에 크게 걸쳐 보이도록 구성한다.
- 화면 폭이 줄어들수록 다이얼 중심은 부드럽게 더 왼쪽 바깥으로 밀린다.
- 이 동작은 `--dial-center-shift-x` 계산으로 처리한다.

### 2. 좁은 화면 레이아웃

- `@media all and (max-aspect-ratio: 6/5)` 구간에서 별도 레이아웃을 사용한다.
- 이때
  - `stage-hint`는 중앙 상단
  - `stage-summary`는 중앙 상단
  - 다이얼은 중앙 하단
  - 선택 기준은 중앙 상단
  로 바뀐다.

### 3. 좁은 화면 타이포그래피

- 좁은 화면에서는 다이얼 버튼 글자 크기를 줄였다.
- `stage-summary`의 사이트 제목, 타이틀, 날짜 폰트도 함께 축소했다.
- 주요 글자 크기는 `vh` 기준으로 잡아 화면 높이에 따라 반응하도록 정리했다.

## 인터랙션

- 포인터 이벤트 기반 회전 인터랙션을 유지한다.
- 가로/세로에 따라 드래그 기준 축이 달라진다.
- 드래그 종료 시 가장 가까운 슬롯 각도로 스냅된다.

## 수정 파일

- `src/animate-js/class/main_menu/main.jsx`
- `src/animate-js/class/main_menu/wheel_button.jsx`
- `src/animate-js/class/main_menu/wheel_button_item.jsx`
- `src/animate-js/style/main.css`
- `codex/report/MAIN_PAGE.md`

## 확인 결과

- `npm run build` 실행 결과: 성공

## 후속 조정 포인트

- `--dial-radius`
  - 다이얼 전체 크기 조정
- `--slot-orbit-ratio`
  - 버튼 궤도 반경 조정
- `--dial-center-shift-x`
  - 넓은 화면에서 다이얼이 화면 밖으로 빠지는 정도 조정
- `@media all and (max-aspect-ratio: 6/5)`
  - 좁은 화면 전용 레이아웃 세부 조정
