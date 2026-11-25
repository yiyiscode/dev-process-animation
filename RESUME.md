# RESUME

## 目前進度
- [x] 2026-11-25 grilling 定案（決策記在 memory：project-scope-decisions）
- [x] git init，分支 `feat/design-demo`
- [x] 版面方案 demo：`design-demos/2026-11-25-流程動畫版面.html`（A 水平管線／B 角色泳道／C 模擬工具畫面）
- [x] 選定版面：B+C 混搭（上方 B 角色泳道看全局與交棒，下方 C 模擬工具畫面大窗）

- [x] 建立公開 repo：https://github.com/yiyiscode/dev-process-animation（main 只有一個空的 initial commit，工作都在 feat/ 分支）

## 下一步
1. 使用者選好方案後：建立 React+Vite 專案，把 demo 裡的 `STEPS` 搬到 `src/steps.ts`
2. 推到 GitHub，設定 Actions：PR 跑 lint/test/build，merge 後部署到 GitHub Pages
3. 網頁定稿後：沿用 Time Series Analysis 的 `src/tts.py` 產生旁白，再用 Remotion 讀 timings.json 做影片（8–12 分鐘）

## 關鍵決策
- 範圍：需求 → 驗收條件 → Issue → 分支 → AI 寫程式 → 人看 diff → PR → CI（失敗迴圈）→ AI review → 人 review（失敗迴圈）→ merge → staging → prod → 關閉 Issue
- AI 驗證四道關卡：人看 diff、測試當裁判、AI 的說法要附依據、AI review 也要驗證
- 案例：待辦 App 的「到期日提醒」（Issue #42、PR #43）
