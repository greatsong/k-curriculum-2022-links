# k-curriculum-2022-links

> **Cross-subject "fusion" links between Korea's 2022 curriculum achievement standards — AI-judged candidates, each with a rationale, an integration theme, and a lesson idea.**
> A spin-off of [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022) (the standards). [한국어 README](./README.md)

[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg)](./LICENSE-DATA)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](./LICENSE)
[![validate links](https://github.com/greatsong/k-curriculum-2022-links/actions/workflows/validate.yml/badge.svg)](https://github.com/greatsong/k-curriculum-2022-links/actions/workflows/validate.yml)

Among the 6,444 achievement standards of Korea's 2022 Revised National Curriculum, this dataset links standards from **different subjects** that can be taught together: **3,916 published links** and 11,758 candidates. Every link carries a rationale, an integration theme, and a one-line lesson hook. The extraction algorithm is published alongside.

The standards themselves are **not** here. They are maintained in [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022), and this repository is pinned to one of its releases (`data/manifest.json` → `standards_release`). Standards are a slow-moving public record; links are AI-generated and change with models and policy, so they are kept apart.

## Data

| File | Content | Size |
|---|---|---|
| [`data/links.published.json`](./data/links.published.json) | Links that passed the publishing policy | **3,916** (quality ≥ 0.70, mean 0.83) |
| [`data/links.candidate.json`](./data/links.candidate.json) | AI-proposed, unreviewed | **11,758** (4,495 in the 0.7s; wide quality range) |
| [`data/manifest.json`](./data/manifest.json) | Pinned standards release, provenance commit, counts, policy | schema v1 |
| [`llms.txt`](./llms.txt) | Entry point for AI agents | |

**Pinned standards**: `k-curriculum-2022@v3.0.0` (6,444 rows). `source_code` / `target_code` are that release's **`key`** values, not `code` (11 codes are shared by two subjects). Field definitions: [docs/SCHEMA.md](./docs/SCHEMA.md) (Korean); intended use and limits: [data/DATACARD.md](./data/DATACARD.md) (Korean).

## Quick start

```bash
git clone https://github.com/greatsong/k-curriculum-2022-links.git
cd k-curriculum-2022-links
node scripts/fetch-standards.mjs                       # downloads the pinned standards release into vendor/
node examples/find-fusion-partners.mjs "[6실05-05]"    # partners of one standard in other subjects
node scripts/validate.mjs                              # integrity checks
```

```js
import standards from './vendor/standards.json' with { type: 'json' }
import links from './data/links.published.json' with { type: 'json' }
const byKey = Object.fromEntries(standards.map((s) => [s.key, s]))
const key = '[6실05-05]'
const partners = links
  .filter((l) => l.source_code === key || l.target_code === key)
  .map((l) => ({ ...byKey[l.source_code === key ? l.target_code : l.source_code], theme: l.integration_theme, hook: l.lesson_hook }))
```

## Schema

| Field | Type | Meaning |
|---|---|---|
| `source_code`, `target_code` | string | Standards `key`; always `source_code < target_code` (Unicode order) |
| `link_type` | string | `cross_subject` same phenomenon from different angles · `same_concept` essentially the same concept · `application` one side applied in the other · `prerequisite` · `extension` |
| `rationale` | string | 2–3 sentences for teachers: how the two are taught together |
| `integration_theme` | string | A short theme |
| `lesson_hook` | string | One-line lesson idea |
| `semantic_score` | number | Cosine similarity of the two standards' text embeddings (measured) |
| `quality_score` | number | LLM-judged educational quality, 0–1 |
| `generation_method` | string | `ai` |

Direction of `prerequisite` / `extension` is described in `rationale` (storage is normalized `source < target`).

## Read this first — the data is not perfect

All links are **AI-generated**. Some may be forced; coverage is uneven (40% of standards have at least one published link; 29% in grades 1–2, 54% in middle school, 57% in high school; 12 subjects, mostly second-language conversation courses, have none yet — [#1](../../issues/1)). Random samples and the weakest tail were read by a human and found sound, but not exhaustively. Everything known is in [KNOWN_ISSUES.md](./KNOWN_ISSUES.md). Please report forced links via [issues](../../issues/new/choose), or review candidates in the 0.7s and open a PR ([CONTRIBUTING.md](./CONTRIBUTING.md)).

## Method

Finding and judging are separated. Candidates are narrowed deterministically by embedding similarity of the standards' text; only those candidates are shown to an LLM, which refers to standards **by index only** and therefore cannot invent codes. Links scoring ≥ 0.7 are published. Subjects whose text does not resemble other subjects (foreign languages, early-primary integrated subjects) get partner-restricted candidate extraction and subject-specific judging guidance. Background, principles, a reproducible agent specification (invariants, procedure, output contract), and lessons learned are in [docs/NARRATIVE.md](./docs/NARRATIVE.md) (Korean); code is in [`algorithm/`](./algorithm).

## Versioning

Releases are tagged `vX.Y.Z` ([CHANGELOG.md](./CHANGELOG.md)). `manifest.standards_release` names the standards release the links are pinned to; when the standards publish a new release, links are re-exported against it. Every PR runs [GitHub Actions](./.github/workflows/validate.yml), which downloads the pinned standards and checks `key` referential integrity, normalization, score ranges, the publishing policy, and manifest counts.

## License and citation

Data [CC BY 4.0](./LICENSE-DATA) — please also credit the Ministry of Education for the standards text as described in [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022). Code [MIT](./LICENSE). Cite via [CITATION.cff](./CITATION.cff). Contributions: [CONTRIBUTING.md](./CONTRIBUTING.md), [Code of Conduct](./CODE_OF_CONDUCT.md).

---

<sub>Author: Sukree Song (송석리), teacher at Danggok High School, Seoul ([@greatsong](https://github.com/greatsong)).</sub>
