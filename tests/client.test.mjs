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
async function mount(t, { currentModel = 'deepseek-flash', outcome = { ok: true }, measureFonts = false } = {}) {
  const subscribers = new Set()
  const measuredNodes = []
  const samples = new Set()
  let fontHeights = { trigger: '14px', value: '15px' }
  const createNode = (kind) => {
    const properties = new Map()
    return {
      kind,
      style: {
        getPropertyValue: key => properties.get(key) ?? '',
        setProperty: (key, value) => properties.set(key, value),
        removeProperty: key => properties.delete(key),
      },
      appendChild(sample) { sample.kind = kind; samples.add(sample) },
    }
  }
  const fonts = new EventTarget()
  fonts.ready = Promise.resolve()
  const testDocument = new EventTarget()
  if (measureFonts) {
    testDocument.fonts = fonts
    testDocument.createElement = () => {
      const sample = { style: {}, remove() { samples.delete(sample) } }
      return sample
    }
  }
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
      const response = outcome === 'legacy-void' ? undefined : await outcome
      if (response === undefined || response.ok) publish({ ...snapshot, current: selection })
      return response
    },
  }
  let client
  const browser = new EventTarget()
  browser.devicePixelRatio = 1
  if (measureFonts) browser.getComputedStyle = element => ({
    fontSize: element.kind === 'trigger' ? '12.5px' : '13px',
    fontFamily: 'system-ui', fontWeight: element.kind === 'trigger' ? '400' : '600',
    fontStyle: 'normal', fontStretch: '100%', fontVariationSettings: 'normal',
    fontFeatureSettings: 'normal', fontSizeAdjust: 'none', fontOpticalSizing: 'auto',
    lineHeight: element.style.getPropertyValue?.('--sk5-effort-line-height') || 'normal',
    height: fontHeights[element.kind],
  })
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
    window: browser, document: testDocument, setTimeout, clearTimeout, console,
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
  await act(async () => { tree = TestRenderer.create(render(), {
    createNodeMock: element => {
      if (!measureFonts) return null
      const className = element.props.className ?? ''
      const kind = className.includes('sk5-triggerEffort') ? 'trigger'
        : className.includes('sk5-effortValue') ? 'value' : null
      if (kind === null) return null
      const node = createNode(kind)
      measuredNodes.push(node)
      return node
    },
  }) })
  t.after(() => { act(() => tree.unmount()); assert.equal(subscribers.size, 0); assert.equal(samples.size, 0) })
  return {
    tree, selections, measuredNodes, samples,
    async fontLoaded(next) { fontHeights = next; await act(async () => fonts.dispatchEvent(new Event('loadingdone'))) },
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

test('effort line boxes use separate native font metrics across default-label replacement', async t => {
  // DOM font heights are fixtures: this verifies measurement/lifecycle plumbing,
  // not actual browser geometry or pixel-identical rendering.
  const ui = await mount(t, { measureFonts: true })
  const heightOf = node => node.style.getPropertyValue('--sk5-effort-line-height')
  assert.equal(heightOf(ui.measuredNodes[0]), '14px')
  await act(async () => ui.tree.root.findByProps({ className: 'sk5-trigger sk5-triggerEffort' }).props.onClick())
  assert.equal(heightOf(ui.measuredNodes.at(-1)), '15px')
  const oldValue = ui.measuredNodes.at(-1)
  const model = { ...ui.official, reasoning: { efforts: [{ id: 'max', name: 'Max' }] } }
  await ui.update({
    ...ui.snapshot(), current: { provider: 'deepseek-official', model: model.id, reasoningEffort: 'max' },
    groups: [{ id: 'deepseek-official', name: 'DeepSeek', models: [model] }],
  })
  assert.equal(heightOf(oldValue), '', 'Discarded keyed labels release their override')
  await ui.update({ ...ui.snapshot(), current: { provider: 'deepseek-official', model: model.id } })
  assert.match(text(ui.tree.toJSON()), /默认/)
  assert.equal(heightOf(ui.measuredNodes[0]), '14px')
  assert.equal(heightOf(ui.measuredNodes.at(-1)), '15px')
  await ui.fontLoaded({ trigger: '16.5px', value: '17px' })
  assert.equal(heightOf(ui.measuredNodes[0]), '16.5px', 'Keep fractional native CSS pixel sizes')
  assert.equal(heightOf(ui.measuredNodes.at(-1)), '17px')
  assert.equal(heightOf(oldValue), '', 'Font completion must not mutate a stale label')
  assert.equal(ui.samples.size, 0, 'Temporary font probes are removed')
  await act(async () => ui.tree.unmount())
  await ui.fontLoaded({ trigger: '20px', value: '21px' })
  assert.ok(ui.measuredNodes.every(node => heightOf(node) === ''), 'Unmount removes overrides and font listeners')
})

test('an effort request only disables its trigger while the model menu stays available', async t => {
  let complete
  const pending = new Promise(resolve => { complete = resolve })
  const ui = await mount(t, { outcome: pending })
  const modelButton = () => ui.tree.root.findByProps({ className: 'sk5-trigger' })
  const effortButton = () => ui.tree.root.findByProps({ className: 'sk5-trigger sk5-triggerEffort' })
  await act(async () => effortButton().props.onClick())
  await act(async () => ui.tree.root.findByProps({ className: 'sk5-track' }).props.onPointerDown({ clientX: 0 }))
  await ui.releasePointer()
  assert.equal(ui.selections.length, 1)
  assert.equal(modelButton().props.disabled, false, 'Do not dim or disable the model trigger for effort changes')
  assert.equal(effortButton().props.disabled, true)
  await ui.showModels()
  assert.equal(ui.tree.root.findAllByProps({ role: 'menuitem' }).length, 2)
  assert.ok(ui.tree.root.findAllByProps({ role: 'menuitem' }).every(row => row.props.disabled), 'Prevent overlapping model/effort submissions')
  await act(async () => complete({ ok: true }))
  assert.equal(modelButton().props.disabled, false)
  assert.equal(effortButton().props.disabled, false)
  assert.ok(ui.tree.root.findAllByProps({ role: 'menuitem' }).every(row => !row.props.disabled))
})

test('a model request still disables both triggers and restores them after failure', async t => {
  let complete
  const pending = new Promise(resolve => { complete = resolve })
  const ui = await mount(t, { outcome: pending })
  await ui.showModels()
  await act(async () => ui.tree.root.findAllByProps({ role: 'menuitem' })[0].props.onClick())
  const buttons = () => [
    ui.tree.root.findByProps({ className: 'sk5-trigger' }),
    ui.tree.root.findByProps({ className: 'sk5-trigger sk5-triggerEffort' }),
  ]
  assert.ok(buttons().every(button => button.props.disabled))
  await act(async () => complete({ ok: false, error: { code: 'busy', message: 'Try again' } }))
  assert.ok(buttons().every(button => !button.props.disabled))
  assert.match(text(ui.tree.toJSON()), /Try again/)
})

test('a Remote envelope failure remains visible for retry', async t => {
  const ui = await mount(t, { outcome: { ok: false, error: { code: 'session/writer-held', message: 'Session in use' } } })
  await ui.showModels()
  await act(async () => ui.tree.root.findAllByProps({ role: 'menuitem' })[1].props.onClick())
  assert.match(text(ui.tree.toJSON()), /session\/writer-held: Session in use/)
  assert.equal(ui.tree.root.findAllByProps({ role: 'menu' }).length, 1)
})
