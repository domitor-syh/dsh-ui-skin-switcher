/**
 * The colour switcher rendered on this bundle's own detail page
 * (`plugins.bundle.config`, keyed by the bundle's package name).
 *
 * The page hands bundle configuration no form (a bundle may contribute several
 * sections, so there is no single form to hand out); this component therefore
 * reads and writes the plugin's settings namespace through the shared
 * `configForms` service and renders its own save control. The section appears
 * only while that namespace exists — registration is gated by
 * `configForms.whileServed` in `index.ts`.
 *
 * Interaction model (matching the design the user supplied): pick a mode, then
 * either pick one master colour (auto) or tune the six slots one by one
 * (custom). Edits preview on the real composer UI immediately; "Apply" writes
 * them to the Host configuration, which is what survives a restart.
 */
import * as React from 'react'
import { DEFAULT_MASTER, deriveFromMaster, mixHex, parseHex, SLOT_KEYS, toHex } from './palette.js'
import { readFollowSeat, readPaletteConfig, setPalette, type PaletteColors } from './palette-store.js'

type SlotKey = keyof PaletteColors
type Mode = 'auto' | 'custom'

interface Draft {
  mode: Mode
  master: string
  custom: Record<SlotKey, string>
}

const SLOT_KEYS_ORDER: SlotKey[] = ['dialogFont', 'maxDot', 'slider', 'sliderGlow', 'gridNormal', 'gridBlink']

/** Presets carried over from the supplied design. */
const PRESETS = [
  '#2F6BFF', '#5B8CFF', '#7AC0FF', '#35E0A1', '#2BD9C0', '#F5D061', '#FFB020',
  '#FF5B4A', '#E85C8A', '#9B7BFF', '#C9CDD8', '#8A90A0', '#3A3F4E', '#ECEEF3',
]

/** Parse a user string the way the design's field promised: #RGB, #RRGGBB, #RRGGBBAA. */
function normalizeHex(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const rgb = parseHex(input)
  return rgb === null ? null : toHex(rgb)
}

function storedColor(value: unknown, fallback: string): string {
  return normalizeHex(value) ?? fallback
}

function draftFrom(value: any): Draft {
  const mode: Mode = value?.mode === 'custom' ? 'custom' : 'auto'
  const custom = {} as Record<SlotKey, string>
  for (const key of SLOT_KEYS_ORDER) custom[key] = storedColor(value?.[key], '')
  return { mode, master: storedColor(value?.master, DEFAULT_MASTER), custom }
}

/** An all-empty custom map: every slot follows the master. */
function emptyCustom(): Record<SlotKey, string> {
  const custom = {} as Record<SlotKey, string>
  for (const key of SLOT_KEYS_ORDER) custom[key] = ''
  return custom
}

/** Resolve a draft to the six colours the composer UI shows. */
export function resolveDraft(draft: Draft): PaletteColors {
  const derived = deriveFromMaster(draft.master) ?? /** @type {PaletteColors} */ (deriveFromMaster(DEFAULT_MASTER))
  if (draft.mode === 'auto') return derived
  const resolved: PaletteColors = { ...derived }
  for (const key of SLOT_KEYS_ORDER) {
    const picked = normalizeHex(draft.custom[key])
    if (picked !== null) resolved[key] = picked
  }
  return resolved
}

interface Hsv { h: number; s: number; v: number }

function rgbToHsv(hex: string): Hsv {
  const rgb = parseHex(hex)
  if (rgb === null) return { h: 0, s: 0, v: 0 }
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 }
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = (v / 100) * (s / 100)
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v / 100 - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) { r = c; g = x } else if (h < 120) { r = x; g = c } else if (h < 180) { g = c; b = x } else if (h < 240) { g = x; b = c } else if (h < 300) { r = x; b = c } else { r = c; b = x }
  return toHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 })
}

/**
 * Hue stops just short of 360: hsl(360) is the same red as hsl(0), and the
 * round trip through RGB would report hue 0 again, snapping the thumb from
 * the far right to the far left. Keeping the top of the range at 359.9 keeps
 * both ends stable.
 */
const HUE_MAX = 359.9

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Small stroke icon; the settings page supplies no icon set to plugins. */
function icon(path: string): any {
  return React.createElement('svg', {
    viewBox: '0 0 24 24', width: 15, height: 15, fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': true,
  }, React.createElement('path', { d: path }))
}

const ICON_PALETTE = 'M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H13a1.5 1.5 0 0 1 0-3h1.5A5.5 5.5 0 0 0 20 9.5C20 5.9 16.4 3 12 3Zm-4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2.5 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'
const ICON_LIST = 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01'
const ICON_DROP = 'M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z'

interface ColorSectionProps {
  form: any
  t: (key: string, params?: Record<string, unknown>) => string
}

/**
 * Render the colour switcher section.
 * @param props - the settings form for this plugin's namespace and a translator.
 * @returns the section element.
 */
export function ColorSection({ form, t }: ColorSectionProps): any {
  const snapshot = React.useSyncExternalStore(
    React.useCallback((listener: () => void) => form.subscribe(listener), [form]),
    React.useCallback(() => form.getSnapshot(), [form]),
    React.useCallback(() => form.getSnapshot(), [form]),
  )
  const ready = snapshot.status === 'ready'
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(snapshot.value))
  const [target, setTarget] = React.useState<SlotKey>('dialogFont')
  const [text, setText] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  /** Seat-follow switch; mirrors the stored value and updates optimistically. */
  const [followSeat, setFollowSeat] = React.useState<boolean>(() => snapshot.value?.followSeat !== false)
  const hueRef = React.useRef<any>(null)
  const svRef = React.useRef<any>(null)
  /**
   * Hue as picked, kept across the 8-bit colour round trip. Near 360°, a hex
   * quantises to pure red, whose hue reads back as 0 — deriving the thumb from
   * the hex alone would therefore snap it from the far right to the far left.
   */
  const hueLock = React.useRef<number | null>(null)
  const draftRef = React.useRef(draft)
  draftRef.current = draft

  // The Host is the source of truth: adopt it whenever the namespace moves.
  React.useEffect(() => {
    if (!ready) return
    hueLock.current = null
    setDraft(draftFrom(snapshot.value))
    setFollowSeat(snapshot.value?.followSeat !== false)
    setError(null)
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revision is the change identity
  }, [ready, snapshot.revision])

  // Preview on the real composer UI while editing; restore the saved palette
  // when the section unmounts without an apply.
  React.useEffect(() => {
    setPalette(resolveDraft(draft), followSeat)
  }, [draft, followSeat])
  const savedRef = React.useRef(snapshot.value)
  savedRef.current = snapshot.value
  React.useEffect(() => () => {
    const value = savedRef.current
    setPalette(readPaletteConfig(value), readFollowSeat(value))
  }, [])

  const colors = resolveDraft(draft)
  const activeKey = draft.mode === 'auto' ? null : target
  // An empty custom slot is not "no colour": it still resolves from the master,
  // so the field, the picker and the highlighted preset show that resolved hex.
  const activeHex = activeKey === null ? draft.master : colors[activeKey]
  const hsv = rgbToHsv(activeHex)
  /** Hue shown on the track: the picked one while dragging, else the colour's own. */
  const hue = hueLock.current ?? hsv.h

  // Keep the text field showing the colour being edited, unless it has focus.
  React.useEffect(() => {
    setText(activeHex)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- follows the edited colour only
  }, [activeHex])

  /** `keepHue` keeps a hue that a dragged colour cannot represent exactly. */
  const setActive = (hex: string, keepHue = false) => {
    const normalized = normalizeHex(hex)
    if (normalized === null) return
    if (!keepHue) hueLock.current = null
    setSaved(false)
    setDraft((current) => {
      if (current.mode === 'auto') return { ...current, master: normalized }
      const custom = { ...current.custom, [target]: normalized }
      return { ...current, custom }
    })
  }

  const pickFromHue = (clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect()
    if (rect === undefined || rect.width === 0) return
    const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, HUE_MAX)
    hueLock.current = h
    setActive(hsvToHex(h, hsv.s === 0 ? 100 : hsv.s, hsv.v === 0 ? 100 : hsv.v), true)
  }

  const pickFromSv = (clientX: number, clientY: number) => {
    const rect = svRef.current?.getBoundingClientRect()
    if (rect === undefined || rect.width === 0 || rect.height === 0) return
    const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
    const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100)
    setActive(hsvToHex(hue, s, v), true)
  }

  const drag = (handler: (x: number, y: number) => void) => (event: any) => {
    if (event.button !== undefined && event.button !== 0) return
    event.preventDefault()
    handler(event.clientX, event.clientY)
    const move = (e: any) => handler(e.clientX, e.clientY)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const apply = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const fields: [string, string][] = [
        ['mode', draft.mode],
        ['master', draft.master],
      ]
      // Auto mode leaves the per-slot values untouched: switching back to
      // custom later restores the palette the user had tuned, instead of
      // silently erasing it because auto happened to be saved in between.
      if (draft.mode === 'custom') {
        for (const key of SLOT_KEYS_ORDER) {
          fields.push([key, normalizeHex(draft.custom[key]) ?? ''])
        }
      }
      for (const [field, value] of fields) {
        const accepted = await form.set(field, value)
        if (!accepted) {
          setError(t('color.saveFailed'))
          return
        }
      }
      setSaved(true)
      setPalette(resolveDraft(draftRef.current), followSeat)
    } catch (error: any) {
      setError(error?.message ?? String(error))
    } finally {
      setBusy(false)
    }
  }

  /** Restore the shipped palette immediately and persist it. */
  const reset = async () => {
    if (busy) return
    const next: Draft = { mode: 'auto', master: DEFAULT_MASTER, custom: emptyCustom() }
    hueLock.current = null
    setDraft(next)
    setSaved(false)
    setBusy(true)
    setError(null)
    setPalette(resolveDraft(next), followSeat)
    try {
      const fields: [string, string][] = [['mode', 'auto'], ['master', DEFAULT_MASTER]]
      for (const key of SLOT_KEYS_ORDER) fields.push([key, ''])
      for (const [field, value] of fields) {
        const accepted = await form.set(field, value)
        if (!accepted) {
          setError(t('color.saveFailed'))
          return
        }
      }
      setSaved(true)
    } catch (error: any) {
      setError(error?.message ?? String(error))
    } finally {
      setBusy(false)
    }
  }

  /** Toggle whether the seat's top-effort label takes the value colour. */
  const toggleFollowSeat = async () => {
    const next = !followSeat
    setFollowSeat(next)
    setPalette(resolveDraft(draftRef.current), next)
    try {
      const accepted = await form.set('followSeat', next)
      if (!accepted) {
        setFollowSeat(!next)
        setPalette(resolveDraft(draftRef.current), !next)
        setError(t('color.saveFailed'))
      }
    } catch (error: any) {
      setFollowSeat(!next)
      setPalette(resolveDraft(draftRef.current), !next)
      setError(error?.message ?? String(error))
    }
  }

  const modeOption = (mode: Mode) => React.createElement('label', {
    key: mode,
    className: 'sk5c-mode' + (draft.mode === mode ? ' is-on' : ''),
  },
    React.createElement('input', {
      type: 'radio', name: 'sk5c-mode', checked: draft.mode === mode,
      onChange: () => { hueLock.current = null; setSaved(false); setDraft((current) => ({ ...current, mode })) },
    }),
    React.createElement('svg', {
      className: 'sk5c-dot', viewBox: '0 0 14 14', width: 14, height: 14, 'aria-hidden': true,
    },
      React.createElement('circle', { cx: 7, cy: 7, r: 6.5, fill: 'none', stroke: 'var(--sk5c-input)', strokeWidth: 1 }),
      draft.mode === mode
        ? React.createElement('circle', { cx: 7, cy: 7, r: 3.5, fill: 'var(--sk5c-primary)' })
        : null,
    ),
    React.createElement('span', null,
      React.createElement('span', { className: 'sk5c-mode-title' }, t('color.mode.' + mode)),
      React.createElement('span', { className: 'sk5c-mode-desc' }, t('color.mode.' + mode + '.desc')),
    ),
  )

  const row = (key: SlotKey) => {
    const auto = draft.mode === 'auto'
    const selected = !auto && target === key
    const value = colors[key]
    return React.createElement('li', { key },
      React.createElement('button', {
        type: 'button',
        className: 'sk5c-row' + (selected ? ' is-selected' : '') + (auto ? ' is-auto' : ''),
        disabled: auto,
        'aria-pressed': selected,
        onClick: () => { if (!auto) { hueLock.current = null; setTarget(key) } },
      },
        React.createElement('span', { className: 'sk5c-row-text' },
          React.createElement('span', { className: 'sk5c-row-name' },
            t('color.slot.' + key),
            React.createElement('span', { className: 'sk5c-auto' }, t('color.auto')),
          ),
          React.createElement('span', { className: 'sk5c-hex' }, value),
        ),
        React.createElement('span', { className: 'sk5c-chip', style: { background: value } }),
      ),
    )
  }

  return React.createElement('div', { className: 'sk5c' },
    React.createElement('header', { className: 'sk5c-header' },
      React.createElement('span', { className: 'sk5c-badge-icon' }, icon(ICON_PALETTE)),
      React.createElement('span', null,
        React.createElement('h3', { className: 'sk5c-title' }, t('color.title')),
        React.createElement('p', { className: 'sk5c-subtitle' }, t('color.subtitle')),
      ),
    ),
    React.createElement('div', { className: 'sk5c-panel' },
      React.createElement('div', { className: 'sk5c-col' },
        React.createElement('section', { className: 'sk5c-section' },
          React.createElement('div', { className: 'sk5c-head' },
            React.createElement('h4', null, t('color.mode')),
          ),
          React.createElement('div', { className: 'sk5c-modes' }, modeOption('auto'), modeOption('custom')),
        ),
        React.createElement('section', { className: 'sk5c-section' },
          React.createElement('div', { className: 'sk5c-head' },
            icon(ICON_LIST),
            React.createElement('h4', null, t('color.items')),
            React.createElement('span', { className: 'sk5c-hint' }, t('color.items.hint')),
          ),
          React.createElement('ul', { className: 'sk5c-list' }, SLOT_KEYS_ORDER.map(row)),
        ),
      ),
      React.createElement('section', { className: 'sk5c-section sk5c-palette' },
        React.createElement('div', { className: 'sk5c-head' },
          icon(ICON_DROP),
          React.createElement('h4', null, t('color.palette')),
          React.createElement('span', { className: 'sk5c-hint' }, t('color.palette.hint')),
        ),
        draft.mode === 'auto'
          ? React.createElement('div', { className: 'sk5c-master' },
              React.createElement('span', null,
                React.createElement('span', { className: 'sk5c-row-name' }, t('color.master')),
                React.createElement('span', { className: 'sk5c-hex' }, draft.master),
              ),
              React.createElement('span', { className: 'sk5c-chip', style: { background: draft.master } }),
            )
          : React.createElement('p', { className: 'sk5c-target' },
              t('color.target'),
              React.createElement('strong', null, t('color.slot.' + target)),
            ),
        React.createElement('div', { className: 'sk5c-presets' },
          PRESETS.map((preset) => React.createElement('button', {
            key: preset,
            type: 'button',
            className: 'sk5c-preset' + (preset === normalizeHex(activeHex) ? ' is-active' : ''),
            style: { background: preset },
            title: preset,
            'aria-label': preset,
            onClick: () => setActive(preset),
          })),
        ),
        React.createElement('div', { className: 'sk5c-picker' },
          React.createElement('div', { className: 'sk5c-picker-block' },
            React.createElement('div', {
              className: 'sk5c-hue', ref: hueRef, role: 'slider', tabIndex: 0,
              'aria-label': t('color.hue'), 'aria-valuemin': 0, 'aria-valuemax': 360,
              'aria-valuenow': Math.round(hue),
              onPointerDown: drag(pickFromHue),
              onKeyDown: (event: any) => {
                const step = event.shiftKey ? 1 : 5
                let next: number
                if (event.key === 'ArrowLeft') next = clamp(hue - step, 0, HUE_MAX)
                else if (event.key === 'ArrowRight') next = clamp(hue + step, 0, HUE_MAX)
                else return
                event.preventDefault()
                hueLock.current = next
                setActive(hsvToHex(next, hsv.s, hsv.v), true)
              },
            }, React.createElement('svg', {
              className: 'sk5c-hue-thumb', viewBox: '0 0 20 20', width: 20, height: 20,
              'aria-hidden': true,
              style: { left: (hue / 360) * 100 + '%' },
            },
              React.createElement('circle', { cx: 10, cy: 10, r: 9.5, fill: 'none', stroke: 'rgba(0,0,0,.45)', strokeWidth: 1 }),
              React.createElement('circle', {
                cx: 10, cy: 10, r: 8.5, fill: `hsl(${hue} 100% 50%)`,
                stroke: 'rgba(255,255,255,.92)', strokeWidth: 2,
              }),
            )),
          ),
          React.createElement('div', { className: 'sk5c-picker-block' },
            React.createElement('div', {
              className: 'sk5c-sv', ref: svRef, role: 'slider', tabIndex: 0,
              'aria-label': t('color.sv'),
              style: { backgroundColor: `hsl(${hue} 100% 50%)` },
              onPointerDown: drag((x, y) => pickFromSv(x, y)),
              onKeyDown: (event: any) => {
                const step = event.shiftKey ? 1 : 5
                if (event.key === 'ArrowLeft') setActive(hsvToHex(hue, clamp(hsv.s - step, 0, 100), hsv.v), true)
                else if (event.key === 'ArrowRight') setActive(hsvToHex(hue, clamp(hsv.s + step, 0, 100), hsv.v), true)
                else if (event.key === 'ArrowUp') setActive(hsvToHex(hue, hsv.s, clamp(hsv.v + step, 0, 100)), true)
                else if (event.key === 'ArrowDown') setActive(hsvToHex(hue, hsv.s, clamp(hsv.v - step, 0, 100)), true)
                else return
                event.preventDefault()
              },
            },
              React.createElement('svg', {
                className: 'sk5c-sv-thumb', viewBox: '0 0 20 20', width: 18, height: 18,
                'aria-hidden': true,
                style: { left: hsv.s + '%', top: 100 - hsv.v + '%' },
              },
                React.createElement('circle', { cx: 10, cy: 10, r: 9.5, fill: 'none', stroke: 'rgba(0,0,0,.45)', strokeWidth: 1 }),
                React.createElement('circle', {
                  cx: 10, cy: 10, r: 8.5, fill: activeHex,
                  stroke: 'rgba(255,255,255,.92)', strokeWidth: 2,
                }),
              ),
            ),
          ),
        ),
        React.createElement('div', { className: 'sk5c-switch-row' },
          React.createElement('span', { className: 'sk5c-switch-text' }, t('color.followSeat')),
          React.createElement('button', {
            type: 'button', role: 'switch', 'aria-checked': followSeat,
            className: 'sk5c-switch' + (followSeat ? ' is-on' : ''),
            onClick: () => void toggleFollowSeat(),
          }, React.createElement('span', { className: 'sk5c-switch-knob', 'aria-hidden': true })),
        ),
        React.createElement('div', { className: 'sk5c-code' },
          React.createElement('label', { className: 'sk5c-label', htmlFor: 'sk5c-code-input' }, t('color.code')),
          React.createElement('div', { className: 'sk5c-code-row' },
            React.createElement('input', {
              id: 'sk5c-code-input',
              className: 'sk5c-input' + (error === null ? '' : ' is-error'),
              value: text,
              spellCheck: false,
              onChange: (event: any) => {
                setText(event.target.value)
                const normalized = normalizeHex(event.target.value)
                if (normalized === null) setError(t('color.invalid'))
                else {
                  setError(null)
                  setActive(normalized)
                }
              },
              onKeyDown: (event: any) => {
                if (event.key === 'Enter' && normalizeHex(text) !== null) void apply()
              },
            }),
            React.createElement('button', {
              type: 'button', className: 'sk5c-apply', disabled: busy || error !== null,
              onClick: () => void apply(),
            }, busy ? t('color.saving') : t('color.apply')),
          ),
        ),
        React.createElement('div', { className: 'sk5c-actions' },
          React.createElement('button', {
            type: 'button', className: 'sk5c-reset', disabled: busy,
            onClick: () => void reset(),
          }, t('color.reset')),
        ),
        error !== null
          ? React.createElement('p', { className: 'sk5c-note is-error' }, error)
          : saved
            ? React.createElement('p', { className: 'sk5c-note' }, t('color.saved'))
            : React.createElement('p', { className: 'sk5c-note' }, t('color.previewHint')),
      ),
    ),
  )
}