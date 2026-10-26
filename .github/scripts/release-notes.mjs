#!/usr/bin/env node
/**
 * Print the CHANGELOG.md section for one released version, for use as the body
 * of its GitHub Release.
 *
 * GitHub's `--generate-notes` only describes merged pull requests, so a version
 * shipped by committing straight to `main` produced a release with nothing but
 * the compare link. The changelog is the curated record, so the release body is
 * taken from it.
 *
 * Usage: node .github/scripts/release-notes.mjs <version>
 * Exits 0 with empty stdout when the changelog has no section for the version,
 * letting the caller fall back to generated notes.
 */
import { existsSync, readFileSync } from 'node:fs'

const version = (process.argv[2] ?? '').replace(/^v/, '')
if (version === '') {
  console.error('usage: release-notes.mjs <version>')
  process.exit(2)
}

const file = 'CHANGELOG.md'
if (!existsSync(file)) process.exit(0)

const lines = readFileSync(file, 'utf8').split(/\r?\n/)
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const heading = new RegExp(`^##\\s*\\[${escaped}\\]`)
const start = lines.findIndex(line => heading.test(line))
if (start < 0) {
  console.error(`no ${file} section for ${version}`)
  process.exit(0)
}

let end = lines.length
for (let index = start + 1; index < lines.length; index++) {
  if (/^##\s/.test(lines[index])) { end = index; break }
}

const body = lines.slice(start, end).join('\n').trim()
if (body === '') process.exit(0)
process.stdout.write(`${body}\n`)