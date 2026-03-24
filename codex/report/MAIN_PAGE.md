# MAIN PAGE Report

## 개요

메인 페이지를 다이얼 중심의 미니멀한 첫 화면으로 재구성했다.  
보조 레이아웃과 상단 타이틀은 제거하고, 화면 전체를 하나의 스테이지처럼 사용하도록 정리했다.

## 최종 레이아웃 방향

- 화면의 주인공은 원형 다이얼이다.
- 다이얼은 화면 왼쪽 하단을 기준점으로 배치된다.
- 다이얼 전체가 아니라 일부만 화면에 드러나도록 구성했다.
- 우상단에는 현재 선택된 항목의 최소 정보만 남겼다.
- 종이색 배경, 잉크색 텍스트, 세리프 타이포그래피만으로 레트로한 인상을 유지했다.

## 구현 내용

### 1. 구조 단순화

- `main.jsx`에서 상단 마스트헤드와 별도 설명 영역을 제거했다.
- 현재 구조는 `main-page > main-shell > main-stage` 단일 흐름이다.
- `main-stage` 내부에는 선택 정보(`stage-summary`)와 다이얼(`wheel-menu`)만 배치했다.

### 2. 다이얼 배치 기준

- 다이얼 반지름은 CSS 변수 `--dial-radius`로 제어한다.
- 다이얼 지름은 `--stage-size: calc(var(--dial-radius) * 2)`로 계산한다.
- 다이얼 중심이 왼쪽 하단 코너에 오도록 아래 값을 사용한다.

```css
left: calc(var(--dial-radius) * -1);
bottom: calc(var(--dial-radius) * -1);
```

- 현재 기본값은 데스크톱 기준 `--dial-radius: 90vh`다.
- 세로 화면 비율에서는 `--dial-radius: 66.666vh`로 줄여서 모바일 레이아웃을 유지한다.

### 3. 화면 여백 제거

- 바깥 여백은 모두 제거했다.
- `.main-shell`은 `padding: 0` 상태다.
- `.main-page`는 `overflow: hidden`으로 설정해 스크롤이 생기지 않게 했다.
- `.main-stage`는 `height: 100%`로 화면 전체를 점유한다.

### 4. 유지한 인터랙션

- 기존 pointer 기반 다이얼 회전 인터랙션은 유지했다.
- 선택된 인덱스는 회전 각도에서 계산한다.
- 선택된 항목의 알파벳, 제목, 날짜만 요약 정보로 화면에 표시한다.
- 휠 내부의 A-Z 슬롯 구조와 링크 방식은 기존 구현을 유지했다.

## 수정 파일

- `src/animate-js/class/main_menu/main.jsx`
- `src/animate-js/style/main.css`
- `codex/report/MAIN_PAGE.md`

## 확인 결과

- `npm run build` 실행 결과: 성공

## 후속 조정 포인트

- `--dial-radius` 값을 바꿔 다이얼 노출 범위를 빠르게 조정할 수 있다.
- `stage-summary`의 위치와 크기를 줄이면 더 비워진 인상을 만들 수 있다.
- 다이얼 내부 타이틀 `26 Animated TMI`의 위치도 추가 미세 조정 가능하다.
