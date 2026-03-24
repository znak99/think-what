# Think-What

> 초성 맞추기 드로잉 게임 — 캐치마인드 변형

그림을 보고 **초성**만 맞추면 되는 실시간 드로잉 게임입니다.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | React + TypeScript |
| Backend | FastAPI (Python) |
| DB | MySQL |
| 실시간 통신 | WebSocket |
| 컨테이너 | Docker + docker-compose |
| 배포 | AWS EC2 |

## 프로젝트 구조

```
think-what/
├── frontend/    # React + TypeScript
├── backend/     # FastAPI + Python
├── docker/      # docker-compose, Dockerfile
├── docs/        # 프로젝트 문서
├── .gitignore
└── README.md
```

## 문서

- [앱 컨텍스트](docs/01_AppContext.md) — 기능 명세, 랭크 시스템, 설계 결정 사항

## 브랜치 전략

| 브랜치 | 역할 |
|--------|------|
| `main` | 배포 브랜치 (AWS EC2) |
| `develop` | 개발 통합 브랜치 |
| `feature/[area]/[name]` | 기능 개발 |
| `hotfix/[name]` | 긴급 수정 |

## 커밋 컨벤션

```
<type>(<scope>): <subject>

type: feat | fix | refactor | style | test | chore | docs | perf
scope: auth | game | ws | rank | infra | db | ui
```

## 시작하기

```bash
# 개발 환경 실행 (Docker)
docker-compose up -d
```

> 상세 설정은 추후 추가 예정
