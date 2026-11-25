import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ACTORS, STEPS, clampStep } from '../src/steps.ts'

test('每一步的角色都在泳道裡，且有模擬畫面', () => {
  for (const s of STEPS) {
    assert.ok(s.actor in ACTORS, s.title)
    assert.ok(s.screen.lines.length > 0, s.title)
  }
})

test('失敗迴圈後面一定接著修正的那一步（不能停在失敗）', () => {
  STEPS.forEach((s, i) => {
    if (s.loop) assert.ok(STEPS[i + 1] && !STEPS[i + 1].loop, s.title)
  })
})

test('四道 AI 驗證關卡都有出現', () => {
  const gates = STEPS.map(s => s.gate ?? '').join(' ')
  for (const n of ['1', '2', '3', '4']) assert.match(gates, new RegExp(n))
})

test('clampStep 不會超出範圍', () => {
  assert.equal(clampStep(-1), 0)
  assert.equal(clampStep(999), STEPS.length - 1)
  assert.equal(clampStep(3), 3)
})
