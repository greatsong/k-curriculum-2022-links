#!/usr/bin/env node
/**
 * 연결 데이터 무결성 검증 — PR 전에 실행하세요.
 *   node scripts/fetch-standards.mjs && node scripts/validate.mjs
 *
 * 검사 항목:
 *  - manifest.standards_release에 고정된 성취기준(vendor/standards.json)의 건수가 manifest와 같은가
 *  - 링크: source<target 정규화, 끝점이 성취기준 key에 존재, 점수 범위, link_type 유효성, 필수 필드
 *  - manifest.counts와 실제 파일 건수 일치
 * 오류가 있으면 비정상 종료(exit 1) — CI 게이트로 쓴다.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf-8'))
const LINK_TYPES = new Set(['cross_subject', 'same_concept', 'application', 'prerequisite', 'extension'])

let errors = 0
const fail = (msg) => { console.error(`  ✗ ${msg}`); errors++ }

const manifest = read('manifest.json')
const stdPath = process.env.STANDARDS_JSON || path.join(ROOT, 'vendor', 'standards.json')
if (!fs.existsSync(stdPath)) {
  console.error(`성취기준 파일이 없습니다: ${stdPath}\n  node scripts/fetch-standards.mjs 로 먼저 내려받으세요 (또는 STANDARDS_JSON=<경로>).`)
  process.exit(1)
}
console.log(`▶ 성취기준 (${manifest.standards_release.repo}@${manifest.standards_release.tag})`)
const standards = JSON.parse(fs.readFileSync(stdPath, 'utf-8'))
const keys = new Set(standards.map((s) => s.key))
if (standards.length !== manifest.standards_release.standards) fail(`성취기준 건수 ${standards.length} ≠ manifest ${manifest.standards_release.standards} — 고정한 릴리스와 다른 파일입니다`)
if (keys.size !== standards.length) fail('성취기준 key가 고유하지 않습니다')
console.log(`  ${standards.length}건 / 고유 key ${keys.size}개`)

for (const file of ['links.published.json', 'links.candidate.json']) {
  console.log(`▶ ${file} 검증`)
  const links = read(file)
  let dangling = 0
  for (const [i, l] of links.entries()) {
    if (!l.source_code || !l.target_code) { fail(`[${i}] source/target 누락`); continue }
    if (!(l.source_code < l.target_code)) fail(`정규화 위반(source<target 아님): ${l.source_code} / ${l.target_code}`)
    if (!keys.has(l.source_code)) dangling++
    if (!keys.has(l.target_code)) dangling++
    if (!LINK_TYPES.has(l.link_type)) fail(`알 수 없는 link_type "${l.link_type}"`)
    for (const k of ['semantic_score', 'quality_score']) {
      if (l[k] != null && (l[k] < 0 || l[k] > 1)) fail(`${l.source_code}~${l.target_code}: ${k} 범위 벗어남 (${l[k]})`)
    }
    if (file === 'links.published.json') {
      if (!(l.quality_score >= manifest.policy.published_min_quality)) fail(`${l.source_code}~${l.target_code}: published인데 quality ${l.quality_score} < ${manifest.policy.published_min_quality}`)
      if (!l.rationale || !l.integration_theme || !l.lesson_hook) fail(`${l.source_code}~${l.target_code}: published인데 rationale/integration_theme/lesson_hook 누락`)
    }
  }
  const expected = manifest.counts[file === 'links.published.json' ? 'links_published' : 'links_candidate']
  if (links.length !== expected) fail(`${file}: 건수 ${links.length} ≠ manifest ${expected}`)
  console.log(`  링크 ${links.length}개` + (dangling ? `  ⚠️ 성취기준에 없는 key 참조 ${dangling}건` : ''))
  if (dangling) fail(`${file}: 성취기준에 없는 key를 참조하는 링크가 있습니다`)
}

console.log(errors ? `\n❌ 검증 실패: 오류 ${errors}건` : '\n✅ 검증 통과')
process.exit(errors ? 1 : 0)
