# 변경 이력

연결 데이터의 릴리스입니다. 성취기준은 [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)에서 따로 릴리스되고, 이 리포의 `data/manifest.json` → `standards_release`가 어느 성취기준 릴리스에 고정돼 있는지 말합니다.

## v1.0.0 — 2026-09-06 · 스핀오프 첫 릴리스

- [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)에서 융합 연결을 분리해 독립 리포로. 성취기준은 공공재로 안정적으로 관리하고, AI가 만든 연결은 모델·정책이 바뀔 때마다 빠르게 갱신하기 위해서입니다.
- 성취기준 고정: `k-curriculum-2022@v3.0.0` (6,444건). 연결의 `source_code`·`target_code`는 그 릴리스의 `key`입니다.
- published **3,916** / candidate **11,758**. 게시 정책: quality ≥ 0.7, 전문교과끼리의 연결 제외, 재판정 기각(0.2) 제외.
- 2026-09-06 하루 동안 있었던 변화(분리 전 k-curriculum-2022 v2.0.0 → v2.1.0에 해당): 신규 성취기준 후보 1,413건 판정과 0.8 이상 208건 승격, 0.7대 405건 재판정과 59건 승격, 전문교과끼리 320건 강등, 제2외국어 27과목·스포츠 문화 대상 1,344쌍 판정과 34건 게시(16과목이 0 → 1건 이상), 초등 1~2학년군 통합교과 8건 게시.
- 검증: `scripts/fetch-standards.mjs`가 고정 릴리스의 성취기준을 내려받고 `scripts/validate.mjs`가 key 참조 무결성·정규화·점수·게시 정책·manifest 건수를 검사. GitHub Actions가 PR마다 실행.

이전 이력(성취기준과 함께 관리되던 시기)은 [k-curriculum-2022의 CHANGELOG](https://github.com/greatsong/k-curriculum-2022/blob/master/CHANGELOG.md)에 있습니다.
