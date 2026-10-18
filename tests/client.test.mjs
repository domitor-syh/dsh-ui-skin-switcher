import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'

const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

// Exercise the built Client with real React hooks. Only the injected DSH services
// and the label outlet are fixtures; this does not claim browser/visual coverage.
async function mount(t, { extension = true, currentModel = 'deepseek-flash', result = { ok: true } } = {}) {
  const subscribers = new Set()
  const selections = []
  const outletCalls = []
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
      if (result.ok) publish({ ...snapshot, current: selection })
      return result
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
      register(options, component) { registration = options; Component = component; return () => {} },
    },
  })
  assert.deepEqual(JSON.parse(JSON.stringify(registration.children)), {
    'conversation.input.model.label': { kind: 'single', scope: 'session', inline: true },
  })
  const renderSlot = (key, owner, options) => {
    assert.ok(registration.children[key], 'A label outlet must be declared by its owner')
    outletCalls.push(owner)
    assert.deepEqual(Object.keys(owner.provider).sort(), ['id', 'name'], 'Do not forward provider credentials')
    if (extension && owner.provider.id === 'deepseek-official') {
      return React.createElement('span', { 'data-test-label': true }, owner.model.name, ' ', '1017')
    }
    return options.fallback
  }
  let tree
  const render = () => React.createElement(Component, { locked: false, sessionId: 'session-test', renderSlot })
  await act(async () => { tree = TestRenderer.create(render()) })
  t.after(() => { act(() => tree.unmount()); assert.equal(subscribers.size, 0) })
  return {
    tree, selections, outletCalls,
    official,
    snapshot: () => snapshot,
    async showModels() { await act(async () => tree.root.findByProps({ className: 'sk5-trigger' }).props.onClick()) },
    async disableExtension() { extension = false; await act(async () => tree.update(render())) },
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

test('DSH labels decorate trigger/options and absent contributions restore catalog names', async t => {
  const ui = await mount(t)
  assert.match(text(ui.tree.toJSON()), /DeepSeek-V4\.1-Flash 1017/)
  assert.equal(ui.outletCalls[0].placement, 'trigger')
  assert.equal(ui.outletCalls[0].selected, true)
  assert.equal(ui.outletCalls[0].model, ui.official, 'Pass the exact catalog entry')
  await ui.showModels()
  const options = ui.outletCalls.filter(call => call.placement === 'option')
  assert.ok(options.some(call => call.provider.id === 'deepseek-official' && call.selected))
  assert.ok(options.some(call => call.provider.id === 'custom' && !call.selected))
  assert.equal(ui.tree.root.findAllByProps({ 'data-test-label': true }).length, 2)
  await ui.disableExtension()
  assert.equal(ui.tree.root.findAllByProps({ 'data-test-label': true }).length, 0)
  assert.match(text(ui.tree.toJSON()), /DeepSeek-V4\.1-Flash/)
  assert.doesNotMatch(text(ui.tree.toJSON()), /1017/)
})

test('no contributor and a stale selection retain readable fallback names', async t => {
  const ui = await mount(t, { extension: false, currentModel: 'removed-model' })
  assert.match(text(ui.tree.toJSON()), /removed-model/)
  assert.equal(ui.outletCalls.length, 0, 'A missing catalog entry must not enter label contributions')
  await ui.showModels()
  assert.match(text(ui.tree.toJSON()), /DeepSeek-V4\.1-Flash/)
  assert.match(text(ui.tree.toJSON()), /Custom Flash/)
})

test('decorated rows submit original provider/model/effort IDs', async t => {
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
  assert.ok(ui.selections.every(selection => !selection.model.includes('1017')))
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
  assert.ok(ui.outletCalls.some(call => call.model === updatedModel))
})

test('a rejected selection keeps the menu open and displays the Remote failure', async t => {
  const ui = await mount(t, { result: { ok: false, error: { code: 'session/writer-held', message: 'Session in use' } } })
  await ui.showModels()
  await act(async () => ui.tree.root.findAllByProps({ role: 'menuitem' })[1].props.onClick())
  assert.match(text(ui.tree.toJSON()), /session\/writer-held: Session in use/)
  assert.equal(ui.tree.root.findAllByProps({ role: 'menu' }).length, 1)
})
