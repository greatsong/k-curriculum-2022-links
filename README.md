# k-curriculum-2022-links

> **2022 개정 교육과정 성취기준 사이의 교과 간 융합 연결 — AI가 후보를 판정하고, 근거·융합 주제·수업 아이디어를 붙인 그래프**
> [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)(성취기준)의 스핀오프 · [English README](./README.en.md)

[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg)](./LICENSE-DATA)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](./LICENSE)
[![validate links](https://github.com/greatsong/k-curriculum-2022-links/actions/workflows/validate.yml/badge.svg)](https://github.com/greatsong/k-curriculum-2022-links/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/greatsong/k-curriculum-2022-links)](https://github.com/greatsong/k-curriculum-2022-links/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

한국 2022 개정 교육과정의 성취기준 6,444개 사이에서, 서로 다른 교과의 성취기준을 융합 관점으로 잇는 연결 3,916개(게시)와
11,758개(후보)를 담은 데이터셋입니다. 연결마다 왜 이어지는지의 근거, 융합 주제, 수업 아이디어 한 줄이 붙어 있습니다. 연결을 만들어낸 추출
알고리즘도 함께 공개합니다.

성취기준 자체는 이 리포에 없습니다.
[k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)에서 따로 관리되고, 이 리포의
연결은 그 리포의 특정 릴리스(`data/manifest.json` → `standards_release`)에 고정됩니다. 성취기준은 교육부 원문
그대로라 느리게 바뀌는 공공재이고, 연결은 AI가 만들어 모델과 정책에 따라 자주 바뀌기 때문에 나눴습니다.

교사·연구자·에듀테크 개발자가 융합(교과 통합) 교육을 하는 데 조금이라도 도움이 되었으면 하는 마음에 작업한 결과물을, 저의 첫 오픈소스 프로젝트로
공개합니다.

## 이 데이터로 할 수 있는 것

- **교사** — 자신의 교과 성취기준 하나를 선택하면, 다른 교과 성취기준 중 한 수업으로 연결되는 항목과 그 근거, 융합 주제, 수업 아이디어를 바로 확인할 수 있습니다.
- **연구자** — 성취기준을 점, 연결을 선으로 구성한 그래프입니다. 교과 간 거리, 학교급 간 계열성, 융합 주제의 분포를 계산할 수 있습니다.
- **개발자** — JSON 두 파일과 고정된 성취기준 파일만 있으면 됩니다. 정렬이 고정되어 있어 릴리스 간 차이를 `diff`로 확인할 수 있습니다.

## 데이터 · Data

| 파일 | 내용 | 규모 |
|------|------|------|
| [`data/links.published.json`](./data/links.published.json) | 게시 기준을 통과한 융합 연결 | **3,916개** (quality ≥ 0.70, 평균 0.83) |
| [`data/links.candidate.json`](./data/links.candidate.json) | AI가 제안했으나 미검토인 연결 | **11,758개** (0.7대 4,495 · 품질 편차 큼) |
| [`data/manifest.json`](./data/manifest.json) | 고정된 성취기준 릴리스 · 출처 커밋 · 건수 · 게시 정책 | schema v1 |
| [`llms.txt`](./llms.txt) | AI 에이전트용 진입점 | |

**고정된 성취기준**: `k-curriculum-2022@v3.0.0` (6,444건). 연결의 `source_code`·`target_code`는 그 릴리스의 **`key`** 입니다(`code`가 아닙니다 — 같은 코드가 두 과목에 쓰인 11건 때문). 필드 하나하나의 뜻은 [docs/SCHEMA.md](./docs/SCHEMA.md), 용도와 한계는 [data/DATACARD.md](./data/DATACARD.md)에 있습니다.

## 빠른 시작 · Quick start

```bash
git clone https://github.com/greatsong/k-curriculum-2022-links.git
cd k-curriculum-2022-links
node scripts/fetch-standards.mjs                       # 고정된 성취기준 릴리스를 vendor/에 받음
node examples/find-fusion-partners.mjs "[6실05-05]"    # 이 성취기준과 이어지는 다른 교과 성취기준
node scripts/validate.mjs                              # 무결성 검사
```

```js
import standards from './vendor/standards.json' with { type: 'json' }
import links from './data/links.published.json' with { type: 'json' }

const byKey = Object.fromEntries(standards.map((s) => [s.key, s]))
const key = '[6실05-05]'
const partners = links
  .filter((l) => l.source_code === key || l.target_code === key)
  .map((l) => {
    const other = byKey[l.source_code === key ? l.target_code : l.source_code]
    return { 과목: other.subject, 성취기준: other.content, 융합주제: l.integration_theme, 수업아이디어: l.lesson_hook }
  })
console.log(partners)
```

## 데이터 구조 · Schema

```jsonc
{
  "source_code": "[4과01-01]",      // 성취기준 key. 항상 source_code < target_code
  "target_code": "[4수02-03]",
  "link_type": "cross_subject",     // cross_subject / same_concept / application / prerequisite / extension
  "rationale": "두 성취기준이 …로 연결되는 근거 (교사용 2~3문장)",
  "integration_theme": "힘과 측정",
  "lesson_hook": "물체를 밀고 당기며 …",
  "semantic_score": 0.71,           // 임베딩 코사인 유사도 (실측)
  "quality_score": 0.85,            // LLM이 판정한 교육적 품질
  "generation_method": "ai"
}
```

## ⚠️ 먼저 읽어주세요 — 이 데이터는 완벽하지 않습니다

이 연결은 **AI로 생성**했습니다. 억지스러운 연결이 남아 있을 수 있고, 커버리지가 고르지 않습니다. 알려진 문제는 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)에 투명하게 정리해 두었습니다.

**오류를 발견하면 묻어두지 말고 알려주세요.** 이 프로젝트는 커뮤니티의 교정으로 좋아지는 것을 전제로 설계했습니다.

- 🐛 **억지 연결 신고**: [이슈 열기](../../issues/new/choose)
- 🔎 **후보 검토**: `links.candidate.json`의 0.7대를 읽고 올릴 만하면 PR — [CONTRIBUTING.md](./CONTRIBUTING.md)

**현재 상태를 숫자로 정리합니다.** 게시된 연결 3,916개는 모두 근거, 융합 주제, 수업 아이디어를 갖추고 있습니다. 무작위 표본과 유사도
0.2 이하인 가장 약한 꼬리 부분을 사람이 직접 읽어 억지 연결이 아님을 확인했습니다. 다만 전수 검토는 아니며, "AI가 판정한 것"이라는 한계는
그대로입니다. published 연결이 하나라도 붙은 성취기준은 2,570개(40%)입니다. 학교급별 비율은 초등 1-2학년군 29%, 초등
3-4학년군 30%, 중학교 54%, 고등학교 57%입니다. 제2외국어 회화, 독일어, 러시아어 계열 11개 과목과 스포츠 문화에는 아직 연결이
없습니다([이슈 #1](../../issues/1)).

## 어떻게 만들었나 · Method

찾는 일과 판단하는 일을 분리했습니다. 후보는 성취기준 본문의 임베딩 유사도로 좁힙니다. 이 과정은 계산이므로 여러 번 실행해도 결과가 같습니다. 그다음 후보만 AI에 보여 교육적으로 타당한지 판정하게 했습니다. AI는 성취기준을 번호로만 가리킬 수 있으므로 없는 코드를 만들어 낼 수 없습니다. 판정 점수가 0.7 이상인 연결만 게시합니다. 언어 교과나 초등 통합교과처럼 문장이 다른 교과와 닮지 않는 과목은 상대 과목을 지정한 후보 추출과 교과 특성 지침을 따로 씁니다.

배경과 원칙, 재현용 명세(불변식·절차·출력 계약), 작업하며 배운 내용은 [**docs/NARRATIVE.md**](./docs/NARRATIVE.md)에 있습니다. 실행 코드는 [`algorithm/`](./algorithm)에 있습니다.

## 버전과 갱신 · Versioning

- **무엇이 언제 바뀌었나** — [CHANGELOG.md](./CHANGELOG.md). 릴리스는 `vX.Y.Z`로 태그합니다.
- **어느 성취기준에 붙어 있나** — `manifest.json`의 `standards_release`. 성취기준이 새 릴리스를 내면 그 태그로 연결을 다시 수출합니다.
- **깨지지 않았나** — PR마다 [GitHub Actions](./.github/workflows/validate.yml)가 고정 릴리스의 성취기준을 내려받아 `key` 참조 무결성, 정규화, 점수 범위, 게시 정책, manifest 건수를 검사합니다. 실패하면 머지가 막힙니다.
- **다시 뽑으려면** — 원천은 [curriculum-weaver](https://github.com/greatsong/curriculum-weaver)의 `curriculum_links` 테이블이고, 절차는 [CONTRIBUTING.md](./CONTRIBUTING.md#데이터를-새로-뽑을-때-관리자용)에 있습니다.

## 로드맵

이 데이터셋은 진행 중입니다. 각 항목은 이슈로도 열려 있고, **함께 해주실 분을 찾습니다.**

- [ ] **연결 없는 12과목** — 회화 6과목·독일어 3과목·생활 프랑스어·생활 러시아어·러시아어·스포츠 문화. 0.7대 후보만 있어 사람이 읽어 올리는 검토가 필요합니다([#1](../../issues/1)).
- [ ] **초등 1-2학년군 커버리지** — 100개 중 29개만 연결이 있습니다. 통합교과 성취기준이 일반적이라 구체적 수업이 그려지는 쌍이 드뭅니다.
- [ ] **candidate 0.7대 4,495건 검토** — 사람이 읽고 published로 올릴 후보입니다.
- [ ] **전문교과 연결의 별도 배포** — 산업수요 전문교과끼리의 연결 1,318건은 일반고 대상 정책으로 candidate에만 있습니다.
- [ ] **표준 포맷 export** — RDF/JSON-LD, Neo4j import, CSV

## 라이선스 · 인용 · 기여

- **데이터** (`data/`): [CC BY 4.0](./LICENSE-DATA). 성취기준 원문의 저작권 원천은 교육부이며, 재이용 시 [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)의 표기를 함께 따라 주세요.
- **코드** (`algorithm/`, `examples/`, `scripts/`): [MIT](./LICENSE)
- 인용은 [CITATION.cff](./CITATION.cff), 기여는 [CONTRIBUTING.md](./CONTRIBUTING.md), 행동 강령은 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

<sub>만든 사람: 당곡고등학교 교사 송석리([@greatsong](https://github.com/greatsong)). 이 데이터셋은 융합수업 협력 설계 플랫폼 **curriculum-weaver** 프로젝트에서 추출·정리되었습니다. 한국 융합교육 생태계의 공동 자산이 되기를 바랍니다.</sub>
