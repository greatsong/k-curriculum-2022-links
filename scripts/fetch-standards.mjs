#!/usr/bin/env node
/**
 * manifest.standards_release에 고정된 성취기준 릴리스를 vendor/standards.json으로 내려받는다.
 * 연결(source_code/target_code)은 성취기준의 key를 가리키므로, 검증·예제는 이 파일이 있어야 돈다.
 *   node scripts/fetch-standards.mjs
 * 형제 폴더에 성취기준 리포를 클론해 뒀다면 내려받지 않고 그 파일을 복사한다.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'manifest.json'), 'utf-8'))
const { repo, tag } = manifest.standards_release
const out = path.join(ROOT, 'vendor', 'standards.json')
fs.mkdirSync(path.dirname(out), { recursive: true })

const sibling = path.join(ROOT, '..', 'k-curriculum-2022', 'data', 'standards.json')
if (fs.existsSync(sibling)) {
  fs.copyFileSync(sibling, out)
  console.log(`형제 폴더에서 복사: ${sibling} → vendor/standards.json (태그 ${tag}와 같은 내용인지는 검증 단계에서 건수로 확인)`)
} else {
  const url = `https://raw.githubusercontent.com/${repo}/${tag}/data/standards.json`
  console.log(`내려받는 중: ${url}`)
  const res = await fetch(url)
  if (!res.ok) { console.error(`실패: HTTP ${res.status}`); process.exit(1) }
  fs.writeFileSync(out, await res.text())
  console.log('저장: vendor/standards.json')
}
const n = JSON.parse(fs.readFileSync(out, 'utf-8')).length
console.log(`성취기준 ${n}건 (manifest 기대 ${manifest.standards_release.standards})`)
