# 軟體開發流程動畫（AI 協作版）

以「待辦 App 加上到期日提醒」為例，用互動動畫走一遍從需求到上線的完整流程：
需求 → 驗收條件 → Issue → 分支 → AI 寫程式 → 人看 diff → PR → CI → AI／人 review → merge → staging → production。

這個 repo 本身也照這套流程開發：PR 跑 CI，merge 到 `main` 後由 Actions 部署到 GitHub Pages。

## 開發

```sh
npm install
npm run dev     # 本機預覽
npm run lint
npm test        # node --test，測 src/steps.ts 的流程資料
npm run build
```

流程內容都在 `src/steps.ts`，網頁和之後的 Remotion 影片共用這一份。
