# Z - Zzz 개발 보고서

## 1. 작업 개요

- 대상 파일: `src/animate-js/class/content_page/content.jsx`
- 대상 파일: `src/animate-js/class/content_page/content_item.jsx`
- 대상 파일: `src/animate-js/class/animate/z_zzz.jsx`
- 작업 일자: `2026-05-05`
- 현재 단계: Z 컨텐츠 전용 WebGL 렌더링 기반 추가
- 목표: 기존 컨텐츠는 2D canvas 렌더링을 유지하고, Z 컨텐츠만 WebGL context로 렌더링

## 2. 구현 방향

이번 단계에서는 지금까지 만든 Z 시각 요소를 버리고, 렌더링 기반부터 다시 구성했다.

핵심 방향은 아래와 같다.

- 기존 A~Y 컨텐츠는 기존처럼 `canvas.getContext('2d')` 사용
- Z 컨텐츠에는 `contextType: 'webgl'` 메타데이터 추가
- `content.jsx`에서 컨텐츠별 context type을 보고 `2d` 또는 `webgl` context 생성
- WebGL context로 전환될 때 같은 canvas에서 2D context가 재사용되지 않도록 canvas에 key 적용
- `z_zzz.jsx`는 WebGL shader와 vertex buffer를 직접 생성해 3D 장면 렌더링

## 3. 구현 내용

### 3.1 Context 분기

`content.jsx`는 기존에 항상 아래 방식으로 context를 만들었다.

```js
canvas.getContext('2d')
```

현재는 animation item의 `contextType`을 읽어 다음처럼 분기한다.

- `2d`: 기존과 동일하게 2D context 생성
- `webgl`: `webgl` 또는 `experimental-webgl` context 생성

2D 컨텐츠에서는 기존처럼 `clearRect()`를 호출한다.
WebGL 컨텐츠에서는 `clearRect()`를 호출하지 않고, 개별 WebGL animation이 `gl.clear()`와 `gl.viewport()`를 담당한다.

### 3.2 Canvas 재마운트 처리

브라우저 canvas는 한 번 2D context를 얻은 뒤 같은 canvas에서 WebGL context를 다시 얻을 수 없다.
그래서 `canvas`에 `key={`${articleCode}-${contextType}`}`를 추가했다.

이렇게 하면 2D 컨텐츠에서 Z 컨텐츠로 이동할 때 canvas DOM 노드가 새로 만들어지고, WebGL context를 안정적으로 얻을 수 있다.

### 3.3 Z WebGL 렌더러

`z_zzz.jsx`는 WebGL 전용 렌더러로 다시 작성했다.

현재 구성은 아래와 같다.

- vertex shader와 fragment shader 정의
- cube vertex buffer 생성
- 간단한 4x4 matrix 유틸 구현
- orthographic projection 구성
- 하나의 `Z` 외곽 폴리곤으로 앞면, 뒷면, 옆면을 가진 extruded mesh 생성
- 첫 번째 `Z`는 크게, 두 번째와 세 번째 `Z`는 같은 크기로 배치해 `Zzz` 구성
- 세 글자의 z축 extrusion 깊이는 크기와 무관하게 동일한 값 사용
- 각 글자는 좌우 폭을 좁힌 형태로 만들고, 세 글자 사이에는 약간의 간격을 둠
- 좁아진 Z에서 빗변이 과하게 두꺼워 보이지 않도록 대각 획 두께를 별도로 줄임
- pointer drag의 좌우 이동량을 Y축 회전값으로 누적해 마우스로 글씨 회전 가능

초기에는 직육면체 3개를 겹쳐 `Z`를 만들었기 때문에 빗변과 위아랫변이 만나는 부분이 끊겨 보였다.
현재는 한 글자 전체를 하나의 외곽 폴리곤으로 만들고, 그 폴리곤을 앞/뒤/옆면으로 extrude해서 더 매끄럽게 이어지도록 바꿨다.
이후 앞면과 뒷면이 이상하게 보이는 문제를 줄이기 위해, 오목한 `Z` 폴리곤을 단순 fan 방식이 아니라 ear clipping 방식으로 삼각분할하도록 수정했다.
또한 작은 `z`들이 크기에 비례해 얕아지지 않도록, 모든 글자가 같은 z축 depth를 공유하게 조정했다.

### 3.4 Y축 회전 인터랙션

Z 컨텐츠는 공통 pointer state를 그대로 받아 사용한다.
마우스가 눌린 동안 이전 pointer x와 현재 pointer x의 차이를 계산하고, 이 값을 `rotationY`에 누적한다.
누적된 값은 WebGL group matrix의 `rotateY()`에 더해져 글씨 전체가 Y축 기준으로 회전한다.

### 3.5 누워 있는 기본 자세

글자 형태 수치는 유지하고, group matrix의 기본 X축 회전 방향을 뒤로 젖혀지는 쪽으로 조정했다.
여기에 Y/Z 회전을 함께 적용해, 뒤로 누운 `Zzz`를 대각선 위에서 내려다보는 구도에 가깝게 맞췄다.

## 4. 변경 파일

- `src/animate-js/class/content_page/content.jsx`
- `src/animate-js/class/content_page/content_item.jsx`
- `src/animate-js/class/animate/z_zzz.jsx`
- `codex/report/CONTENT_Z.md`

## 5. 현재 상태

현재 상태는 아래와 같다.

- 기존 2D 컨텐츠는 그대로 2D context를 사용
- Z 컨텐츠만 WebGL context를 사용
- Z 화면에는 직육면체 조합으로 만든 3D `Zzz`가 렌더링됨
- WebGL shader, buffer, projection, depth test 기반이 들어간 상태
- 마우스 좌우 드래그로 `Zzz`를 Y축 기준 회전 가능

## 6. 다음 작업 추천

- WebGL `Zzz`의 카메라 각도와 깊이 방향 조정
- 직육면체 조합을 더 둥글거나 타이포그래피적인 mesh로 다듬기
- 모자, 이불, 수면 인터랙션을 WebGL 또는 2D overlay 중 어떤 방식으로 얹을지 결정
