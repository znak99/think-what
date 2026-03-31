# Think-What — 디자인 시스템

> 다크모드 기반 모던 IT 스타일. 데스크탑 전용. Tailwind CSS만 사용.

---

## 핵심 방향

| 항목 | 결정 |
|------|------|
| 테마 | 다크모드 전용 |
| 액센트 컬러 | Neon Green |
| 캔버스 배경 | 다크 (칠판 느낌) |
| 카드 스타일 | Glassmorphism (backdrop-blur) |
| 애니메이션 | 풍부한 모션 (슬라이드, 페이드, 스케일) |
| 플랫폼 | 데스크탑 전용 |
| CSS 방식 | Tailwind CSS only |

---

## 컬러 팔레트

### 배경 계층

| 역할 | Tailwind 클래스 | Hex | 설명 |
|------|----------------|-----|------|
| 최하단 배경 | `bg-[#070a12]` | `#070a12` | 앱 전체 배경, 약한 청색 틴트 |
| 서피스 | `bg-[#0d1117]` | `#0d1117` | 패널, 사이드바 |
| 컨테이너 | `bg-[#161b22]` | `#161b22` | 카드, 입력 영역 내부 |
| 테두리 | `border-[#21262d]` | `#21262d` | 구분선, 카드 테두리 |

### 텍스트

| 역할 | Tailwind 클래스 | Hex |
|------|----------------|-----|
| 기본 텍스트 | `text-[#e6edf3]` | `#e6edf3` |
| 보조 텍스트 | `text-[#7d8590]` | `#7d8590` |
| 비활성 텍스트 | `text-[#484f58]` | `#484f58` |

### 액센트 — Neon Green

| 역할 | Tailwind 클래스 | Hex |
|------|----------------|-----|
| 기본 | `text-green-400` / `bg-green-400` | `#4ade80` |
| hover | `bg-green-300` | `#86efac` |
| 글로우 (shadow) | `shadow-[0_0_12px_#4ade80]` | — |
| 배경 틴트 | `bg-green-400/10` | — |

### 상태 컬러

| 상태 | Tailwind 클래스 | 용도 |
|------|----------------|------|
| 에러 | `text-red-400` / `bg-red-400/10` | 유효성 오류, 연결 끊김 |
| 성공/정답 | `text-green-400` | 정답 판정 메시지 |
| 경고 | `text-yellow-400` | 타이머 30초 이하 |
| 위험 | `text-red-500` | 타이머 10초 이하 |

---

## 타이포그래피

두 폰트를 역할에 따라 조합합니다.

| 폰트 | 사용처 | 이유 |
|------|--------|------|
| **Inter** | 버튼, 레이블, 채팅, 일반 UI | 가독성 높은 모던 산세리프 |
| **JetBrains Mono** | 타이머, 점수, 초성 표시, 랭크 수치 | 코드/터미널 느낌 → IT 감성 강조 |

### 타입 스케일

| 용도 | 클래스 |
|------|--------|
| 페이지 제목 (THINK-WHAT 로고) | `text-2xl font-bold tracking-widest` |
| 섹션 제목 | `text-sm font-semibold uppercase tracking-wider text-[#7d8590]` |
| 본문 | `text-sm` |
| 채팅 메시지 | `text-sm` |
| 타이머 / 초성 | `font-mono text-3xl font-bold` |
| 버튼 | `text-sm font-semibold` |

---

## 컴포넌트 스타일

### Glass 카드

인증 화면, 게임 패널 등 주요 컨테이너에 사용합니다.

```
bg-white/5 backdrop-blur-md border border-white/10 rounded-xl
```

포커스/활성 상태에서는 상단 또는 테두리에 액센트 컬러 라인을 추가합니다.

```
border-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.08)]
```

### 버튼

| 종류 | 클래스 |
|------|--------|
| 기본 (Primary) | `bg-green-400 hover:bg-green-300 text-black font-semibold rounded-lg transition-all duration-200` |
| 아웃라인 | `border border-green-400/50 text-green-400 hover:bg-green-400/10 rounded-lg transition-all duration-200` |
| 위험 | `border border-red-400/50 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200` |

### 입력 필드

```
bg-[#161b22] border border-[#21262d] rounded-lg text-[#e6edf3]
focus:outline-none focus:border-green-400/50 focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)]
transition-all duration-200
```

### 배경 패턴

앱 배경에 미세한 도트 그리드를 넣어 IT 감성을 강조합니다.

```css
/* tailwind.config.js의 backgroundImage에 추가 */
'dot-grid': 'radial-gradient(circle, #21262d 1px, transparent 1px)'
/* bg-dot-grid bg-[size:24px_24px] */
```

---

## 캔버스

### 배경

칠판 느낌의 다크 캔버스를 사용합니다.

| 항목 | 값 |
|------|-----|
| 캔버스 배경 | `#1c2128` |
| 캔버스 테두리 | `border border-[#21262d]` + 액센트 glow |
| 기본 펜 색상 | `#ffffff` (흰색, 칠판의 분필 느낌) |

### 펜 색상 팔레트

칠판 배경에 맞게 기본 색상도 조정합니다.

| 색상 | Hex | 이름 |
|------|-----|------|
| 흰색 (기본) | `#ffffff` | 흰색 |
| 빨간색 | `#f87171` | 빨간색 |
| 주황색 | `#fb923c` | 주황색 |
| 노란색 | `#fbbf24` | 노란색 |
| 초록색 | `#4ade80` | 초록색 |
| 파란색 | `#60a5fa` | 파란색 |
| 남색 | `#818cf8` | 남색 |
| 보라색 | `#c084fc` | 보라색 |

### 펜 글로우 효과

캔버스에 그릴 때 스트로크에 `shadowBlur` + `shadowColor`를 적용하여 은은한 발광 효과를 줍니다.

```ts
// Canvas 2D Context 설정 예시
ctx.shadowBlur = 8;
ctx.shadowColor = currentColor; // 현재 펜 색상과 동일
ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
```

- 기본 펜(흰색): `shadowColor: rgba(255,255,255,0.6)`, `shadowBlur: 6`
- 컬러 펜: `shadowColor: <penColor>`, `shadowBlur: 10`
- 지우개: glow 없음, `shadowBlur: 0`

---

## 애니메이션

### 원칙

- 전환은 빠르되 (150~300ms), 의미 있는 동작에는 충분한 시간 부여
- `ease-out` 위주 (빠르게 시작, 천천히 끝)
- 과도한 bounce는 지양, 자연스러운 느낌

### 트랜지션 기준

| 상황 | duration | easing |
|------|----------|--------|
| 버튼 hover, 포커스 | `150ms` | `ease-out` |
| 모달/카드 등장 | `200ms` | `ease-out` |
| 페이지 전환 | `250ms` | `ease-in-out` |
| 알림 메시지 (정답 등) | `300ms` | `ease-out` |
| 타이머 색상 전환 | `500ms` | `ease-in-out` |

### 주요 모션 항목

| 요소 | 애니메이션 |
|------|-----------|
| 페이지 진입 | `opacity-0 → opacity-100` + `translate-y-2 → translate-y-0` |
| 카드 등장 | `scale-95 → scale-100` + `opacity-0 → opacity-100` |
| 채팅 메시지 추가 | 아래에서 슬라이드인 (`translate-y-2 → translate-y-0`) |
| 정답 판정 배너 | 위에서 슬라이드인 + 초록색 glow 펄스 |
| 출제자 지정 알림 | 중앙 팝인 (`scale-90 → scale-100`) |
| 3초 카운트다운 | 숫자 크게 스케일인/아웃 |
| 타이머 30초 이하 | 노란색으로 색상 전환 |
| 타이머 10초 이하 | 빨간색 + 숫자 미세 흔들림 (`animate-pulse`) |
| 랭크 배지 hover | 살짝 스케일업 + glow 강조 |
| 투표 버튼 클릭 | 물결 ripple 효과 |

---

## 랭크 배지

다이아몬드 `⬥` 모양의 SVG 또는 회전된 사각형을 사용합니다.

| 랭크 | 배지 색상 | Hex | glow |
|------|----------|-----|------|
| 1등급 | 검은색 | `#374151` | 없음 |
| 2등급 | 갈색 | `#92400e` | `shadow-[0_0_6px_#92400e]` |
| 3등급 | 은색 | `#94a3b8` | `shadow-[0_0_6px_#94a3b8]` |
| 4등급 | 금색 | `#fbbf24` | `shadow-[0_0_10px_#fbbf24]` |
| 5등급 | 에메랄드 | `#34d399` | `shadow-[0_0_14px_#34d399]` |
| 6등급 | 무지개 | CSS animation | `animation: rainbow-glow` |

### 무지개 그라디언트 애니메이션

```css
/* tailwind.config.js의 keyframes에 추가 */
'rainbow': {
  '0%, 100%': { filter: 'hue-rotate(0deg) drop-shadow(0 0 6px currentColor)' },
  '50%': { filter: 'hue-rotate(360deg) drop-shadow(0 0 12px currentColor)' },
}
```

---

## Tailwind 설정 요약

`tailwind.config.js`에 추가해야 할 커스텀 항목들입니다.

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    backgroundImage: {
      'dot-grid': 'radial-gradient(circle, #21262d 1px, transparent 1px)',
    },
    backgroundSize: {
      'dot-grid': '24px 24px',
    },
    keyframes: {
      'rainbow': {
        '0%, 100%': { filter: 'hue-rotate(0deg)' },
        '50%': { filter: 'hue-rotate(360deg)' },
      },
      'pulse-glow': {
        '0%, 100%': { boxShadow: '0 0 8px rgba(74, 222, 128, 0.4)' },
        '50%': { boxShadow: '0 0 20px rgba(74, 222, 128, 0.8)' },
      },
    },
    animation: {
      'rainbow': 'rainbow 3s linear infinite',
      'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    },
  },
},
```
