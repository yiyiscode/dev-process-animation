import { useEffect, useState } from 'react'
import { ACTORS, LANES, STEPS, clampStep, type Step } from './steps.ts'

const AUTOPLAY_MS = 3000
const COL_W = 56, LANE_H = 56, LABEL_W = 150

function Lanes({ cur, onPick }: { cur: number; onPick: (i: number) => void }) {
  const w = LABEL_W + COL_W * STEPS.length + 20
  const pt = (s: Step, i: number) => [LABEL_W + 28 + i * COL_W, LANES.indexOf(s.actor) * LANE_H + LANE_H / 2] as const
  const pts = (n: number) => STEPS.slice(0, n).map((s, i) => pt(s, i).join(',')).join(' ')
  return (
    <svg className="lanes" viewBox={`0 0 ${w} ${LANE_H * LANES.length}`} role="list" aria-label="流程泳道">
      {LANES.map((k, r) => (
        <g key={k}>
          {r > 0 && <line x1={0} x2={w} y1={r * LANE_H} y2={r * LANE_H} className="laneSep" />}
          <text x={12} y={r * LANE_H + LANE_H / 2 + 5} fill={ACTORS[k].color} className="laneLbl">{ACTORS[k].name}</text>
        </g>
      ))}
      <polyline points={pts(STEPS.length)} className="track" />
      <polyline points={pts(cur + 1)} className="trackDone" />
      {STEPS.map((s, i) => {
        const [x, y] = pt(s, i)
        const state = i === cur ? 'cur' : i < cur ? 'done' : ''
        return (
          <g key={i} className={`dot ${state} ${s.loop ? 'loop' : ''}`} role="listitem" tabIndex={0}
             aria-label={`${i + 1}. ${s.title}`} aria-current={i === cur ? 'step' : undefined}
             onClick={() => onPick(i)} onKeyDown={e => e.key === 'Enter' && onPick(i)}>
            <title>{s.title}</title>
            <circle cx={x} cy={y} r={i === cur ? 16 : 12} stroke={ACTORS[s.actor].color}
                    style={i === cur ? { fill: ACTORS[s.actor].color } : undefined} />
            <text x={x} y={y + 4}>{i + 1}</text>
          </g>
        )
      })}
    </svg>
  )
}

function Screen({ s }: { s: Step['screen'] }) {
  return (
    <div className="screen">
      <div className="bar"><b /><b /><b /><span className="mono">{s.title}</span></div>
      <pre>{s.lines.map(([k, t], i) => <span key={i} className={`l-${k || 'x'}`}>{t}{'\n'}</span>)}</pre>
    </div>
  )
}

function Card({ s, i }: { s: Step; i: number }) {
  return (
    <div className="card">
      <h2>{i + 1}. {s.title}</h2>
      <div className="tags">
        {s.gate && <span className="gate">{s.gate}</span>}
        {s.loop && <span className="loopTag">失敗迴圈</span>}
      </div>
      <div className="meta">{s.stage} · <span style={{ color: ACTORS[s.actor].color }}>{ACTORS[s.actor].name}</span></div>
      <p>{s.desc}</p>
    </div>
  )
}

export default function App() {
  const [cur, setCur] = useState(0)
  const [playing, setPlaying] = useState(false)
  const go = (i: number) => setCur(clampStep(i))
  const step = (d: number) => { setPlaying(false); setCur(c => clampStep(c + d)) }

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setCur(c => {
      if (c === STEPS.length - 1) { setPlaying(false); return c }
      return c + 1
    }), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [playing])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const s = STEPS[cur]
  return (
    <main>
      <header>
        <h1>軟體開發流程：從需求到上線（AI 協作版）</h1>
        <p className="sub">以「待辦 App 加上到期日提醒」為例，看人、AI、GitHub、CI/CD 怎麼交棒，以及 AI 的產出怎麼被驗證。</p>
      </header>
      <div className="controls">
        <button onClick={() => step(-1)} disabled={cur === 0}>◀ 上一步</button>
        <button onClick={() => step(1)} disabled={cur === STEPS.length - 1}>下一步 ▶</button>
        <button onClick={() => { if (!playing && cur === STEPS.length - 1) setCur(0); setPlaying(p => !p) }}>
          {playing ? '⏸ 暫停' : '▶ 自動播放'}
        </button>
        <span className="count">{cur + 1} / {STEPS.length}</span>
      </div>
      <Lanes cur={cur} onPick={i => { setPlaying(false); go(i) }} />
      <div className="detail">
        <Screen s={s.screen} />
        <Card s={s} i={cur} />
      </div>
    </main>
  )
}
