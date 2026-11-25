// 流程資料：網頁和 Remotion 影片共用這一份，改內容只改這裡

export type ActorKey = 'human' | 'ai' | 'github' | 'ci'
export type Stage = '規劃' | '開發' | '整合' | '審查' | '部署'
/** 模擬畫面每一行的樣式：h=標題 add/del=diff ok/err/warn=狀態 ai=AI 輸出 dim=註解 flag=重點標示 */
export type LineKind = '' | 'h' | 'add' | 'del' | 'ok' | 'err' | 'warn' | 'ai' | 'dim' | 'flag'

export interface Step {
  stage: Stage
  actor: ActorKey
  title: string
  short: string
  desc: string
  /** 失敗迴圈：這一步之後要回頭修 */
  loop?: boolean
  /** AI 驗證關卡 */
  gate?: string
  screen: { title: string; lines: [LineKind, string][] }
}

export const ACTORS: Record<ActorKey, { name: string; color: string }> = {
  human: { name: '人（開發者）', color: 'var(--human)' },
  ai: { name: 'AI（Claude Code）', color: 'var(--ai)' },
  github: { name: 'GitHub', color: 'var(--github)' },
  ci: { name: 'CI/CD（Actions）', color: 'var(--ci)' },
}
export const LANES: ActorKey[] = ['human', 'ai', 'github', 'ci']

export const STEPS: Step[] = [
  { stage: '規劃', actor: 'human', title: '需求', short: '需求',
    desc: '使用者回饋：「常常忘記快到期的待辦。」討論後決定做「到期日提醒」：到期前一天和當天都要提醒。',
    screen: { title: '會議筆記', lines: [['h', '到期日提醒 — 需求討論'], ['', '痛點：使用者錯過到期的待辦'], ['', '範圍：只做 App 內提醒，不做 email／推播'], ['dim', '→ 推播另開需求，這次不做']] } },
  { stage: '規劃', actor: 'human', title: '拆票＋驗收條件', short: '驗收條件',
    desc: '把需求拆成一個 PR 能完成的小票，並寫成可以測試的驗收條件。後面的測試、AI 驗證、staging 驗收都以這份條件為準。',
    screen: { title: 'Issue 草稿', lines: [['h', '驗收條件（Given / When / Then）'], ['', '1. 待辦明天到期 → 顯示「明天到期」'], ['', '2. 待辦今天到期 → 顯示「今天到期」'], ['', '3. 已完成或沒有到期日 → 不提醒'], ['', '4. 以使用者時區（Asia/Taipei）判斷日期'], ['flag', '↑ 第 2、4 條後面會抓到 AI 的 bug']] } },
  { stage: '規劃', actor: 'github', title: '建立 Issue #42', short: 'Issue #42',
    desc: 'Ticket 放在 GitHub Issue，附上驗收條件、label 和負責人。Jira 和 GitLab Issue 也是同樣的概念。',
    screen: { title: 'github.com/you/todo/issues/42', lines: [['h', '#42  到期日提醒'], ['dim', 'Open · label: feature · assignee: you'], ['', '驗收條件：1～4（同上）']] } },
  { stage: '開發', actor: 'human', title: '開分支', short: '開分支',
    desc: '從最新的 main 開一條功能分支，分支名稱帶上 Issue 編號，方便追溯。',
    screen: { title: 'terminal', lines: [['', '$ git switch main && git pull'], ['', '$ git switch -c feat/42-due-reminder'], ['ok', "Switched to a new branch 'feat/42-due-reminder'"]] } },
  { stage: '開發', actor: 'ai', title: 'AI 寫程式', short: 'AI 寫程式',
    desc: '把 Issue 和驗收條件交給 Claude Code，請它實作並補上測試。人負責下指令，最後由人把關。',
    screen: { title: 'claude', lines: [['', '> 依 Issue #42 的驗收條件實作到期提醒，並補上測試'], ['ai', '● 讀取 src/todo.ts、tests/'], ['ai', '● 新增 src/reminder.ts（isDueSoon）'], ['ai', '● 新增 tests/reminder.test.ts（3 個測試）'], ['ai', '✔ 測試全部通過']] } },
  { stage: '開發', actor: 'human', gate: '關卡 1：人先看 diff', title: '人 review AI 的 diff', short: '看 diff',
    desc: '「測試全過」不等於符合需求。人逐行看 diff，發現 AI 用 UTC 判斷日期：台灣時間 00:00–08:00 會被算成前一天，違反第 4 條驗收條件。',
    screen: { title: 'git diff', lines: [['h', 'src/reminder.ts'], ['add', '+ export function isDueSoon(todo, now = new Date()) {'], ['flag', '+   const today = now.toISOString().slice(0, 10)  // ← UTC！違反驗收條件 4'], ['add', '+   return todo.due > today && todo.due <= addDays(today, 1)'], ['add', '+ }'], ['dim', '→ 請 AI 改用 Asia/Taipei，並補上時區測試']] } },
  { stage: '開發', actor: 'human', title: 'commit + push', short: 'push',
    desc: '修好時區問題後 commit。訊息遵循 Conventional Commits，並關聯 Issue。',
    screen: { title: 'terminal', lines: [['', '$ git commit -m "feat: 到期日提醒 (#42)"'], ['', '$ git push -u origin feat/42-due-reminder']] } },
  { stage: '整合', actor: 'github', title: '開 PR #43', short: 'PR #43',
    desc: 'PR 說明寫明做了什麼、怎麼驗證；寫上「Closes #42」，merge 時就會自動關閉 Issue。開了 PR 就會觸發 CI。',
    screen: { title: 'github.com/you/todo/pull/43', lines: [['h', '#43  feat: 到期日提醒'], ['', 'Closes #42'], ['', '驗證：npm test；staging 依驗收條件手動驗收'], ['dim', 'feat/42-due-reminder → main']] } },
  { stage: '整合', actor: 'ci', loop: true, gate: '關卡 2：測試當裁判', title: 'CI 失敗', short: 'CI ✗',
    desc: '你照驗收條件第 2 條加的測試失敗了：AI 寫的是 due > today，把「今天到期」排除掉了。AI 自己寫的 3 個測試都沒涵蓋這個邊界。',
    screen: { title: 'Actions · ci.yml', lines: [['ok', '✓ lint'], ['err', '✗ test'], ['dim', '  build（skipped）'], ['', ''], ['err', '  ✗ 今天到期的待辦應提醒'], ['err', '    expected: true   received: false'], ['dim', '    at tests/reminder.test.ts:21']] } },
  { stage: '整合', actor: 'human', title: '修正→重推→CI 通過', short: 'CI ✓',
    desc: '把 > 改成 >=，確認符合第 2 條驗收條件後重新 push。CI 會自動重跑，這次全綠。',
    screen: { title: 'Actions · ci.yml', lines: [['del', '-   return todo.due > today && …'], ['add', '+   return todo.due >= today && …'], ['', ''], ['ok', '✓ lint   ✓ test (5)   ✓ build']] } },
  { stage: '審查', actor: 'ai', gate: '關卡 3、4：要依據、驗證 AI review', title: 'AI Code Review', short: 'AI review',
    desc: 'AI 先 review 一輪。每則意見都要附上依據（檔案行號、可以重現的測試）；人逐一判斷要採納、駁回，還是另開 Issue。',
    screen: { title: 'PR #43 · AI review', lines: [['ok', '✔ 採納  reminder.ts:4  todo.due 為 null 時會拋錯（附重現測試）'], ['err', '✘ 駁回  reminder.ts:9  「addDays 有記憶體洩漏」— 沒有依據，查證後是誤報'], ['warn', '↪ 另開  「建議日期全改用 dayjs」— 超出範圍 → Issue #44']] } },
  { stage: '審查', actor: 'human', loop: true, title: '人 review：Request changes', short: '要求修改',
    desc: '同事 review 時要求修改：提醒文字寫死成中文，請改放到 i18n 檔。',
    screen: { title: 'PR #43 · review', lines: [['warn', '● Changes requested by teammate'], ['', '  reminder.ts:12  「明天到期」請改放到 locales/'], ['dim', '→ 回到開發：再 commit 一次']] } },
  { stage: '審查', actor: 'human', title: '再 commit → Approve', short: 'Approve',
    desc: '修改後 push，CI 會再跑一次；reviewer 確認後按下 Approve。',
    screen: { title: 'PR #43', lines: [['', '$ git commit -m "refactor: 提醒文字移到 i18n"'], ['ok', '✓ CI 通過'], ['ok', '✔ Approved']] } },
  { stage: '整合', actor: 'github', title: 'Squash merge 到 main', short: 'merge',
    desc: '用 squash merge，把這個 PR 的多個 commit 壓成一個，main 的歷史會比較乾淨。合併後觸發 CD。',
    screen: { title: 'PR #43', lines: [['ok', '✔ Squashed and merged into main'], ['dim', 'feat: 到期日提醒 (#43)']] } },
  { stage: '部署', actor: 'ci', title: 'CD：部署 staging', short: 'staging',
    desc: '自動部署到 staging，再照驗收條件 1～4 手動驗一次，特別是時區那條。',
    screen: { title: 'Actions · deploy.yml', lines: [['ok', '✓ build'], ['ok', '✓ deploy → staging.todo.app'], ['', '  驗收：1 ✓  2 ✓  3 ✓  4 ✓']] } },
  { stage: '部署', actor: 'ci', title: 'CD：部署 production', short: 'production',
    desc: 'staging 驗收通過後才部署到 production（通常要人按下核准，也就是 environment protection）。',
    screen: { title: 'Actions · deploy.yml', lines: [['warn', '⏸ 等待核准：production'], ['ok', '✓ approved'], ['ok', '✓ deploy → todo.app']] } },
  { stage: '部署', actor: 'github', title: 'Issue #42 自動關閉', short: '關閉 #42',
    desc: '因為 PR 寫了「Closes #42」，merge 時 Issue 就自動關閉，從需求到上線的每一步都能追溯。',
    screen: { title: 'github.com/you/todo/issues/42', lines: [['ok', '✔ Closed  by PR #43'], ['dim', '需求 → Issue → 分支 → PR → CI → Review → 部署']] } },
]

export const clampStep = (i: number) => Math.max(0, Math.min(STEPS.length - 1, i))
