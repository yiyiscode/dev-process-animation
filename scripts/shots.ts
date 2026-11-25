// PR 驗證截圖：npm run shots -- <PR編號>
// 先 build，再用 vite preview 啟動網站，以本機 Chrome 依操作步驟截圖到 docs/pr-screenshots/<PR>/
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { preview } from 'vite'

const pr = process.argv[2] ?? 'local'
const outDir = join(import.meta.dirname, '..', 'docs', 'pr-screenshots', pr)
mkdirSync(outDir, { recursive: true })

// presses = 按幾次 → 鍵（第 n 步 = n-1 次）
const SHOTS = [
  { file: '01-initial.png', width: 1280, presses: 0, note: '初始畫面（第 1 步）' },
  { file: '02-step9-ci-fail.png', width: 1280, presses: 8, note: '第 9 步：CI 失敗（關卡 2）' },
  { file: '03-step11-ai-review.png', width: 1280, presses: 10, note: '第 11 步：AI review（關卡 3、4）' },
  { file: '04-last-step.png', width: 1280, presses: 16, note: '最後一步，「下一步」按鈕停用' },
  { file: '05-mobile-390.png', width: 390, presses: 5, note: '手機寬度 390px：泳道改成橫向捲動' },
]

const server = await preview({ preview: { port: 4174, strictPort: true } })
const url = server.resolvedUrls!.local[0]
const browser = await chromium.launch({ channel: 'chrome' })
const errors: string[] = []
try {
  for (const s of SHOTS) {
    const page = await browser.newPage({ viewport: { width: s.width, height: 820 } })
    page.on('pageerror', e => errors.push(`${s.file}: ${e.message}`))
    await page.goto(url)
    await page.locator('[aria-current="step"]').waitFor() // 等 React 掛好鍵盤監聽，否則第一次按鍵會漏掉
    for (let i = 0; i < s.presses; i++) await page.keyboard.press('ArrowRight')
    const shown = await page.locator('.count').textContent()
    if (!shown?.startsWith(`${s.presses + 1} /`)) throw new Error(`${s.file}: 預期第 ${s.presses + 1} 步，畫面卻是 ${shown}`)
    await page.waitForTimeout(400) // 等圓點放大與捲動的 transition 結束
    await page.screenshot({ path: join(outDir, s.file), fullPage: true })
    console.log(`✓ ${s.file}  ${s.note}`)
    await page.close()
  }
} finally {
  await browser.close()
  await server.close()
}
if (errors.length) {
  console.error('頁面有錯誤：\n' + errors.join('\n'))
  process.exit(1)
}
