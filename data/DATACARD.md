# 데이터 카드 (Data Card) — 융합 연결

"무엇을 위해 만들었고 무엇에 쓰면 안 되는가"를 적습니다. 필드 정의는 [docs/SCHEMA.md](../docs/SCHEMA.md), 변경 이력은 [CHANGELOG.md](../CHANGELOG.md), 건수·정책·고정된 성취기준 릴리스의 정본은 [manifest.json](./manifest.json)입니다.

## 개요

2022 개정 교육과정 성취기준 사이에서 서로 다른 교과를 융합 관점으로 잇는 연결. 융합(교과 통합) 수업 설계와 교육과정 지식 그래프 연구를 위한 데이터셋. 성취기준 자체는 [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)(v3.0.0에 고정).

| 파일 | 항목 수 | 설명 |
|------|--------|------|
| `links.published.json` | 3,916 | 게시 기준을 통과한 융합 연결 (`quality_score` ≥ 0.70) |
| `links.candidate.json` | 11,758 | AI가 제안했으나 미검토인 연결 |
| `manifest.json` | — | 스키마 버전(1), 고정된 성취기준 릴리스, 출처 커밋, 건수, 게시 정책 |

## 의도된 용도

- 교사가 한 성취기준에서 출발해 다른 교과의 연결 상대와 그 근거·수업 아이디어를 찾는 일
- 교육과정을 그래프로 다루는 연구 — 교과 간 거리, 학교급 간 계열성, 융합 주제 분포
- 성취기준 추천 기능을 만드는 에듀테크 개발

## 이렇게 쓰지 마세요

- **연결을 "교육부가 정한 관계"로 읽지 마세요.** 연결은 전부 AI가 판정한 것이고 근거는 `rationale`에 있습니다. 교육과정 문서에는 이런 연결이 없습니다.
- **`candidate`를 게시 연결처럼 쓰지 마세요.** 미검토이고 품질 편차가 큽니다.
- **`code`로 조인하지 마세요.** 끝점은 성취기준의 `key`입니다.
- **다른 성취기준 릴리스와 섞지 마세요.** `manifest.standards_release.tag`의 릴리스에서만 key가 보장됩니다.

## 생성 방법

2단계 파이프라인. ① 성취기준 본문 임베딩의 코사인 유사도로 후보쌍을 결정적으로 추출(과목쌍별 상위 N쌍 보장 모드 포함) → ② LLM(claude-sonnet-5)이 후보를 번호로만 참조해 교육적 타당성을 판정하고 품질 점수·유형·근거·융합 주제·수업 아이디어를 생성. 판정 지침은 교과 특성(외국어·초등 통합교과)에 따라 덧붙입니다. 코드는 [`../algorithm/`](../algorithm), 명세는 [docs/NARRATIVE.md](../docs/NARRATIVE.md).

**게시 정책** — `quality_score` ≥ 0.70만 published. 양쪽 모두 산업수요 전문교과인 연결은 서비스 대상(일반계 고등학교)에 맞지 않아 candidate에 둡니다. 재판정에서 떨어진 연결은 candidate에도 싣지 않습니다.

## 한계 (요약 — 전체는 [KNOWN_ISSUES.md](../KNOWN_ISSUES.md))

- 모든 연결은 AI 생성 — published에도 억지 연결이 남아 있을 수 있습니다. 무작위 표본과 유사도 최하위 꼬리를 사람이 읽어 확인했지만 전수는 아닙니다.
- 커버리지가 고르지 않습니다(40%). 고등 선택과목에 두껍고 초등 저학년·제2외국어 회화·산업수요 전문교과에 얇습니다.
- 회화 과목처럼 성취기준이 순수 기능 서술인 경우 특정 상대와의 연결이 게시 기준(0.8 자동 승격)에 오르지 않습니다.

## 무결성 검증

```bash
node scripts/fetch-standards.mjs && node scripts/validate.mjs
```

고정 릴리스 성취기준 건수, key 참조 무결성(dangling), 정규화, 점수 범위, `link_type`, published 필수 필드·최소 품질, manifest 건수를 검사합니다. PR마다 GitHub Actions가 같은 검사를 돌립니다.

## 라이선스

연결 데이터 [CC BY 4.0](../LICENSE-DATA)(저작: greatsong). 성취기준 원문의 저작권 원천은 교육부이며 [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)의 표기를 따릅니다. 코드 [MIT](../LICENSE).
