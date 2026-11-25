import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const MIN_PX = 14
const ROOT_PX = 16 // 1rem
const SRC = join(import.meta.dirname, '..', 'src')

// shortcut: 靜態掃描抓不到 SVG 跟著 viewBox 縮小，所以泳道 SVG 必須維持 1:1 px 寬度（見 App.tsx）；之後若改成縮放就要換成實際渲染再量
const files = readdirSync(SRC, { recursive: true, encoding: 'utf-8' })
  .filter(f => /\.(css|tsx?)$/.test(f))
  .map(f => ({ f, text: readFileSync(join(SRC, f), 'utf-8') }))

// font-size: 14px / font: 18px/1.6 … / fontSize: 14 / fontSize: '1rem' / font-size="11"
const PATTERNS = [
  /font-size\s*[:=]\s*["']?([\d.]+)([a-z%]*)/gi,
  /\bfont\s*:\s*(?:[a-z-]+\s+)*?([\d.]+)([a-z%]+)/gi,
  /fontSize\s*[:=]\s*\{?\s*["']?([\d.]+)([a-z%]*)/g,
]

function findSizes() {
  const out: { where: string; px: number | null; raw: string }[] = []
  for (const { f, text } of files) {
    text.split('\n').forEach((line, i) => {
      for (const re of PATTERNS) {
        for (const m of line.matchAll(re)) {
          const n = Number(m[1]), unit = m[2].toLowerCase()
          const px = unit === 'px' || unit === '' ? n : unit === 'rem' ? n * ROOT_PX : null
          out.push({ where: `src/${f.replaceAll('\\', '/')}:${i + 1}`, px, raw: m[0] })
        }
      }
    })
  }
  return out
}

test('找得到字級宣告（避免規則失效卻悄悄通過）', () => {
  assert.ok(findSizes().length > 5)
})

test(`所有字級 ≥ ${MIN_PX}px`, () => {
  const bad = findSizes().filter(s => s.px !== null && s.px < MIN_PX)
  assert.deepEqual(bad.map(s => `${s.where}  ${s.raw}`), [])
})

test('字級只能用 px 或 rem（em、% 這類相對單位無法靜態判斷）', () => {
  const bad = findSizes().filter(s => s.px === null)
  assert.deepEqual(bad.map(s => `${s.where}  ${s.raw}`), [])
})
