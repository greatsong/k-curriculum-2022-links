# 추출 알고리즘

`data/links.*.json`을 만들어낸 **2단계 파이프라인**의 참조 구현입니다.

## 왜 2단계인가

교과 쌍을 통째로 LLM에 넣어 "연결을 나열하라"고 하면 두 가지가 무너집니다.
- **재현성**: 매번 다른 결과, 낮은 recall
- **코드 할루시네이션**: 존재하지 않는 성취기준 코드를 지어냄

그래서 후보 추출과 판정을 분리했습니다.

### 1단계 — 후보 추출 (결정적)
- 각 성취기준 `content`를 임베딩한 벡터의 **코사인 유사도**로 top-k 후보쌍을 뽑습니다.
- 순수 수치 연산이라 **결정적**이고 재현 가능합니다. 여기서 실측 유사도가
  `semantic_score`가 됩니다.

### 2단계 — LLM 판정 (코드 할루시네이션 차단)
- 후보쌍을 LLM에 넘기되, **성취기준을 "인덱스 번호"로만 참조**시킵니다.
  LLM은 코드를 생성할 수 없고 번호만 고르므로, 존재하지 않는 코드가 나올 수 없습니다.
- LLM은 각 후보의 교육적 타당성을 판정해 `quality_score`, `link_type`,
  `rationale`, `integration_theme`, `lesson_hook`을 생성합니다.
- `quality_score ≥ 0.70`만 게시(published) 대상으로 승격합니다(`promote-links.mjs`).

## 파일
- `generate-links.mjs` — 후보 추출 + LLM 판정 (메인)
- `promote-links.mjs` — quality_score 기준 상태 승격/강등 (Supabase 사용 시)

## 사전 준비

### 1) 성취기준
`vendor/standards.json` — 성취기준은 [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)에 있습니다. `node scripts/fetch-standards.mjs`로 manifest에 고정된 릴리스를 내려받으세요.

### 2) 임베딩 캐시 (직접 생성)
용량 문제로 임베딩은 리포에 포함하지 않습니다. 각 성취기준 `content`를 임베딩해
아래 형태의 JSON으로 만들어 `embeddings-cache.json`(또는 `EMBEDDINGS_FILE` 환경변수
경로)에 두세요.

```jsonc
{
  "embeddings": {
    "[4과01-01]": [0.0123, -0.0456, ...],   // 성취기준 content의 임베딩 벡터
    "[4수02-03]": [ ... ],
    ...
  }
}
```

임베딩 모델은 자유입니다(OpenAI `text-embedding-3-*`, 한국어 특화 모델 등).
차원만 일관되면 됩니다. 벡터는 스크립트가 로드 시 정규화합니다.

### 3) 환경변수
리포 루트에 `.env`를 두거나 셸 환경에 설정하세요(`.env.example` 참고).
```
ANTHROPIC_API_KEY=sk-ant-...        # 2단계 판정에 필요
EMBEDDINGS_FILE=./embeddings-cache.json   # 선택 (기본값도 동일)
# SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY  # 선택 (DB 적재/승격 시에만)
```

## 실행

```bash
npm install    # @anthropic-ai/sdk, @supabase/supabase-js, dotenv

# 1단계만 — 후보쌍 통계 (API 비용 없음)
node algorithm/generate-links.mjs --dry-run

# 스모크 — 2배치만 판정, 파일로 출력
node algorithm/generate-links.mjs --limit 2 --no-db

# 전체 — 판정 후 algorithm/output/ 에 JSONL 출력
node algorithm/generate-links.mjs --no-db
```

주요 옵션: `--top-k 6` `--min-cos 0.45` `--concurrency 3` `--batch-size 25`

> 참고: 원 프로젝트는 결과를 Supabase에 candidate로 적재하고 3계층 검토
> (candidate→reviewed→published)를 거쳤습니다. `--no-db`를 빼면 `SUPABASE_*`가
> 필요합니다. DB 없이도 `--no-db`로 파일 출력만으로 완결됩니다.

## 라이선스
코드 [MIT](../LICENSE).
