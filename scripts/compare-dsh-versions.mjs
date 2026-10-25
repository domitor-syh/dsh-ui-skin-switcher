// Compare DSH package contents between two published versions.
// Usage: node scripts/compare-dsh-versions.mjs <from> <to> [package...]
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'

const [, , from = '0.2.1-rc.2', to = '0.2.1-rc.3', ...only] = process.argv
const packages = only.length > 0 ? only : [
  '@deepseek-ai/dsh-client-ui-model-selection',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-renderer',
  '@deepseek-ai/dsh-client-ui-conversation',
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-api-session-controller',
  '@deepseek-ai/dsh-api-remotes',
]

function entries(tar) {
  const files = new Map()
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512)
    const name = header.subarray(0, 100).toString().replace(/\0.*$/, '')
    if (!name) break
    const size = parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, '').trim(), 8) || 0
    const type = String.fromCharCode(header[156] || 48)
    if (type === '0' && /\.(js|d\.ts|json|md)$/.test(name)) {
      const body = tar.subarray(offset + 512, offset + 512 + size)
      files.set(name, body)
    }
    offset += 512 + Math.ceil(size / 512) * 512
  }
  return files
}

async function tarball(name, version) {
  const url = `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${version}.tgz`
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!response.ok) throw new Error(`${name}@${version}: HTTP ${response.status}`)
  return entries(gunzipSync(Buffer.from(await response.arrayBuffer())))
}

const hash = buffer => createHash('sha256').update(buffer).digest('hex').slice(0, 12)

let totalChanged = 0
for (const name of packages) {
  let before, after
  try {
    ;[before, after] = await Promise.all([tarball(name, from), tarball(name, to)])
  } catch (error) {
    console.log(`\n${name}: SKIP (${error.message})`)
    continue
  }
  const changed = []
  for (const [file, body] of after) {
    const old = before.get(file)
    if (old === undefined) changed.push(`  + ${file}`)
    else if (hash(old) !== hash(body)) changed.push(`  ~ ${file} (${old.length} -> ${body.length} bytes)`)
  }
  for (const file of before.keys()) if (!after.has(file)) changed.push(`  - ${file}`)
  totalChanged += changed.length
  console.log(`\n${name}@${from} -> ${to}: ${changed.length === 0 ? 'IDENTICAL' : changed.length + ' difference(s)'}`)
  for (const line of changed.slice(0, 40)) console.log(line)
}

console.log(`\nTotal differences across ${packages.length} package(s): ${totalChanged}`)