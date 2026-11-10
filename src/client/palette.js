/**
 * Colour model for the skin switcher's palette.
 *
 * The six visible accent spots in the composer UI are one hue family measured
 * from the shipping palette: the popover's effort value (`#679EFE`), the top
 * level dot and handle glow (`#679EFE`), the handle body (`#D4E2FC`), the dot
 * matrix's normal cells (`#4176E6`) and its flash cells (`#84AAF4`).
 *
 * A user picks ONE master colour — the effort value — and the rest follow the
 * relative offsets below. Offsets were measured in OKLab, where a lightness
 * delta is perceptually uniform and a chroma ratio keeps a neutral master
 * neutral instead of tinting it. At the shipped master the derivation
 * reproduces every original hex exactly, so "no configuration" is pixel
 * identical to the previous fixed palette.
 */

/** The shipped effort-value colour: the derivation's anchor. */
export const DEFAULT_MASTER = '#679EFE'

/**
 * Relative offsets from the master (the "strong" colour) to each derived slot.
 * `ratio` scales chroma so a grey master stays grey; `dL`/`dH` apply directly.
 */
const D_STRONG = { dL: 0.114793, ratio: 0.849409, dH: -2.4327 }
const D_SOFT = { dL: 0.150329, ratio: 0.637884, dH: -0.4457 }
const D_MID = { dL: 0.057276, ratio: 0.923871, dH: -1.003 }

/** sRGB <-> OKLab matrices; the inverses are the numeric inverses of these two. */
const M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6171959274],
]
const M2 = [
  [0.2104542553, 0.7936177850, -0.0040720468],
  [1.9779984951, -2.4285922050, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.8086757660],
]
const M1I = [
  [4.076728996215054, -3.309834733049987, 0.23612405674476947],
  [-1.2684192879954381, 2.6128949076486467, -0.3489359889652868],
  [-0.004289722831717083, -0.719115504557837, 1.745720374764302],
]
const M2I = [
  [0.9999999984505199, 0.39633779217376786, 0.2158037580607588],
  [1.0000000088817607, -0.10556134232365634, -0.0638541747717059],
  [1.000000054672411, -0.08948418209496577, -1.291485537864092],
]

function multiply(matrix, vector) {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
    matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2],
  ]
}

function toLinear(value) {
  const v = value / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function fromLinear(value) {
  const v = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055
  return Math.min(1, Math.max(0, v)) * 255
}

/**
 * Parse `#RGB`, `#RRGGBB` or `#RRGGBBAA` (alpha is ignored: these slots are
 * opaque; transparency is applied with `color-mix` where the UI needs it).
 * @param {string} input
 * @returns {{r: number, g: number, b: number} | null}
 */
export function parseHex(input) {
  if (typeof input !== 'string') return null
  let hex = input.trim().replace(/^#/, '')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  if (hex.length === 8) hex = hex.slice(0, 6)
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

/**
 * @param {{r: number, g: number, b: number}} rgb
 * @returns {string} uppercase `#RRGGBB`
 */
export function toHex(rgb) {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * @param {{r: number, g: number, b: number}} rgb
 * @returns {[number, number, number]} OKLab
 */
export function toOklab(rgb) {
  const lms = multiply(M1, [toLinear(rgb.r), toLinear(rgb.g), toLinear(rgb.b)]).map((v) => Math.cbrt(v))
  return multiply(M2, lms)
}

/**
 * @param {[number, number, number]} lab
 * @returns {{r: number, g: number, b: number}}
 */
export function fromOklab(lab) {
  const lms = multiply(M2I, lab).map((v) => v ** 3)
  const [r, g, b] = multiply(M1I, lms)
  return { r: fromLinear(r), g: fromLinear(g), b: fromLinear(b) }
}

function toLch(lab) {
  const [L, a, b] = lab
  return {
    L,
    C: Math.hypot(a, b),
    H: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
  }
}

function fromLch(lch) {
  const rad = (lch.H * Math.PI) / 180
  return fromOklab([lch.L, lch.C * Math.cos(rad), lch.C * Math.sin(rad)])
}

/**
 * Linear sRGB interpolation.
 * @param {string} a
 * @param {string} b
 * @param {number} t 0 picks `a`, 1 picks `b`
 * @returns {string | null}
 */
export function mixHex(a, b, t) {
  const ra = parseHex(a)
  const rb = parseHex(b)
  if (ra === null || rb === null) return null
  return toHex({
    r: ra.r + (rb.r - ra.r) * t,
    g: ra.g + (rb.g - ra.g) * t,
    b: ra.b + (rb.b - ra.b) * t,
  })
}

/**
 * Derive the six palette slots from one master colour (the effort value).
 * Returns `null` for an unparseable master so callers can fall back.
 * @param {string} master `#RRGGBB`
 * @returns {{dialogFont: string, maxDot: string, slider: string, sliderGlow: string, gridNormal: string, gridBlink: string} | null}
 */
export function deriveFromMaster(master) {
  const rgb = parseHex(master)
  if (rgb === null) return null
  const strong = toLch(toOklab(rgb))
  // The offsets are stored as (target - anchor); inverting them subtracts.
  const base = fromLch({
    L: strong.L - D_STRONG.dL,
    C: strong.C / D_STRONG.ratio,
    H: strong.H - D_STRONG.dH,
  })
  const baseLch = toLch(toOklab(base))
  const soft = fromLch({
    L: baseLch.L + D_SOFT.dL,
    C: baseLch.C * D_SOFT.ratio,
    H: baseLch.H + D_SOFT.dH,
  })
  const mid = fromLch({
    L: baseLch.L + D_MID.dL,
    C: baseLch.C * D_MID.ratio,
    H: baseLch.H + D_MID.dH,
  })
  const masterHex = toHex(rgb)
  return {
    dialogFont: masterHex,
    maxDot: masterHex,
    slider: /** @type {string} */ (mixHex(toHex(mid), '#FFFFFF', 0.75)),
    sliderGlow: masterHex,
    gridNormal: toHex(base),
    gridBlink: toHex(soft),
  }
}

/** The six slots in the order the settings list renders them. */
export const SLOT_KEYS = ['dialogFont', 'maxDot', 'slider', 'sliderGlow', 'gridNormal', 'gridBlink']