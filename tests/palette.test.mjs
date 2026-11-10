import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_MASTER, deriveFromMaster, mixHex, parseHex, toHex } from '../src/client/palette.js'

// The derivation must reproduce the shipped palette exactly, or turning the
// feature on would shift colours for users who never touched it.
test('the shipped master reproduces every shipped slot byte for byte', () => {
  assert.deepEqual(deriveFromMaster(DEFAULT_MASTER), {
    dialogFont: '#679EFE',
    maxDot: '#679EFE',
    slider: '#D4E2FC',
    sliderGlow: '#679EFE',
    gridNormal: '#4176E6',
    gridBlink: '#84AAF4',
  })
})

test('a neutral master stays neutral', () => {
  const slots = deriveFromMaster('#787878')
  assert.ok(slots !== null)
  for (const value of Object.values(slots)) {
    const rgb = parseHex(value)
    assert.ok(rgb !== null)
    assert.ok(Math.abs(rgb.r - rgb.g) <= 1 && Math.abs(rgb.g - rgb.b) <= 1, `${value} should stay grey`)
  }
})

test('every slot keeps the master hue family', () => {
  const slots = deriveFromMaster('#F5D061')
  assert.ok(slots !== null)
  // A warm master must not produce a cold slot: red stays above blue in all six.
  for (const value of Object.values(slots)) {
    const rgb = parseHex(value)
    assert.ok(rgb !== null && rgb.r >= rgb.b, `${value} drifted cold`)
  }
})

test('invalid input is rejected rather than guessed', () => {
  for (const value of ['', '#12', 'red', '#GGGGGG', null, undefined, 42]) {
    assert.equal(deriveFromMaster(value), null)
  }
})

test('the hex parser accepts the three documented spellings', () => {
  assert.deepEqual(parseHex('#abc'), { r: 170, g: 187, b: 204 })
  assert.deepEqual(parseHex('#679EFE'), { r: 103, g: 158, b: 254 })
  assert.deepEqual(parseHex('#679EFE80'), { r: 103, g: 158, b: 254 })
  assert.deepEqual(parseHex(' 679efe '), { r: 103, g: 158, b: 254 })
  assert.equal(parseHex('#12345'), null)
})

test('mixHex interpolates linearly and validates both ends', () => {
  assert.equal(mixHex('#000000', '#FFFFFF', 0.5), '#808080')
  assert.equal(mixHex('#679EFE', '#FFFFFF', 0), '#679EFE')
  assert.equal(mixHex('#679EFE', '#FFFFFF', 1), '#FFFFFF')
  assert.equal(mixHex('nope', '#FFFFFF', 0.5), null)
})

test('toHex clamps out-of-gamut channels instead of printing junk', () => {
  assert.equal(toHex({ r: -20, g: 300, b: 127.6 }), '#00FF80')
})