import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import vm from 'node:vm'
import { gunzipSync } from 'node:zlib'
import * as React from 'react'

// Every released DSH line the declared range covers. `0.2.1-rc.3` is the
// current adaptation target; the older rows keep the floor honest.
const versions = ['0.1.5-alpha.1', '0.2.0-rc.2', '0.2.1-rc.2', '0.2.1-rc.3']
// DSH's official model selector started declaring the label child in 0.2.1.
const ownsLabel = version => version.startsWith('0.2.1-')
const clientCode = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
const cacheDir = join('node_modules', '.cache', 'dsh-tarballs')
mkdirSync(cacheDir, { recursive: true })

function archiveFile(archive, wanted) {
  const tar = gunzipSync(archive)
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512)
    const name = header.subarray(0, 100).toString().replace(/\0.*$/, '')
    if (!name) break
    const size = parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, '').trim(), 8) || 0
    if (name === wanted) return tar.subarray(offset + 512, offset + 512 + size).toString()
    offset += 512 + Math.ceil(size / 512) * 512
  }
  throw new Error(`Missing archive entry: ${wanted}`)
}

async function tarball(version) {
  const file = join(cacheDir, `@deepseek-ai__dsh-client-ui-slots-${version}.tgz`)
  if (existsSync(file)) return readFileSync(file)
  const url = `https://registry.npmjs.org/@deepseek-ai/dsh-client-ui-slots/-/dsh-client-ui-slots-${version}.tgz`
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
      assert.ok(response.ok, `HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      writeFileSync(file, buffer)
      return buffer
    } catch (error) {
      if (attempt === 4) throw new Error(`Cannot fetch DSH ${version}: ${error.message}`)
      await new Promise(resolve => setTimeout(resolve, 1500 * attempt))
    }
  }
}

for (const version of versions) {
  const source = archiveFile(await tarball(version), 'package/lib/index.js')
  const { SlotCore } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  const core = new SlotCore()
  const official = () => null
  core.register({
    name: 'root',
    children: { 'conversation.input.model': { kind: 'single', scope: 'session' } },
  }, () => null)
  core.register({
    name: 'conversation.input.model',
    ...(ownsLabel(version) ? { children: { 'conversation.input.model.label': { kind: 'single', scope: 'session', inline: true } } } : {}),
  }, official)
  let plugin
  const disposers = []
  vm.runInNewContext(clientCode, {
    window: { __ModuleLoader__: { load: ({ factory }) => {
      plugin = factory(name => { assert.equal(name, 'react'); return React })
    } } },
  })
  plugin.apply({
    modelDirectories: {}, sessions: {}, effect: () => () => {},
    slots: {
      inject: (_key, register) => register(),
      register: (options, component) => {
        const dispose = core.register(options, component)
        disposers.push(dispose)
        return dispose
      },
    },
  })
  assert.notEqual(core.entriesOfSlot('conversation.input.model')[0].component, official)
  if (ownsLabel(version)) assert.ok(core.spec('conversation.input.model.label'), 'Official label declaration must survive')
  for (const dispose of disposers) dispose()
  assert.equal(core.entriesOfSlot('conversation.input.model')[0].component, official)
  if (ownsLabel(version)) assert.ok(core.spec('conversation.input.model.label'), 'Plugin unload must not dispose official labels')
  console.log(`DSH ${version}: real SlotCore registration, priority shadowing and unload passed`)
}