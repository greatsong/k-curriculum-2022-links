#!/usr/bin/env node
/**
 * 예제: 한 성취기준과 융합 가능한 상대 교과 성취기준 찾기
 *   node examples/find-fusion-partners.mjs "[6실05-05]"
 *
 * 식별자는 `key`다(KNOWN_ISSUES 11번). 같은 code가 두 과목에 쓰인 11건은 key가
 * "코드|과목" 형식이라, code로 찾았을 때 둘이 나오면 key를 그대로 넘겨 다시 실행한다.
 *   node examples/find-fusion-partners.mjs "[12심독01-01]|심화 독일어"
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
// 성취기준은 이 리포에 없다 — manifest에 고정된 릴리스를 scripts/fetch-standards.mjs로 vendor/에 받아 둔다
const stdPath = process.env.STANDARDS_JSON || path.join(ROOT, 'vendor', 'standards.json')
if (!fs.existsSync(stdPath)) { console.error('먼저 node scripts/fetch-standards.mjs 를 실행하세요'); process.exit(1) }
const standards = JSON.parse(fs.readFileSync(stdPath, 'utf-8'))
const links = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'links.published.json'), 'utf-8'))

const input = process.argv[2] || '[6실05-05]'
const byKey = Object.fromEntries(standards.map((s) => [s.key, s]))

// 겹치는 code인지 먼저 본다 — 충돌 11건은 한쪽만 "코드|과목" key를 갖고 다른 쪽은 key === code라,
// key 조회를 먼저 하면 맨 코드 입력이 한쪽으로 조용히 풀려 버린다.
const sameCode = standards.filter((s) => s.code === input)
const matches = sameCode.length > 1 ? sameCode : byKey[input] ? [byKey[input]] : sameCode
if (matches.length === 0) {
  console.error(`성취기준을 찾을 수 없습니다: ${input}`)
  process.exit(1)
}
if (matches.length > 1) {
  console.error(`같은 코드가 ${matches.length}개 과목에 쓰였습니다. key로 하나를 골라 다시 실행하세요:`)
  for (const m of matches) console.error(`  "${m.key}"  (${m.subject})`)
  process.exit(1)
}
const target = matches[0]
const code = target.key

console.log(`\n▶ 기준 성취기준: ${target.code} (${target.subject})`)
console.log(`  ${target.content}\n`)

const partners = links
  .filter((l) => l.source_code === code || l.target_code === code)
  .map((l) => {
    const other = l.source_code === code ? l.target_code : l.source_code
    return { other, std: byKey[other], link: l }
  })
  .filter((p) => p.std)
  .sort((a, b) => b.link.quality_score - a.link.quality_score)

console.log(`융합 가능한 성취기준 ${partners.length}개:\n`)
for (const { other, std, link } of partners) {
  console.log(`  • ${std.code} (${std.subject}) — 품질 ${link.quality_score}`)
  console.log(`    ${std.content.replace(/\n/g, ' ')}`)
  console.log(`    🔗 융합주제: ${link.integration_theme}`)
  console.log(`    📝 수업: ${link.lesson_hook}\n`)
}
