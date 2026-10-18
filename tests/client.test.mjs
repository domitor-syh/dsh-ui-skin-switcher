import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'

const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

// Exercise the built Client with real React hooks and injected DSH service
// fixtures. This does not claim browser/visual coverage; registration against
// published DSH SlotCore versions is checked separately.
async function mount(t, { currentModel = 'deepseek-flash', outcome = { ok: true } } = {}) {
  const subscribers = new Set()
  const selections = []
  const official = {
    id: 'deepseek-flash', name: 'DeepSeek-V4.1-Flash',
    reasoning: { defaultEffort: 'off', efforts: [{ id: 'off', name: 'Off' }, { id: 'max', name: 'Max' }] },
  }
  const thirdParty = { id: 'deepseek-flash', name: 'Custom Flash' }
  let snapshot = {
    current: { provider: 'deepseek-official', model: currentModel, reasoningEffort: 'off' },
    groups: [
      { id: 'deepseek-official', name: 'DeepSeek', models: [official] },
      { id: 'custom', name: 'Custom API', models: [thirdParty] },
    ],
    status: 'ready', error: null,
  }
  const publish = next => {
    snapshot = next
    for (const notify of subscribers) notify()
  }
  const directory = {
    store: {
      getSnapshot: () => snapshot,
      subscribe: notify => { subscribers.add(notify); return () => subscribers.delete(notify) },
    },
    load: async () => snapshot,
    select: async selection => {
      selections.push(JSON.parse(JSON.stringify(selection)))
      if (outcome instanceof Error) throw outcome
      const response = outcome === 'legacy-void' ? undefined : outcome
      if (response === undefined || response.ok) publish({ ...snapshot, current: selection })
      return response
    },
  }
  let client
  const browser = new EventTarget()
  browser.devicePixelRatio = 1
  browser.__ModuleLoader__ = {
    load({ id, factory }) {
      assert.equal(id, '@domitor-syh/dsh-ui-skin-switcher')
      client = factory(name => {
        assert.equal(name, 'react', 'Client must use the shared React runtime only')
        return React
      })
    },
  }
  vm.runInNewContext(bundle, {
    window: browser, document: new EventTarget(), setTimeout, clearTimeout, console,
  }, { filename: 'lib/client.js' })
  let registration
  let Component
  client.apply({
    modelDirectories: { directoryFor: () => directory },
    sessions: { subagentAddress: () => undefined },
    effect: () => () => {}, // Styles/dictionaries belong to browser integration checks.
    slots: {
      inject(key, callback) { assert.equal(key, 'conversation.input.model'); return callback() },
      register(options, component) {
        assert.equal(options.name, 'conversation.input.model')
        assert.equal(options.priority, -1)
        assert.equal(options.children, undefined, 'Never redeclare DSH-owned label children')
        registration = options
        Component = component
        return () => {}
      },
    },
  })
  let tree
  const render = () => React.createElement(Component, { locked: false, sessionId: 'session-test' })
  await act(async () => { tree = TestRenderer.create(render()) })
  t.after(() => { act(() => tree.unmount()); assert.equal(subscribers.size, 0) })
  return {
    tree, selections,
    official,
    snapshot: () => snapshot,
    async showModels() { await act(async () => tree.root.findByProps({ className: 'sk5-trigger' }).props.onClick()) },
    async releasePointer() { await act(async () => browser.dispatchEvent(new Event('pointerup'))) },
    async update(next) { await act(async () => publish(next)) },
  }
}

function text(node) {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  return text(node.children)
}

test('the selector shadows the official entry without redeclaring its children', async t => {
  const ui = await mount(t)
  assert.equal(ui.tree.root.findAllByProps({ className: 'sk5-triggerName' }).length, 1)
  assert.match(text(ui.tree.toJSON()), /DeepSeek-V4\.1-Flash/)
  assert.doesNotMatch(text(ui.tree.toJSON()), /1017/)
  await ui.showModels()
  assert.match(text(ui.tree.toJSON()), /Custom Flash/)
  assert.match(text(ui.tree.toJSON()), /DeepSeek-V4\.1-Flash/)
})

test('a stale selection retains its model ID as readable fallback text', async t => {
  const ui = await mount(t, { currentModel: 'removed-model' })
  assert.match(text(ui.tree.toJSON()), /removed-model/)
  await ui.showModels()
  assert.match(text(ui.tree.toJSON()), /DeepSeek-V4\.1-Flash/)
  assert.match(text(ui.tree.toJSON()), /Custom Flash/)
})

test('model rows submit original provider/model/effort IDs', async t => {
  const ui = await mount(t)
  await ui.showModels()
  const rows = () => ui.tree.root.findAllByProps({ role: 'menuitem' })
  await act(async () => rows()[1].props.onClick())
  assert.deepEqual(ui.selections[0], { provider: 'custom', model: 'deepseek-flash' })
  await ui.showModels()
  await act(async () => rows()[0].props.onClick())
  assert.deepEqual(ui.selections[1], { provider: 'deepseek-official', model: 'deepseek-flash' })
  await act(async () => ui.tree.root.findByProps({ className: 'sk5-trigger sk5-triggerEffort' }).props.onClick())
  await act(async () => ui.tree.root.findByProps({ className: 'sk5-track' }).props.onPointerDown({ clientX: 0 }))
  // The test renderer has no DOM geometry, so the first advertised level wins.
  await ui.releasePointer()
  assert.deepEqual(ui.selections[2], { provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'off' })
})

test('legacy void selection success is accepted without an error', async t => {
  const ui = await mount(t, { outcome: 'legacy-void' })
  await ui.showModels()
  await act(async () => ui.tree.root.findAllByProps({ role: 'menuitem' })[1].props.onClick())
  assert.deepEqual(ui.selections[0], { provider: 'custom', model: 'deepseek-flash' })
  assert.doesNotMatch(text(ui.tree.toJSON()), /Error/)
  assert.equal(ui.tree.root.findAllByProps({ role: 'menu' }).length, 0)
})

test('legacy rejected selection remains visible for retry', async t => {
  const ui = await mount(t, { outcome: new Error('legacy failure') })
  await ui.showModels()
  await act(async () => ui.tree.root.findAllByProps({ role: 'menuitem' })[1].props.onClick())
  assert.match(text(ui.tree.toJSON()), /legacy failure/)
  assert.equal(ui.tree.root.findAllByProps({ role: 'menu' }).length, 1)
})

test('host catalog updates refresh effort options without remounting the selector', async t => {
  const ui = await mount(t)
  const updatedModel = {
    ...ui.official,
    reasoning: { defaultEffort: 'balanced', efforts: [{ id: 'balanced', name: 'Balanced' }, { id: 'deep', name: 'Deep' }] },
  }
  await ui.update({
    ...ui.snapshot(),
    current: { provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'deep' },
    groups: [{ id: 'deepseek-official', name: 'DeepSeek', models: [updatedModel] }],
  })
  assert.match(text(ui.tree.toJSON()), /Deep/)
  assert.doesNotMatch(text(ui.tree.toJSON()), /Off/)
})

test('a Remote envelope failure remains visible for retry', async t => {
  const ui = await mount(t, { outcome: { ok: false, error: { code: 'session/writer-held', message: 'Session in use' } } })
  await ui.showModels()
  await act(async () => ui.tree.root.findAllByProps({ role: 'menuitem' })[1].props.onClick())
  assert.match(text(ui.tree.toJSON()), /session\/writer-held: Session in use/)
  assert.equal(ui.tree.root.findAllByProps({ role: 'menu' }).length, 1)
})
