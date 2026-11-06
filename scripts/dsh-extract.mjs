// Extract files from two published DSH package versions for offline diffing.
// Downloads (and caches) the tarballs when missing.
// Usage: node scripts/dsh-extract.mjs <outDir> <from> <to> <pkg:path> [...]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const [outDir, from, to, ...specs] = process.argv.slice(2)
const cacheDir = join('node_modules', '.cache', 'dsh-tarballs')
mkdirSync(cacheDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

function entries(tar) {
  const files = new Map()
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512)
    const name = header.subarray(0, 100).toString().replace(/\0.*$/, '')
    if (!name) break
    const size = parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, '').trim(), 8) || 0
    if (String.fromCharCode(header[156] || 48) === '0') {
      files.set(name, tar.subarray(offset + 512, offset + 512 + size).toString())
    }
    offset += 512 + Math.ceil(size / 512) * 512
  }
  return files
}

async function tarball(name, version) {
  const file = join(cacheDir, `${name.replace('/', '__')}-${version}.tgz`)
  if (existsSync(file)) return readFileSync(file)
  const url = `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${version}.tgz`
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(90_000) })
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
  if (!cache.has(key)) cache.set(key, entries(gunzipSync(await tarball(name, version))))
  return cache.get(key)
}

for (const spec of specs) {
  const index = spec.indexOf(':')
  const name = spec.slice(0, index)
  const path = `package/${spec.slice(index + 1)}`
  for (const [label, version] of [['from', from], ['to', to]]) {
    const body = await files(name, version)
    const base = path.split('/').pop()
    writeFileSync(join(outDir, `${base}.${label}.${version}`), (body.get(path) ?? '(missing)\n').replace(/\r\n/g, '\n'))
  }
}
console.log('extracted to', outDir)