// Print a diff of chosen files between two published DSH versions, caching tarballs.
// Usage: node scripts/diff-dsh-files.mjs <from> <to> <pkg:path> [...]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const [, , from, to, ...specs] = process.argv
const cacheDir = join('node_modules', '.cache', 'dsh-tarballs')
mkdirSync(cacheDir, { recursive: true })

function entries(tar) {
  const files = new Map()
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512)
    const name = header.subarray(0, 100).toString().replace(/\0.*$/, '')
    if (!name) break
    const size = parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, '').trim(), 8) || 0
    const type = String.fromCharCode(header[156] || 48)
    if (type === '0') files.set(name, tar.subarray(offset + 512, offset + 512 + size).toString())
    offset += 512 + Math.ceil(size / 512) * 512
  }
  return files
}

async function download(name, version) {
  const file = join(cacheDir, `${name.replace('/', '__')}-${version}.tgz`)
  if (existsSync(file)) return readFileSync(file)
  const url = `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${version}.tgz`
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      writeFileSync(file, buffer)
      return buffer
    } catch (error) {
      if (attempt === 4) throw new Error(`${name}@${version}: ${error.message}`)
      await new Promise(resolve => setTimeout(resolve, 1500 * attempt))
    }
  }
}

const cache = new Map()
async function files(name, version) {
  const key = `${name}@${version}`
  if (!cache.has(key)) cache.set(key, entries(gunzipSync(await download(name, version))))
  return cache.get(key)
}

for (const spec of specs) {
  const index = spec.indexOf(':')
  const name = spec.slice(0, index)
  const path = `package/${spec.slice(index + 1)}`
  const [before, after] = await Promise.all([files(name, from), files(name, to)])
  const old = (before.get(path) ?? '').split('\n')
  const next = (after.get(path) ?? '').split('\n')
  console.log(`\n=== ${name} :: ${path} ===`)
  if (old.join('\n') === next.join('\n')) { console.log('(identical)'); continue }
  let start = 0
  while (start < old.length && start < next.length && old[start] === next[start]) start++
  let endOld = old.length - 1
  let endNext = next.length - 1
  while (endOld >= start && endNext >= start && old[endOld] === next[endNext]) { endOld--; endNext-- }
  const context = Math.max(0, start - 8)
  console.log(`--- changed region near line ${start + 1}`)
  for (let i = context; i < start; i++) console.log(`  ${old[i]}`)
  for (let i = start; i <= endOld; i++) console.log(`- ${old[i]}`)
  for (let i = start; i <= endNext; i++) console.log(`+ ${next[i]}`)
  for (let i = endOld + 1; i < Math.min(old.length, endOld + 5); i++) console.log(`  ${old[i]}`)
}