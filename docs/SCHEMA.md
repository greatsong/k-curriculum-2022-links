# 데이터 스키마 (연결 리포 schema v1)

`data/manifest.json`의 `schema_version`이 이 문서의 버전과 같아야 합니다. 성취기준 필드는 [k-curriculum-2022의 SCHEMA](https://github.com/greatsong/k-curriculum-2022/blob/master/docs/SCHEMA.md)를 보세요.

## 파일

| 파일 | 내용 | 정렬 |
|---|---|---|
| `data/links.published.json` | 게시 기준을 통과한 융합 연결 | `source_code`+`target_code` |
| `data/links.candidate.json` | AI가 제안했으나 게시 기준에 못 미친 연결 | 위와 같음 |
| `data/manifest.json` | 스키마 버전 · 고정된 성취기준 릴리스 · 출처 커밋 · 건수 · 게시 정책 | — |
| `vendor/standards.json` | (커밋 안 함) `scripts/fetch-standards.mjs`가 받아 오는 고정 릴리스의 성취기준 | — |

정렬이 고정돼 있어 두 릴리스를 `diff`로 비교할 수 있습니다.

## 융합 연결 (`links.*.json`)

| 필드 | 형 | 설명 |
|---|---|---|
| `source_code` | string | 성취기준 **`key`**. 항상 `source_code < target_code` (유니코드 사전순) |
| `target_code` | string | 성취기준 **`key`** |
| `link_type` | string | `cross_subject` 같은 현상을 다른 관점으로 · `same_concept` 본질적으로 같은 개념 · `application` 한쪽 개념을 다른 쪽에 적용 · `prerequisite` 선수학습 · `extension` 심화·확장 |
| `rationale` | string | 교사용 근거 2~3문장. 어떤 수업 활동으로 이어지는지 |
| `integration_theme` | string | 융합 주제 한 구절 |
| `lesson_hook` | string | 수업 아이디어 한 문장 |
| `semantic_score` | number | 두 본문 임베딩의 코사인 유사도 (0~1, 실측). 후보 추출에 쓴 값 |
| `quality_score` | number | LLM이 판정한 교육적 품질 (0~1). 0.9 이상 바로 수업 가능, 0.7대 좋은 연결, 0.6 이하 쓸 만한 정도 |
| `generation_method` | string | `ai` |

`prerequisite`·`extension`은 방향이 의미입니다. 저장은 `source < target`로 정규화하므로 **방향은 `rationale`에서 읽으세요**.

### 끝점은 왜 `code`가 아니라 `key`인가

성취기준 코드가 두 과목에 겹치는 11건([12심독01-01~02-04], [12스문01-01~03]) 때문에 성취기준 리포의 고유 식별자는 `key`입니다(겹치지 않는 6,433건은 `key === code`). 연결과 성취기준을 조인할 때 `key`로 맞추세요. 고정된 릴리스는 `manifest.standards_release.tag`에 있고, `scripts/fetch-standards.mjs`가 그 태그의 `standards.json`을 `vendor/`에 받아 옵니다.

## manifest

```jsonc
{
  "schema_version": 1,
  "generated_at": "…",
  "source": { "app": "greatsong/curriculum-weaver", "commit": "…", "table": "supabase curriculum_links" },
  "standards_release": { "repo": "greatsong/k-curriculum-2022", "tag": "v3.0.0", "standards": 6444 },
  "counts": { "links_published": 3916, "links_candidate": 11758 },
  "policy": {
    "published_min_quality": 0.7,            // 0.7 미만이면 published에 없음
    "published_excludes_vocational_pairs": true,  // 양쪽 모두 산업수요 전문교과면 candidate에만
    "vocational_subject_group": "산업수요전문",
    "candidate_excludes_rejected": true       // 재판정 기각(원본 점수 0.2)은 candidate에도 없음
  }
}
```

## 커버리지 (2026-09-06)

published 연결이 하나 이상 붙은 성취기준은 2,570건(40%)입니다.

| 학교급 | 연결 있음 / 전체 |
|---|---|
| 초등 1-2학년군 | 29 / 100 (29%) |
| 초등 3-4학년군 | 70 / 231 (30%) |
| 초등 5-6학년군 | 117 / 280 (42%) |
| 중학교 | 385 / 714 (54%) |
| 고등 공통 | 144 / 266 (54%) |
| 고등 선택 | 1,672 / 2,860 (58%) |
| 산업수요 전문교과 | 153 / 1,993 (8%) |

연결 유형: same_concept 957 · cross_subject 888 · application 840 · prerequisite 659 · extension 572. 품질: 0.9 이상 323 · 0.8대 3,289 · 0.7대 304. 연결이 없는 보통교과 12과목은 [KNOWN_ISSUES 4번](../KNOWN_ISSUES.md).
