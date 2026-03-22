# 개인 페이지 개발 계획서
## Retro Newspaper A–Z Typography Personal Page

## 1. 문서 목적
이 문서는 개인 페이지를 **레트로 신문 감성**으로 리팩토링/재구축하기 위한 개발 계획서다.  
최종 결과물은 **메인 다이얼 페이지 + A~Z 세부 페이지**로 구성되며, 각 이니셜은 하나의 단어와 하나의 인터랙티브 타이포그래피 작업을 대표한다.

이 계획서는 특히 다음 목적에 맞춰 작성한다.

- 기존 Vite + React 프로젝트를 리팩토링 가능한 구조로 정리한다.
- A~Z 단어와 각 타이포그래피 콘셉트가 아직 미정이어도 먼저 개발을 진행할 수 있게 한다.
- 나중에 Codex 같은 개발 보조 도구에 입력했을 때, 작업 범위와 우선순위가 명확하게 이해되도록 한다.
- GitHub Pages 배포까지 고려한 실제 구현 전략을 포함한다.

---

## 2. 프로젝트 한 줄 정의
**“신문 지면 같은 개인 아카이브 안에서, A~Z 이니셜이 회전형 다이얼과 인터랙티브 캔버스 타이포그래피로 펼쳐지는 개인 포트폴리오/정체성 페이지”**

---

## 3. 핵심 컨셉 정리

### 시각 컨셉
- 전체 무드: 레트로 신문, 활자 인쇄물, 편집 디자인, 아카이브 문서
- 메인 서체 방향:
  - 기본: `Times New Roman` 계열 세리프
  - 대체 후보: Georgia, Baskerville 계열, 혹은 웹 세리프 폴백
- 색감:
  - 종이색 배경 (오프화이트/아이보리)
  - 잉크색 텍스트 (진한 검정/차콜)
  - 보조 포인트 컬러는 최소화 (짙은 버건디, 딥 네이비 정도만 선택적으로 사용)
- 인상:
  - “현대적인 SPA”보다 “움직이는 편집물”에 가까운 감성
  - 화려한 UI보다 **타이포그래피와 상호작용**이 중심

### 개념 컨셉
- A~Z 각 이니셜은 사용자의 성향/정체성을 상징하는 단어와 연결된다.
- 메인에서는 A~Z를 전체 아카이브처럼 보여주고,
- 세부 페이지에서는 한 글자와 한 단어를 **하나의 인터랙티브 시각 작업**으로 확장한다.

---

## 4. 제품 목표

### 필수 목표
1. 메인에서 A~Z 이니셜을 원형 다이얼처럼 탐색할 수 있어야 한다.
2. 각 이니셜 클릭 시 세부 페이지로 이동해야 한다.
3. 세부 페이지에는 캔버스 기반 인터랙티브 타이포그래피가 있어야 한다.
4. 설명 텍스트를 함께 배치해 “작업 + 의미”를 동시에 전달해야 한다.
5. 데스크톱과 모바일 모두에서 자연스럽게 동작해야 한다.
6. GitHub Pages에 무리 없이 배포 가능해야 한다.

### 감성 목표
1. 첫 화면에서 “이건 일반 포트폴리오가 아니라 편집된 개인 세계관이다”라는 인상을 준다.
2. 각 세부 페이지가 단순 정보 페이지가 아니라 “짧은 전시 작품”처럼 느껴진다.
3. 인터랙션은 과하지 않고, 활자와 의미를 강화하는 수준이어야 한다.

---

## 5. 범위 정의

### 이번 단계(MVP)에 포함할 것
- 메인 다이얼 페이지
- A~Z 공통 데이터 구조
- 세부 페이지 공통 레이아웃
- 캔버스 렌더링 공통 래퍼
- 최소 1~3개 샘플 이니셜 인터랙션 구현
- 나머지 이니셜은 플레이스홀더 구조로 연결
- GitHub Pages 배포 파이프라인

### 이번 단계에서 미뤄도 되는 것
- 26개 모든 이니셜의 최종 타이포그래피 완성
- 고급 사운드 인터랙션
- CMS 연동
- 다국어 지원
- 복잡한 애니메이션 라이브러리 도입
- SEO 고도화
- 관리자 페이지

---

## 6. 추천 구현 원칙

### 원칙 1. 메인 다이얼은 DOM 중심으로 구현
메인페이지의 A~Z 다이얼은 **Canvas가 아니라 DOM + CSS Transform + Pointer Event** 중심으로 구현하는 것을 권장한다.

이유:
- 텍스트 품질이 좋다.
- 접근성 대응이 쉽다.
- 각 이니셜을 실제 버튼/링크로 만들기 좋다.
- hover/focus/selected 상태 관리가 단순하다.
- 리팩토링 시 유지보수가 쉽다.

### 원칙 2. 세부 타이포그래피만 Canvas 사용
Canvas는 각 세부 페이지의 “작품 영역”에만 사용한다.

이유:
- 인터랙션 실험 자유도가 높다.
- 문자 변형, 입자, 물리감, 드로잉 효과를 구현하기 좋다.
- 메인 UI까지 Canvas로 처리하는 것보다 구조가 깔끔하다.

### 원칙 3. A~Z 데이터는 완전히 데이터 주도 구조로 관리
A~Z 항목은 하드코딩된 페이지 집합이 아니라, 하나의 데이터 컬렉션으로 관리한다.

장점:
- 단어가 바뀌어도 데이터만 수정하면 됨
- 설명 텍스트와 스케치 매핑을 일관되게 유지 가능
- 향후 작업량이 커져도 구조가 무너지지 않음

### 원칙 4. 인터랙션은 “의미 강화용”으로만 사용
마우스/터치 인터랙션은 시각적으로 멋지기만 한 장치가 아니라, 단어의 의미와 형태를 강화해야 한다.

예:
- `A = Archive` 라면 드래그로 활자가 겹겹이 축적되는 느낌
- `F = Flux` 라면 포인터 이동에 따라 글자 형태가 유동적으로 흐트러짐
- `M = Memory` 라면 지나간 자취가 남는 방식

---

## 7. 정보 구조(IA)

### 페이지 구성
- `/` : 메인 다이얼 페이지
- `/:letter` 또는 `/#/:letter` : 이니셜 세부 페이지

### 권장 라우팅 구조
GitHub Pages를 가장 간단하게 쓰려면 **HashRouter 기반 라우팅**을 우선 추천한다.

예:
- `/#/`
- `/#/a`
- `/#/b`

이유:
- 정적 호스팅에서 새로고침 시 404 위험이 적다.
- GitHub Pages 환경에서 딥링크 문제가 가장 적다.
- 구조가 단순하고 유지보수 난이도가 낮다.

### 대안
깔끔한 URL이 꼭 필요하다면 BrowserRouter + custom 404 fallback 전략을 추가 검토할 수 있다.  
다만 현재 프로젝트 목적상 **배포 안정성 > URL 미관**이라면 HashRouter가 더 실용적이다.

---

## 8. 사용자 경험 흐름

### 메인페이지 흐름
1. 사용자가 페이지 진입
2. 신문 헤더/마스트헤드와 함께 원형 A~Z 다이얼이 보임
3. 사용자는 마우스 드래그 또는 터치로 다이얼을 회전
4. 특정 이니셜을 클릭/탭
5. 해당 이니셜의 세부 페이지로 전환

### 세부페이지 흐름
1. 큰 이니셜/단어 헤더 진입
2. 좌측(또는 상단)에 인터랙티브 캔버스 작업 표시
3. 우측(또는 하단)에 설명 텍스트, 개념, 인터랙션 힌트 표시
4. 사용자는 포인터/터치로 타이포그래피와 상호작용
5. 이전/다음 이니셜 또는 메인으로 이동 가능

---

## 9. 시각 디자인 가이드

### 9.1 레이아웃 원칙
- 신문/잡지 편집물처럼 **마진과 칼럼 구조**가 느껴져야 한다.
- 너무 현대적인 카드 UI는 지양한다.
- 선(line), 구분선(rule), 작은 캡션, 에디션 정보 같은 편집 요소를 적극 활용한다.

### 9.2 화면 요소 제안
- 상단 마스트헤드:
  - 사이트 타이틀
  - 서브카피
  - 날짜/Edition/Vol 같은 장식 정보
- 본문:
  - 메인 다이얼 혹은 타이포그래피 캔버스
- 하단:
  - 네비게이션, 크레딧, 저작권/이름

### 9.3 타이포그래피 스타일
- 헤드라인: 큰 세리프, 높은 대비
- 본문: 읽기 쉬운 세리프
- 캡션/보조 정보: 작은 크기, 자간 조절, 대문자 소량 사용
- 장식 요소:
  - Drop cap 느낌
  - 구분선
  - 작은 상단 정보줄
  - 정렬감 있는 여백

### 9.4 컬러 방향
추천 기본 팔레트:
- Paper: `#f2eadf` 계열
- Ink: `#111111` 또는 `#1b1b1b`
- Muted accent: `#6d1f1f` 또는 `#243447`
- Border/Rule: `rgba(0,0,0,0.15)` 수준

포인트:
- 과도한 다채색은 피한다.
- 이 프로젝트의 주인공은 색이 아니라 **글자와 질감과 여백**이다.

---

## 10. 메인페이지 기능 설계

## 10.1 핵심 역할
- 전체 A~Z 항목을 소개하는 허브
- 시각적으로 가장 인상적인 진입 지점
- 사용자에게 “탐색하고 싶다”는 감각을 줘야 함

## 10.2 필수 UI 요소
- 마스트헤드 영역
- 원형 이니셜 다이얼
- 현재 선택된 이니셜 표시
- 선택된 이니셜에 대한 짧은 프리뷰(선택 사항)
- 사용 힌트 (`Drag to rotate`, `Tap a letter`, 등)

## 10.3 다이얼 동작 사양
- A~Z 26개 이니셜을 원형으로 배치
- 포인터 다운 시 현재 각도 저장
- 포인터 이동에 따라 중심점 기준 각도 차이 계산
- 회전량 업데이트
- 포인터 업 시 속도를 기반으로 약한 관성(inertia) 적용 가능
- 필요 시 가장 가까운 이니셜로 스냅(snap) 처리 가능
- 클릭/탭 시 상세 페이지로 이동

## 10.4 구현 방식
추천 방식:
- 원형 컨테이너 안에 26개 버튼을 절대 배치
- 각 글자의 위치는 polar coordinate 계산
- 회전은 부모 레이어 transform으로 제어
- 실제 텍스트 방향은 읽기 쉬운 각도로 보정 가능

예상 상태 값:
- `rotation`
- `isDragging`
- `dragStartAngle`
- `velocity`
- `activeLetter`

## 10.5 접근성 포인트
- 각 이니셜은 실제 `<button>` 또는 `<Link>` 역할을 가져야 한다.
- 키보드로도 이동 가능해야 한다.
- 포커스 상태가 명확해야 한다.
- 시각적 다이얼 외에도 보조 리스트/네비게이션이 있으면 좋다.

---

## 11. 세부페이지 기능 설계

## 11.1 핵심 역할
- 하나의 이니셜과 단어를 하나의 시각 작업으로 보여주는 전시형 페이지

## 11.2 권장 레이아웃
데스크톱:
- 좌측: 대형 Canvas
- 우측: 텍스트 설명 패널

모바일:
- 상단: Canvas
- 하단: 설명 패널

## 11.3 공통 요소
- 큰 이니셜
- 단어 제목
- 짧은 서브카피 또는 개념 설명
- 인터랙션 힌트
- Reset 버튼
- 이전/다음 이니셜 이동
- 메인으로 돌아가기 링크

## 11.4 설명 패널에 들어갈 내용
- 단어
- 왜 이 단어가 나를 설명하는지
- 시각적으로 이 타이포그래피를 어떻게 해석했는지
- 인터랙션이 의미와 어떻게 연결되는지

---

## 12. Canvas 타이포그래피 아키텍처

### 핵심 전략
각 이니셜별 타이포그래피는 제각각 다르더라도, **공통 Canvas 엔진 + 개별 Sketch 모듈** 구조로 설계한다.

### 권장 구조
- `CanvasStage`:
  - canvas 초기화
  - DPR 처리
  - resize 대응
  - animation loop 관리
  - pointer/touch/wheel 이벤트 정규화
- `Sketch` 모듈:
  - 이니셜별 드로잉 로직
  - 상태 업데이트
  - 사용자 입력에 대한 반응 정의

### Sketch 인터페이스 예시
```ts
type SketchContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  time: number;
  pointer: {
    x: number;
    y: number;
    isDown: boolean;
    velocityX: number;
    velocityY: number;
  };
};

type SketchModule = {
  init?: (context: SketchContext) => void;
  resize?: (context: SketchContext) => void;
  update?: (context: SketchContext) => void;
  draw: (context: SketchContext) => void;
  destroy?: () => void;
};
```

### 이벤트 처리 권장사항
- React synthetic event에 과하게 기대지 말고, canvas wrapper에서 pointer event를 직접 정리
- 마우스와 터치를 최대한 동일한 인터페이스로 다룸
- `pointerdown / pointermove / pointerup / pointerleave`
- 모바일 대응을 위해 pointer events 중심 사용 권장

### 렌더링 전략
- `requestAnimationFrame` 기반 루프
- `devicePixelRatio` 반영
- 탭 비활성화 시 애니메이션 정지 고려
- 지나치게 무거운 파티클 수는 피함

### 플레이스홀더 전략
아직 특정 이니셜의 시각 콘셉트가 미정이라면:
- 기본 placeholder sketch를 공통 제공
- 예: 큰 글자, 느린 흔들림, 포인터 반응 정도만 있는 버전
- 이후 개별 스케치로 교체

---

## 13. 데이터 구조 설계

A~Z 항목은 데이터 파일 하나에서 관리한다.

예시:
```ts
export type LetterEntry = {
  id: string;              // "a"
  letter: string;          // "A"
  word: string;            // "Archive"
  shortDescription: string;
  longDescription: string;
  sketchKey: string;       // "archiveSketch"
  interactionHint: string; // "Drag to accumulate layers"
  status: "planned" | "prototype" | "done";
};

export const letters: LetterEntry[] = [
  {
    id: "a",
    letter: "A",
    word: "Archive",
    shortDescription: "기억과 기록의 축적",
    longDescription: "나의 사고와 작업이 층위처럼 쌓이는 방식을 표현한다.",
    sketchKey: "archiveSketch",
    interactionHint: "드래그하면 글자가 겹겹이 쌓입니다.",
    status: "prototype"
  }
];
```

### 이 구조의 장점
- 페이지와 콘텐츠가 분리된다.
- 설명 텍스트와 캔버스 로직 매핑이 쉽다.
- A~Z가 늘어나거나 수정되어도 구조가 단순하다.

---

## 14. 추천 폴더 구조

```txt
src/
  app/
    router.jsx
    App.jsx

  pages/
    HomePage.jsx
    DetailPage.jsx

  components/
    layout/
      SiteHeader.jsx
      PageFrame.jsx
      EditorialMeta.jsx
    dial/
      LetterDial.jsx
      LetterDialItem.jsx
      DialHint.jsx
    canvas/
      CanvasStage.jsx
      CanvasFallback.jsx
    typography/
      WordHeader.jsx
      DescriptionPanel.jsx
    navigation/
      LetterPager.jsx
      BackToHomeLink.jsx

  sketches/
    registry.js
    shared/
      pointer.js
      math.js
      drawText.js
    placeholder/
      placeholderSketch.js
    a/
      archiveSketch.js
    b/
      ...
    c/
      ...

  hooks/
    useDialRotation.js
    usePointerAngle.js
    useReducedMotion.js
    useCanvasSize.js

  data/
    letters.js

  utils/
    polar.js
    clamp.js
    lerp.js
    slug.js

  styles/
    globals.css
    tokens.css
    layout.css
    home.css
    detail.css
    canvas.css
```

### 참고
- 기존 프로젝트가 JS라면 그대로 JS 유지 가능
- 다만 Canvas 인터페이스와 데이터 모델이 복잡해질 가능성이 크므로, **가능하면 점진적 TypeScript 전환**도 고려할 가치가 있다
- 하지만 이번 리팩토링의 1차 목표는 “완성”이지 “완전한 기술 스택 교체”가 아니다

---

## 15. 라우팅 전략

### 추천
- `HashRouter` 사용
- 홈: `/#/`
- 상세: `/#/:letter`

### 이유
- GitHub Pages에서 새로고침/직접 접근 시 안정적
- 추가 서버 설정 없이 동작 가능
- 개인 페이지 특성상 가장 비용이 낮은 선택

### 상세페이지 파라미터
- `letter` 파라미터를 받아 데이터 매칭
- 없거나 잘못된 경우 Not Found 또는 홈 복귀 처리

예:
```ts
const entry = letters.find((item) => item.id === letterParam?.toLowerCase());
```

---

## 16. 스타일 시스템 전략

### CSS 운영 원칙
- 전역 토큰 + 페이지별 스타일 조합
- 무거운 CSS 프레임워크 없이 직접 설계 권장
- 구조가 명확하면 Tailwind 없이도 충분히 구현 가능

### 토큰 예시
```css
:root {
  --color-paper: #f2eadf;
  --color-ink: #151515;
  --color-muted: rgba(0, 0, 0, 0.65);
  --color-rule: rgba(0, 0, 0, 0.14);
  --color-accent: #6d1f1f;

  --font-serif: "Times New Roman", Times, Georgia, serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --content-width: 1280px;
  --rule-thin: 1px;
}
```

### 질감 표현 팁
- 무거운 텍스처 이미지를 많이 쓰기보다, CSS 배경과 미세한 노이즈를 절제해서 사용
- 너무 빈티지 필터처럼 보이면 오히려 촌스러워질 수 있으므로 “편집 감성”에 집중

---

## 17. 인터랙션 설계 가이드

### 메인 다이얼 인터랙션
- Drag to rotate
- Wheel로 소폭 회전 (선택 사항)
- Hover 시 해당 이니셜 강조
- Tap/Click 시 진입
- 현재 선택 상태를 시각적으로 표시

### 세부 Canvas 인터랙션
이니셜별 콘셉트는 나중에 정하되, 인터랙션 유형은 공통 분류를 먼저 정의한다.

추천 분류:
- `drag`: 드래그로 글자 왜곡/분해/축적
- `hover`: 포인터 근처에서 반응
- `press`: 누르고 있는 동안 상태 변화
- `trace`: 움직인 경로가 남음
- `wheel`: 확대/축소 또는 회전
- `tap`: 터치 때 짧은 반응 발생

### 공통 UX 규칙
- 사용자가 3초 안에 “어떻게 만지는지” 이해할 수 있어야 함
- 인터랙션 힌트는 짧고 분명해야 함
- 인터랙션이 없어도 기본 화면이 아름다워야 함

---

## 18. 접근성/사용성 가이드

### 반드시 챙길 것
- 본문 대비 충분히 확보
- 폰트 크기 너무 작지 않게 유지
- 키보드 포커스 명확히 표시
- 클릭 영역 충분히 크게 확보
- `prefers-reduced-motion` 대응
- 캔버스 작업의 의미를 텍스트로 함께 제공

### Canvas 접근성 보완
Canvas 자체는 스크린리더 친화적이지 않으므로:
- 옆 설명 텍스트가 실질적 대체 설명 역할을 해야 한다
- “이 작업은 포인터로 글자의 형태가 흐트러지고 다시 응집되는 인터랙션이다” 같은 설명을 넣는다
- 가능하면 Reset 버튼과 간단한 상태 힌트를 제공한다

---

## 19. 반응형 전략

### 데스크톱
- 메인 다이얼 크게
- 세부 페이지는 2열 레이아웃
- 충분한 여백과 편집감 강조

### 태블릿
- 다이얼 크기 유지하되 정보 간격 축소
- 세부 페이지는 2열 유지 또는 1.5열 느낌으로 전환

### 모바일
- 다이얼이 화면에 맞게 축소
- 손가락 조작 가능한 충분한 터치 영역
- 세부 페이지는 세로 스택
- 캔버스 높이를 확보하되 너무 길지 않게 조정

---

## 20. 성능 최적화 원칙

### 필수 최적화
- Canvas에서 DPR 상한값 설정 고려 (예: 1.5~2)
- pointer move 연산 최소화
- `requestAnimationFrame` 내부에서만 그리기
- 화면 밖 또는 탭 비활성 시 루프 중단
- 불필요한 React re-render 최소화

### 메인 다이얼 최적화
- 다이얼 회전은 가능하면 state 남발보다 transform 중심 처리
- 매우 잦은 값은 ref 기반 처리 고려
- 필요 시 최종 상태만 state 반영

### 상세 Canvas 최적화
- 각 스케치별 파티클 수와 draw 횟수 제한
- 모바일에서 복잡도 낮추는 fallback 옵션 고려

---

## 21. 리팩토링 전략

기존 프로젝트가 이미 존재하므로, 새 프로젝트를 처음부터 만드는 대신 **단계적 리팩토링**으로 접근한다.

### 1단계. 기존 구조 진단
확인할 것:
- 현재 라우팅 구조
- 전역 스타일 오염 여부
- 공용 컴포넌트 재사용 가능성
- 애니메이션/이벤트 관련 기술 부채
- 배포 설정 상태

### 2단계. 레이아웃 셸 정리
- 공통 프레임 구축
- 페이지 폭, 마진, 배경, 헤더 구조 통일
- 기존 불필요 스타일 제거

### 3단계. 데이터 중심 구조 도입
- A~Z 데이터를 `letters` 파일로 일원화
- 기존 임시 문구/하드코딩 제거
- 라우트와 데이터 연결

### 4단계. 홈 다이얼 구현
- 플레이스홀더 데이터 기준으로 다이얼 완성
- 라우팅 연결
- 키보드/모바일 대응

### 5단계. 세부 페이지 공통 틀 구현
- 캔버스 래퍼 + 설명 패널 + 내비게이션 구축
- 스케치 registry 연결

### 6단계. 개별 스케치 확장
- 우선 1~3개만 완성도 있게 구현
- 나머지는 placeholder
- 이후 순차 확장

### 7단계. 배포/QA
- GitHub Pages Actions 연결
- 모바일/새로고침/링크 공유 테스트
- 성능/가독성 최종 점검

---

## 22. 개발 마일스톤

## Milestone 0. 프로젝트 감사(Audit)
목표:
- 현재 코드베이스 상태 파악
- 살릴 것과 버릴 것 구분

산출물:
- 제거 대상 목록
- 재사용 대상 컴포넌트 목록
- 라우팅/스타일/배포 이슈 목록

## Milestone 1. 디자인 시스템 및 프레임 구축
목표:
- 종이/잉크/세리프 기반 기본 테마 완성
- 공통 레이아웃과 헤더 정의

산출물:
- `tokens.css`
- `globals.css`
- `PageFrame`
- `SiteHeader`

## Milestone 2. A~Z 데이터 구조와 라우팅 연결
목표:
- `letters` 데이터 파일 정의
- 홈/상세 라우트 연결

산출물:
- `letters.js`
- `router.jsx`
- `HomePage`
- `DetailPage`

## Milestone 3. 메인 다이얼 구현
목표:
- 회전형 다이얼 완성
- 클릭/탭/키보드 이동 가능

산출물:
- `LetterDial`
- `useDialRotation`
- 다이얼 스타일

## Milestone 4. Canvas 공통 엔진 구현
목표:
- 모든 스케치가 공유할 캔버스 래퍼 완성

산출물:
- `CanvasStage`
- `registry`
- `placeholderSketch`

## Milestone 5. 샘플 이니셜 작업 구현
목표:
- 최소 1~3개 이니셜에 대해 실제 인터랙티브 타이포그래피 제작

산출물:
- `A`, `B`, `C` 혹은 우선순위가 높은 글자 3개
- 설명 텍스트 초안

## Milestone 6. 배포 및 품질 점검
목표:
- GitHub Pages 배포 완료
- 링크 공유/새로고침/모바일 테스트 완료

산출물:
- 배포 workflow
- QA 체크 완료
- 공개 URL

---

## 23. 완료 기준(Definition of Done)

### 메인페이지
- A~Z가 원형으로 배치되어 있다
- 마우스/터치로 회전 가능하다
- 클릭 시 상세 페이지로 이동한다
- 시각적으로 신문 감성이 유지된다

### 세부페이지
- 이니셜/단어/설명/캔버스가 함께 표시된다
- Canvas 인터랙션이 정상 동작한다
- 모바일에서도 usable 하다
- 각 페이지 간 이동이 자연스럽다

### 구조/품질
- 데이터 구조가 A~Z 확장에 적합하다
- 공통 컴포넌트 분리가 잘 되어 있다
- GitHub Pages에서 접근/새로고침이 문제 없이 된다
- 최소 1~3개 실제 완성 스케치가 존재한다

---

## 24. GitHub Pages 배포 계획

### 권장 배포 방식
- GitHub Pages + GitHub Actions
- Vite build 결과물(`dist`) 배포

### 체크 포인트
1. 저장소 형태에 따라 `base` 설정 확인
2. GitHub Pages source는 Actions 사용
3. 정적 라우팅 환경에 맞는 router 전략 선택
4. 필요 시 custom 404 대응 검토

### `vite.config` 고려사항
- 프로젝트 페이지(`username.github.io/repo`)라면 `base: "/repo/"`
- 사용자 페이지(`username.github.io`) 또는 커스텀 도메인이면 `base: "/"` 또는 기본값 사용

### 권장 결론
현재 프로젝트는 **HashRouter + GitHub Actions + 적절한 Vite base 설정** 조합으로 먼저 완성하는 것이 가장 안정적이다.

---

## 25. 위험 요소 및 대응

### 위험 1. 26개 타이포그래피의 작업량 과다
대응:
- 공통 엔진 + placeholder 전략
- 우선 3개 내외만 완성도 있게 구현
- 이후 순차 확장

### 위험 2. 메인 다이얼 인터랙션이 복잡해짐
대응:
- 첫 버전은 관성/스냅을 단순화
- UX가 만족스러우면 후속 개선

### 위험 3. GitHub Pages 라우팅 이슈
대응:
- 초기부터 HashRouter 채택
- 필요 시 404 fallback 별도 추가

### 위험 4. 레트로 감성이 촌스럽게 보일 수 있음
대응:
- 텍스처 과용 금지
- 여백/타이포그래피/구분선 중심으로 절제
- “빈티지 효과”보다 “편집 디자인 완성도” 우선

### 위험 5. Canvas 성능 저하
대응:
- 단순한 렌더링부터 시작
- 모바일 복잡도 낮추기
- DPR/파티클 수 제한

---

## 26. 추후 결정해야 할 항목(TBD)

### 콘텐츠
- A~Z 각 단어 최종 확정
- 각 단어에 대한 설명 문안
- 각 이니셜의 시각 콘셉트 정의

### 디자인
- 정확한 종이 질감 표현 수위
- 포인트 컬러 사용 여부
- 헤더 장식 정보 수준

### 기술
- JS 유지 vs 점진적 TS 전환
- HashRouter 유지 vs BrowserRouter + 404 fallback
- 간단한 애니메이션 유틸 도입 여부

---

## 27. 추천 작업 우선순위

1. 기존 프로젝트 구조 정리
2. 전역 스타일/레이아웃 토큰 설계
3. A~Z 데이터 스키마 정의
4. 라우팅 구축
5. 메인 다이얼 구현
6. 상세 페이지 공통 레이아웃 구현
7. Canvas 공통 엔진 구현
8. 샘플 이니셜 1~3개 제작
9. QA 및 배포
10. A~Z 전체 확장

---

## 28. Codex에 바로 넣기 좋은 작업 단위 예시

### 작업 1
“Vite + React 프로젝트에서 레트로 신문 스타일의 개인 페이지 기본 레이아웃을 만들고 싶다.  
세리프 폰트 중심, 종이색 배경, 잉크색 텍스트, 상단 마스트헤드, 얇은 구분선을 포함한 기본 구조를 만들어줘.”

### 작업 2
“A~Z 26개의 이니셜을 원형으로 배치한 React 컴포넌트를 만들어줘.  
마우스 드래그와 터치로 회전할 수 있어야 하고, 각 이니셜은 클릭 시 상세 페이지로 이동해야 한다.”

### 작업 3
“React에서 HTML5 canvas를 감싸는 `CanvasStage` 컴포넌트를 만들어줘.  
resize, devicePixelRatio, requestAnimationFrame, pointer event 정규화를 처리해줘.”

### 작업 4
“A~Z 데이터를 관리할 수 있는 `letters.js` 또는 `letters.ts` 스키마를 만들어줘.  
각 항목은 letter, word, description, sketchKey, interactionHint, status를 포함해야 한다.”

### 작업 5
“GitHub Pages에 배포할 Vite 설정을 추가해줘.  
프로젝트 페이지 기준 `base` 설정과 GitHub Actions workflow 파일도 함께 만들어줘.”

### 작업 6
“세부 페이지에서 왼쪽엔 canvas, 오른쪽엔 설명 패널이 있는 반응형 레이아웃을 만들어줘.  
모바일에서는 세로 스택이 되도록 해줘.”

---

## 29. 최종 권장안 요약

이 프로젝트는 다음 전략으로 가는 것이 가장 안정적이다.

1. **메인 다이얼은 DOM 기반으로 구현**
2. **세부 작업만 Canvas 기반으로 구현**
3. **A~Z 전체는 데이터 구조로 관리**
4. **GitHub Pages를 고려해 초기에는 HashRouter 사용**
5. **모든 글자를 한 번에 완성하지 말고, 샘플 1~3개부터 완성**
6. **신문 감성은 효과보다 편집 구조, 폰트, 여백, 구분선으로 만든다**

---

## 30. 바로 실행할 첫 액션
가장 먼저 할 일은 아래 4가지다.

1. 기존 프로젝트에서 불필요한 스타일/컴포넌트 정리
2. `letters` 데이터 구조 생성
3. 홈/상세 라우트 생성
4. `LetterDial`과 `CanvasStage`의 최소 동작 버전 구현

이 4가지만 끝나도 전체 프로젝트 뼈대가 완성된다.
