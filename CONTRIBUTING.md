# 기여 가이드 (Contributing)

이 데이터셋의 연결은 **AI가 만들었고, 사람이 읽어야 좋아집니다.** 억지 연결을 하나 신고하는 것, 0.7대 후보 하나를 읽고 올릴지 판단하는 것이 가장 큰 기여입니다.

## 어떻게 기여하나요?

### 🐛 억지 연결을 발견했을 때
[이슈 열기](../../issues/new/choose) → "억지 연결 신고". 어느 연결(`source_code`·`target_code`)이 왜 교육적으로 어색한지 적어 주세요. 근거가 있으면 검토가 빠릅니다.

### 🔎 후보를 검토해 올리고 싶을 때
`links.candidate.json`의 0.7대 연결을 읽고 게시할 만하다고 판단되면 PR로 `links.published.json`에 옮겨 주세요. PR 설명에 왜 수업으로 성립하는지 한두 문장 적어 주시면 됩니다. 대량(수십 건 이상)은 이슈로 먼저 상의해 주세요.

### 🔧 Pull Request 절차

1. Fork → 브랜치 (`git checkout -b review/일본어-회화`)
2. JSON 수정
3. 검증:
   ```bash
   node scripts/fetch-standards.mjs   # manifest에 고정된 성취기준 릴리스를 vendor/에 받음
   node scripts/validate.mjs           # 참조 무결성·정규화·점수·게시 정책·manifest 건수
   ```
4. `data/manifest.json`의 `counts`를 실제 건수로 맞춥니다(validate가 알려 줍니다).
5. 커밋 후 PR. 템플릿 체크리스트를 채워 주세요.

## 데이터 수정 규칙

- **끝점은 성취기준의 `key`입니다.** `code`가 아닙니다. 성취기준은 [k-curriculum-2022](https://github.com/greatsong/k-curriculum-2022)의 고정된 릴리스(`manifest.standards_release`)에서 옵니다.
- **정규화**: `source_code < target_code`(유니코드 사전순).
- **published 조건**: `quality_score ≥ 0.7`이고 `rationale`·`integration_theme`·`lesson_hook`이 모두 있어야 합니다.
- **연결을 새로 만들 때** `rationale`에 어떤 수업 활동으로 이어지는지 구체적으로 적어 주세요. 근거 없는 연결은 받기 어렵습니다.
- 성취기준 본문은 이 리포에서 고치지 않습니다 — 성취기준 리포로.

## 데이터를 새로 뽑을 때 (관리자용)

원천은 [curriculum-weaver](https://github.com/greatsong/curriculum-weaver)의 `curriculum_links` 테이블입니다.

1. 성취기준이 바뀌었으면 **먼저** k-curriculum-2022를 릴리스(태그)합니다.
2. 앱 리포에서 수출: `node scripts/export-open-dataset.mjs --out-links ../k-curriculum-2022-links/data --standards-release <성취기준 태그>`
3. 이 리포에서 `npm run validate`.
4. [CHANGELOG.md](./CHANGELOG.md)에 날짜·건수·바뀐 정책을 적고, `package.json`·`CITATION.cff`의 version을 올립니다.
5. 커밋 메시지에 `data:` 접두, 태그 `vX.Y.Z`, GitHub Release.

## 행동 규범과 라이선스

[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)를 따릅니다. 기여하신 데이터는 [CC BY 4.0](./LICENSE-DATA), 코드는 [MIT](./LICENSE)로 배포되며, PR을 여는 것으로 이에 동의하는 것으로 간주합니다.
