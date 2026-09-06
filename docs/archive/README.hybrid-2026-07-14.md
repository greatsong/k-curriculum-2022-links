# k-curriculum-2022

**2022 개정 교육과정 성취기준 + 교과 간 융합 연결 그래프 (오픈 데이터셋)**
Korean 2022 National Curriculum: achievement standards & cross-subject fusion links.

[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg)](./LICENSE-DATA)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

한국 2022 개정 교육과정의 **성취기준 5,665개**와, 서로 다른 교과의 성취기준을 잇는
**융합 연결 3,452개**(+ 후보 9,149개)를 담은 데이터셋입니다. 연결은 임베딩 후보 추출 →
LLM 판정의 2단계 파이프라인으로 생성했으며, 그 알고리즘도 함께 공개합니다.

융합(교과 통합) 교육에 조금이라도 도움이 되었으면 하는 마음에 작업한, **저의 첫 오픈소스
프로젝트**입니다.

> **EN.** An open dataset of 5,665 achievement standards from South Korea's 2022 National
> Curriculum and 3,452 curated cross-subject "fusion" links (+9,149 candidates), built with
> a two-stage pipeline (embedding retrieval → LLM judgment). Data: CC BY 4.0. Code: MIT.

> 📖 **이 프로젝트가 왜, 어떤 생각으로 만들어졌고 어디로 가려는지** — 그리고 교육부 원문을
> 파싱하며 겪은 이야기와 차기 교육과정 데이터에 대한 제언은 **[docs/NARRATIVE.md](./docs/NARRATIVE.md)** 에 담았습니다.

---

## 목차

- [개요](#개요)
- [구성](#구성)
- [설치 / 다운로드](#설치--다운로드)
- [사용법](#사용법)
- [데이터 명세](#데이터-명세)
- [생성 방법](#생성-방법)
- [한계](#한계)
- [로드맵](#로드맵)
- [기여](#기여)
- [라이선스](#라이선스)
- [인용](#인용)
- [출처 및 감사](#출처-및-감사)

## 개요

| 항목 | 값 |
|------|-----|
| 성취기준 | 5,665개 (275개 과목, 초·중·고 + 전문교과) |
| 게시 연결(`published`) | 3,452개 (quality_score ≥ 0.70, 평균 0.83) |
| 후보 연결(`candidate`) | 9,149개 (미검토) |
| 연결 유형 | cross_subject · same_concept · application · prerequisite · extension |
| 포맷 | JSON (UTF-8) |
| 라이선스 | 데이터 CC BY 4.0 / 코드 MIT |

> "지금 이 결과물은 작은 눈 뭉치라고 생각합니다. 많은 분들의 참여와 AI의 발전을 통해
> 이 눈 뭉치가 멋진 눈사람이 되길 소망합니다." — [프로젝트 이야기](./docs/NARRATIVE.md)

## 구성

| 경로 | 설명 |
|------|------|
| `data/standards.json` | 성취기준 5,665개 |
| `data/links.published.json` | 검토·정제된 융합 연결 3,452개 |
| `data/links.candidate.json` | AI 제안 연결 9,149개 (미검토) |
| `data/DATACARD.md` | 데이터 카드 (필드·생성법·한계) |
| `algorithm/` | 추출 파이프라인 참조 구현 (+ `algorithm/README.md`) |
| `scripts/validate.mjs` | 무결성 검증 스크립트 |
| `examples/` | 사용 예제 |
| `docs/NARRATIVE.md` | 배경·아이디어·상세 명세·파싱 이야기·제언 |

## 설치 / 다운로드

```bash
git clone https://github.com/greatsong/k-curriculum-2022.git
cd k-curriculum-2022
```

데이터만 필요하면 `data/*.json`을 직접 내려받아 쓰면 됩니다(런타임 의존성 없음).

## 사용법

```js
import standards from './data/standards.json' assert { type: 'json' }
import links from './data/links.published.json' assert { type: 'json' }

// 특정 성취기준과 융합 가능한 상대 교과 성취기준 찾기
const code = '[6실05-05]'
const byCode = Object.fromEntries(standards.map(s => [s.code, s]))
const partners = links
  .filter(l => l.source_code === code || l.target_code === code)
  .map(l => {
    const other = l.source_code === code ? l.target_code : l.source_code
    return { code: other, subject: byCode[other]?.subject, theme: l.integration_theme }
  })
console.log(partners)
```

```bash
node examples/find-fusion-partners.mjs "[6실05-05]"   # 실행 예제
node scripts/validate.mjs                              # 무결성 검증
```

## 데이터 명세

**성취기준** (`standards.json`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `code` | string | 성취기준 코드(고유 식별자). 예: `[4과01-01]` |
| `subject` / `subject_group` | string | 과목 / 교과(군) |
| `grade_group` | string | `초1-2` `초3-4` `초5-6` `중1-3` `고공통` `고선택` `기타` |
| `school_level` | string | `초등학교` `중학교` `고등학교` (일부 빈 값) |
| `curriculum_category` | string | `공통` `선택` 등 |
| `content` | string | 성취기준 본문 |
| `keywords` | string[] | 키워드 |
| `explanation` | string | 해설 (있는 경우) |
| `application_notes` | string | 적용 시 고려사항 (있는 경우) |

**융합 연결** (`links.*.json`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `source_code` / `target_code` | string | 연결된 두 성취기준 (`source_code < target_code` 정규화) |
| `link_type` | string | cross_subject / same_concept / application / prerequisite / extension |
| `rationale` | string | 연결 근거 |
| `integration_theme` | string | 융합 주제 |
| `lesson_hook` | string | 수업 아이디어 한 줄 |
| `semantic_score` | number | 임베딩 코사인 유사도 (0–1) |
| `quality_score` | number | LLM 판정 품질 (0–1) |
| `generation_method` | string | 생성 방법 (주로 `ai`) |

전체 규격은 [`data/DATACARD.md`](./data/DATACARD.md) 참고.

## 생성 방법

2단계 파이프라인. 실행 코드는 [`algorithm/`](./algorithm), 실행법은
[`algorithm/README.md`](./algorithm/README.md).

1. **후보 추출 (결정적)** — 성취기준 `content` 임베딩의 코사인 유사도로 top-k 후보쌍 추출.
   실측 유사도가 `semantic_score`.
2. **LLM 판정** — 후보를 *인덱스로만* 참조시켜(코드 할루시네이션 차단) 교육적 타당성을
   판정하고 `link_type`·`quality_score`·`rationale`·`integration_theme`·`lesson_hook` 생성.
3. **게시 정책** — `quality_score ≥ 0.70`만 `published`.

> 설계 배경, 사람을 위한 직관적 설명, 그리고 재현·확장을 위한 **불변식·파라미터·프로토콜
> 상세 명세**는 [docs/NARRATIVE.md](./docs/NARRATIVE.md)에 있습니다.

## 한계

- 모든 연결은 **AI 생성**이며, `published`에도 부적절한 연결이 있을 수 있습니다.
- `candidate`는 **미검토**로 품질 편차가 큽니다.
- 성취기준 본문에 파싱 잔존 손상(특히 `explanation`)이 남아 있을 수 있습니다.
- 1~2학년군은 국어·수학 2개 교과만 존재합니다.
- 전체 목록: [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md). 원문 파싱이 왜 어려웠는지는
  [docs/NARRATIVE.md의 파싱 난점](./docs/NARRATIVE.md#부록--교육부-원문-데이터의-파싱-난점) 참고.

## 로드맵

커버리지 확장(특히 1~2학년군) · candidate 검토 승격 · 억지 연결 교정 · 모델 갱신 후
재생성 · 표준 포맷(JSON-LD/CSV/그래프DB) export.
상세: [docs/NARRATIVE.md](./docs/NARRATIVE.md#왜--어떤-아이디어로--어디로) / 이슈.

## 기여

오류 신고·PR 환영합니다(오타 수정부터 알고리즘 개선까지). 데이터 수정 규칙과 검증
방법은 [`CONTRIBUTING.md`](./CONTRIBUTING.md), 오류 신고는 [이슈 템플릿](../../issues/new/choose).

## 라이선스

- **데이터** (`data/`): [CC BY 4.0](./LICENSE-DATA). 성취기준 원문의 저작권 원천은
  교육부(2022 개정 교육과정 고시)이며, 재이용 시 교육부 출처를 함께 표기해 주세요.
- **코드** (`algorithm/`, `examples/`, `scripts/`): [MIT](./LICENSE).

## 인용

```bibtex
@misc{song_k_curriculum_2022,
  title  = {k-curriculum-2022: Korean 2022 National Curriculum Achievement
            Standards and Cross-Subject Fusion Links},
  author = {Song, Sukree},
  year   = {2026},
  url    = {https://github.com/greatsong/k-curriculum-2022},
  note   = {Data: CC BY 4.0}
}
```

[`CITATION.cff`](./CITATION.cff) 참고.

## 출처 및 감사

- 성취기준 원문: 교육부 고시 제2022-33호 「초·중등학교 교육과정」, 국가교육과정정보센터
  (NCIC) <https://ncic.re.kr>.
- 이 데이터셋은 융합수업 설계 플랫폼 **curriculum-weaver** 프로젝트에서 추출·정리되었습니다.

<sub>차기 교육과정 데이터에 드리는 제언은 <a href="./docs/NARRATIVE.md#차기-교육과정-데이터에-드리는-제언-초안">docs/NARRATIVE.md</a>에 있습니다.</sub>
