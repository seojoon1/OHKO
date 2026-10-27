# OHKO

포켓몬 챔피언스 데미지 계산기입니다.
내 포켓몬과 상대 포켓몬을 설정하면 서로의 기술이 몇 %의 데미지를 주는지, 한 방에 쓰러지는지 계산합니다.
상대 세팅은 현역 사용률 통계로 자동으로 채울 수 있습니다.

## 주요 기능

- **1대1 계산** – 내 포켓몬과 상대의 기술 데미지를 양방향으로 계산 (데미지 %, 확정/난수 n타)
- **통계 기반 상대 세팅** – 상대를 고르면 통계 상위 성격·특성·도구·능력 포인트·기술이 채워지고, 모두 수정 가능
- **상위권 내구 체크** – 사용률 상위 20마리, 직접 고른 포켓몬, 직접 입력한 상대의 공격을 버티는지 한 번에 확인
- **세부 조건** – 능력 포인트(능력치당 32, 합계 66), 랭크(-6~+6), 남은 HP, 날씨, 싱글/더블(범위기 0.75배), 메가진화
- **내구 수치** – 물리내구(H × B), 특수내구(H × D)
- **사용률 순위 / 포켓몬별 통계** – 기술·도구·특성·성격·능력 포인트·동료 Top 10
- **한글 검색** – 포켓몬·기술·도구·특성·성격을 한글과 초성으로 검색 (예: `ㅎㅋㄹ` → 한카리아스)
- **날씨 배경** – 날씨에 따라 배경과 비·눈·모래 입자 효과가 바뀜

## 기술 스택

- [React Router](https://reactrouter.com/) (Framework mode, SSR) · React 19 · TypeScript
- Vite · Tailwind CSS v4
- [@smogon/calc](https://github.com/smogon/damage-calc) – 데미지 계산 (챔피언스 모드)
- [tsParticles](https://particles.js.org/) – 날씨 입자 효과

## 시작하기

Node.js **22.23.4 / 24.22.1 / 26.12.1 이상**이 필요합니다.
이보다 낮은 버전은 2026-10-21 보안 업데이트 전 버전입니다. 이 앱은 외부 API의 Brotli 응답을 압축 해제하므로 CVE-2026-111497(Brotli RCE)에 해당합니다.

```bash
npm install
npm run dev
```

개발 서버는 http://localhost:5173 에서 열립니다.

### 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (HMR) |
| `npm run build` | 운영 빌드 (`build/`) |
| `npm start` | 운영 빌드 실행 (기본 포트 3000) |
| `npm run typecheck` | 라우트 타입 생성 + 타입 검사 |
| `npm run fetch:names` | PokéAPI에서 한글 이름을 받아 `data/*.json` 갱신 |
| `npm run build:calc-data` | `@smogon/calc`에서 화면용 데이터 `data/champions.json` 생성 |

`data/` 폴더의 JSON은 저장소에 포함되어 있어 평소에는 다시 만들 필요가 없습니다.
`@smogon/calc` 버전을 올리면 `build:calc-data`를, 이름 데이터를 갱신하려면 `fetch:names`를 실행하세요.

## 화면과 경로

| 경로 | 내용 |
|---|---|
| `/` | 계산기 – 탭: 1대1 / 상위 20위 / 자동 샘플 / 사용자 지정 |
| `/ranking` | 사용률 순위 |
| `/pokemon/:id` | 포켓몬별 상세 통계 |
| `/api/opponent/:name` | 포켓몬 하나의 통계 상위 세팅 (JSON) |
| `/api/opponents` | 사용률 상위 20마리의 세팅 (JSON) |

모든 경로는 `?format=Singles` 또는 `?format=Doubles`로 싱글/더블을 고릅니다 (기본 싱글).

## 프로젝트 구조

```
app/
├── routes/        # 페이지와 API 경로
├── components/    # 입력 폼, 결과 표, 날씨 배경 등
├── hooks/         # 검색, 계산기 지연 로딩, 상대 세팅 불러오기
├── lib/
│   ├── damage.ts            # 데미지 계산 (@smogon/calc 챔피언스 모드)
│   ├── champions.server.ts  # 통계 API 클라이언트 (서버 전용, 1시간 캐시)
│   ├── opponents.server.ts  # 통계로 상대 세팅 만들기
│   ├── championsData.ts     # 화면용 목록·메가 데이터
│   ├── names.ts / hangul.ts # 한글 이름 변환, 초성 검색
│   └── verdict.ts           # 확정/난수 n타 판정
├── types/
└── entry.server.tsx         # 보안 헤더 (CSP는 운영 빌드에만)
data/              # 한글 이름, 화면용 챔피언스 데이터 (스크립트로 생성)
scripts/           # 데이터 생성 스크립트
```

## 계산 방식 메모

- 데미지는 `@smogon/calc`의 챔피언스 모드(gen 0)로 계산합니다. 레벨 50 고정, 노력치/개체값 대신 능력 포인트를 씁니다.
- 통계는 폼(일반/메가)과 물리형/특수형을 합쳐 집계하므로, 통계로 상대 세팅을 만들 때는 기술마다 보정합니다.
  - 기술: 폼의 공격/특공 중 높은 쪽 기술 우선
  - 성격·능력 포인트: 그 기술의 공격 능력치를 깎지 않는/올리는 통계 상위 값
  - 도구가 메가스톤이면 메가 폼과 그 특성으로 계산
- 통계 기반 세팅은 추정입니다. 정확한 세팅은 직접 입력하세요.

## 배포

### Docker

```bash
docker build -t ohko .
docker run -p 3000:3000 ohko
```

컨테이너는 root가 아닌 `node` 사용자로 실행되고, `.env`·`.git`·`.cache`는 이미지에 들어가지 않습니다.

### 직접 실행

```bash
npm run build
npm start
```

`build/`, `package.json`, `package-lock.json`, 운영 의존성(`npm ci --omit=dev`)이 필요합니다.

## 데이터 출처

- 배틀 통계: [Pokémon Champions Battle Data](https://championsbattledata.com/)
  - 공개 서비스에서는 출처 표기가 필요하며, 데이터를 그대로 재배포하는 미러로 쓰면 안 됩니다 ([이용 규칙](https://championsbattledata.com/api-rules/)).
  - 응답은 서버 메모리에 1시간 캐시합니다.
- 한글 이름: [PokéAPI](https://pokeapi.co/) (빌드 전에 한 번 받아 `data/`에 저장, 실행 중에는 호출하지 않음)
- 데미지 계산: [@smogon/calc](https://github.com/smogon/damage-calc)

포켓몬과 관련 이름의 권리는 Nintendo, Creatures, GAME FREAK, The Pokémon Company에 있습니다. 이 프로젝트는 공식 서비스와 관계가 없습니다.

---

made by [seojoon1](https://github.com/seojoon1)
