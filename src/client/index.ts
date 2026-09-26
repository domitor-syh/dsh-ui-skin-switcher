/**
 * Skin-switcher plugin, browser half — the composer's model + reasoning-effort
 * switcher. Registers the named `conversation.input.model` seat, loads the
 * session's provider-grouped directory through `session.models` and submits
 * through `session.selectModel` (the same session-scoped RPC the first-party
 * selector uses), so a switch made here takes effect on the current session and
 * is what `/model` shows next. Above the model list it renders a two-level
 * (Off/Max) reasoning-effort slider for models that declare `reasoningEfforts`,
 * remembering each model's last effort.
 */
import * as React from 'react'

/**
 * Required services: the connection RPC face (sessions models/selectModel), the
 * runtime sessions service (subagentAddress), the locale service (which
 * synthesizes the seat's `t`), and the slot registry.
 */
export const inject = ['locale', 'modelDirectories', 'remote', 'remote.session', 'sessions', 'slots']

/** Dictionary namespace owned by this plugin. */
const NS = 'ui-skin-switcher'

/** Plugin-owned copy: `zh` is the key-set source of truth, `en` mirrors it. */
const DICTS: Record<'zh' | 'en', Record<string, string>> = {
  zh: {
    'trigger.fallbackModel': '模型',
    'trigger.selectModel': '选择模型',
    'effort.title': '思考强度',
    'effort.default': '默认',
    'menu.models': '模型',
    'status.loading': '加载中…',
    'status.noModels': '暂无可用模型',
    'help.aria': '思考强度说明',
    'help.text': '调节模型推理深度，低强度回复快、内容简洁；高强度思考更全面，适合复杂问题，响应会稍慢。',
  },
  en: {
    'trigger.fallbackModel': 'Model',
    'trigger.selectModel': 'Select model',
    'effort.title': 'Reasoning effort',
    'effort.default': 'Default',
    'menu.models': 'Models',
    'status.loading': 'Loading…',
    'status.noModels': 'No models available',
    'help.aria': 'About reasoning effort',
    'help.text': 'Adjusts how deeply the model reasons: lower effort answers faster and more concisely, while higher effort thinks more thoroughly for complex problems and responds a little slower.',
  },
}

/** Dot-matrix rows to render. */
const MATRIX_ROWS = 5
/** Designed track height in CSS px; the matrix is solved to land near it. */
const MATRIX_TRACK_DESIGN = 23
/** Smallest block edge, in device px, that still reads as a square rather than a dot. */
const MATRIX_MIN_BLOCK_DEV = 3
/** Design gap between blocks, in CSS px at 100% scaling. */
const MATRIX_GAP_DESIGN = 1
/** Design margin above the first and below the last block row, in CSS px. */
const MATRIX_MARGIN_DESIGN = 0.5
/** Flash cycle length in seconds, matching the `.sk5-sq` animation shorthand. */
const FLASH_CYCLE_S = 1.7
/** Per-cell cycle spread (±8%): drifts the phases apart so no pattern repeats. */
const FLASH_JITTER = 0.08

/** One resolved dot-matrix layout; every length is CSS px, derived from whole device pixels. */
interface MatrixLayout {
  /** Grid columns. */
  c: number
  /** Grid rows. */
  r: number
  /** Block edge. */
  sq: number
  /** Gap between blocks. */
  gap: number
  /** Block corner radius (one device pixel). */
  radius: number
  /** Track height the layout needs: both margins, the blocks and the gaps. */
  trackHeight: number
  /** Track width in whole device pixels, for snapping the level dots. */
  trackWDev: number
  /** Edge margins, applied as padding so both ends show the same gap. */
  padTop: number
  padBottom: number
  padLeft: number
  padRight: number
}

/**
 * Resolve the dot-matrix grid in whole device pixels. Rounding the sizes here —
 * instead of handing the browser a fractional remainder — is what keeps the
 * matrix uniform: a fractional pitch rasterizes as alternating 7/8px gaps, and
 * a centered fractional remainder leaves one edge with a different gap.
 *
 * The matrix carries no vertical margin: `rows * block + (rows - 1) * gap` is
 * both the content and the track height, so the first row starts at the track's
 * top edge and the last row ends at its bottom edge. The track is re-heighted to
 * that value because a fixed 26px track is 39 device px at 150%, which no
 * six-row arrangement fills with square blocks and a one-pixel gap.
 * @param wDev - track width in whole device pixels.
 * @param dpr - device pixels per CSS px.
 * @returns the resolved layout.
 */
function solveMatrix(wDev: number, dpr: number): MatrixLayout {
  const gap = Math.max(1, Math.round(MATRIX_GAP_DESIGN * dpr))
  const margin = Math.max(1, Math.round(MATRIX_MARGIN_DESIGN * dpr))
  const rows = MATRIX_ROWS
  // Solve the block back from the designed track height in whole device pixels:
  // margins and gaps grow while the track keeps its size, so every block stays a
  // square of the same edge and every space the same width.
  const block = Math.max(MATRIX_MIN_BLOCK_DEV,
    Math.round((MATRIX_TRACK_DESIGN * dpr - 2 * margin - (rows - 1) * gap) / rows))
  const cols = Math.max(1, Math.floor((wDev + gap) / (block + gap)))
  const restX = wDev - (cols * block + (cols - 1) * gap)
  const padX = Math.floor(restX / 2)
  return {
    c: cols,
    r: rows,
    sq: block / dpr,
    gap: gap / dpr,
    // Rounded squares: a fraction of the block edge. Kept continuous on purpose:
    // rounding it to whole device pixels made the radius jump a fifth of the
    // block at a time, so a 0.01 tweak did nothing until it crossed a step.
    radius: (block * 0.3) / dpr,
    trackHeight: (2 * margin + rows * block + (rows - 1) * gap) / dpr,
    trackWDev: wDev,
    padTop: margin / dpr,
    padBottom: margin / dpr,
    padLeft: padX / dpr,
    padRight: (restX - padX) / dpr,
  }
}

/**
 * Scatter one cell's phase. A linear rule such as `(7r + 13c) % 29` maps
 * neighbours onto a regular lattice, which the eye reads as diagonal bands;
 * avalanching both coordinates first scatters them instead. The result stays
 * continuous rather than quantised into buckets: with 29 buckets up to 14 cells
 * share a phase and flip in the very same instant, every round — a synchrony
 * the eye picks up even though the arrangement itself is random.
 * @param r - grid row.
 * @param c - grid column.
 * @param seed - keeps independent scatters (phase, brightness) uncorrelated.
 * @returns a value in `[0, 1)`.
 */
function cellUnit(r: number, c: number, seed: number): number {
  let h = Math.imul(r + 1, 0x9e3779b1) ^ Math.imul(c + 1, 0x85ebca6b) ^ Math.imul(seed, 0x27d4eb2f)
  h = Math.imul(h ^ (h >>> 15), 0x2545f491)
  h ^= h >>> 13
  return (h >>> 0) / 4294967296
}

/** Insert one stylesheet and return its disposer. */
function injectCss(css: string): () => void {
  const tag = document.createElement('style')
  tag.dataset.plugin = 'skin-switcher'
  tag.textContent = css
  document.head.appendChild(tag)
  return () => {
    tag.remove()
  }
}

/** Extract a message from an unknown error. */
function msg(e: unknown): string {
  if (e !== null && typeof e === 'object' && typeof (e as { message?: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return String(e)
}

/** Find the model descriptor inside one provider group. */
function findModel(groups: unknown[], provider: unknown, model: unknown): any {
  const g = (groups as any[]).find(x => x.id === provider)
  if (g === undefined) return undefined
  return g.models.find((m: any) => m.id === model)
}

/** Effort slider / matrix / model list styles, injected once for this plugin. */
const CSS =
  '.sk5-root{position:relative;display:inline-flex;}' +
  '.sk5-triggers{display:inline-flex;align-items:center;gap:2px;}' +
  '.sk5-trigger{display:inline-flex;align-items:center;padding:4px 8px;border-radius:10px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;max-width:210px;}' +
  '.sk5-trigger:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}' +
  '.sk5-trigger:disabled{opacity:.55;cursor:not-allowed;}' +
  '.sk5-triggerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
  '.sk5-triggerEffort{color:var(--dsw-alias-brand-primary);}' +
  '.sk5-drop{position:absolute;bottom:calc(100% + 6px);right:0;border-radius:14px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:0 10px 32px rgb(0 0 0 / .35);z-index:1200;color:var(--dsw-alias-label-primary);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}' +
  '.sk5-model{width:256px;}' +
  '.sk5-modelsTitle{font-size:14px;font-weight:700;color:var(--dsw-alias-label-secondary);padding:12px 14px 6px;text-align:left;}' +
  '.sk5-list{overflow-y:auto;padding:2px 6px 10px;max-height:min(420px,60vh);}' +
  '.sk5-group{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-tertiary);padding:8px 10px 3px;text-align:left;}' +
  '.sk5-row{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;padding:6px 10px;border-radius:12px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;}' +
  '.sk5-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}' +
  '.sk5-row:disabled{opacity:.6;cursor:wait;}' +
  '.sk5-rowDesc{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
  '.sk5-check{font-size:12px;color:var(--dsw-alias-brand-primary);}' +
  '.sk5-status{padding:14px;font-size:12.5px;opacity:.65;text-align:center;}' +
  '.sk5-err{padding:8px 4px 0;font-size:11.5px;color:var(--dsw-alias-state-error-primary);text-align:left;}' +
  '.sk5-effort{width:225px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:10px 12px 12px;}' +
  '.sk5-titleRow{display:flex;align-items:center;gap:8px;margin-bottom:8px;}' +
  '.sk5-effortLabel{font-size:13px;font-weight:600;color:var(--dsw-alias-label-secondary);}' +
  '.sk5-help{position:relative;margin-left:auto;display:inline-flex;}' +
  '/* The ring is an SVG stroke, not a CSS border or gradient: a vector stroke is anti-aliased by the rasterizer at every size, while a sub-pixel gradient ring at this diameter quantises into visible steps. The ring inherits currentColor, so the existing hover colour change lights it up. */' +
  '.sk5-helpBtn{position:relative!important;width:16px!important;height:16px!important;min-width:0!important;min-height:0!important;box-sizing:border-box!important;padding:0!important;border:none!important;box-shadow:none!important;outline:none!important;border-radius:50%!important;clip-path:circle(50%);background:transparent!important;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:help;flex:none!important;appearance:none;}' +
  '.sk5-helpRing{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;}' +
  '.sk5-helpQ{position:relative;}' +
  '.sk5-helpBtn:hover{color:var(--dsw-alias-label-primary);}' +
  '.sk5-helpTip{position:absolute;top:calc(100% + 6px);right:0;width:206px;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;box-shadow:0 8px 24px rgb(0 0 0 / .35);z-index:20;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .12s ease,visibility .12s ease;}' +
  '.sk5-helpBtn:hover ~ .sk5-helpTip{opacity:1;visibility:visible;}' +
  '.sk5-helpTip:hover{opacity:1;visibility:visible;}' +
  '.sk5-helpTip::before{content:"";position:absolute;top:-8px;left:0;right:0;height:8px;}' +
  '.sk5-helpTitle{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:3px;text-align:left;}' +
  '.sk5-helpText{font-size:11.5px;line-height:1.55;color:var(--dsw-alias-label-secondary);text-align:left;}' +
  '.sk5-effortValue{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);}' +
  '.sk5-effortValueMax{color:var(--dsw-static-deepseek-400);}' +
  '@keyframes sk5-nameBlur{from{filter:blur(5px);opacity:.3}to{filter:blur(0);opacity:1}}' +
  '.sk5-labelsRow{display:flex;justify-content:space-between;margin-bottom:6px;}' +
  '.sk5-endLabel{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-secondary);}' +
  '.sk5-track{position:relative;height:23px;border-radius:9px!important;background:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;}' +
  '.sk5-fill{position:absolute;top:0;bottom:0;left:0;border-radius:9px 0 0 9px!important;transition:width .16s ease,opacity .16s ease;pointer-events:none;}' +
  '.sk5-fillEnd{border-radius:9px!important;}' +
  '.sk5-dotHit{position:absolute;top:0;bottom:0;width:16px;transform:translateX(-50%);display:flex;align-items:flex-start;justify-content:center;cursor:pointer;z-index:2;}' +
  '/* The dot is drawn as an SVG circle rather than a CSS background: at 4px on a 150% display that is a 6-device-pixel disc, and a vector circle is coverage-antialiased far more evenly than a border-radius fill at this size. The span keeps the 50% box radius so the hover glow stays circular. */' +
  '/* The level marks and the handle are pinned to the theme static white instead of the alias label token: they must stay white in both appearances, so they never follow the light-mode near-black value. Only the top level keeps its brand blue. */' +
  '.sk5-dot{width:4px!important;height:4px!important;min-width:0!important;min-height:0!important;flex:none!important;border-radius:50%!important;background:transparent!important;color:var(--dsw-static-neutral-bluish-00);opacity:.9;pointer-events:none;transition:opacity .12s ease;}' +
  '.sk5-dotShape{display:block;width:100%;height:100%;overflow:visible;}' +
  '/* Hover lights a soft halo with drop-shadow, not box-shadow: drop-shadow follows the painted alpha (our SVG circle), while box-shadow follows the element box — and the host overrides this span\'s border-radius, so a box-shadow halo came out as a blurred square with diamond corners. The resting state carries no filter at all: any filter, even a zero-blur one, moves the element onto its own rasterization layer and changes how this 6-device-pixel circle is antialiased. */' +
  '.sk5-dotHit:hover .sk5-dot{opacity:1;}' +
  '.sk5-dotShape{transition:filter .14s ease;filter:none;}' +
  '.sk5-dotHit:hover .sk5-dotShape{filter:drop-shadow(0 0 2.5px currentColor);}' +
  '.sk5-dotMax{color:var(--dsw-static-deepseek-400);}' +
  '.sk5-handle{position:absolute;top:0;bottom:0;width:20px;border-radius:9px!important;background:var(--dsw-static-neutral-bluish-00);transform:translateX(-50%);box-shadow:0 0 0 transparent;transition:left .16s ease,transform .16s ease,box-shadow .5s ease,background-color .5s ease;z-index:3;cursor:grab;}' +
    '.sk5-handleMax{background:color-mix(in srgb, var(--dsw-static-deepseek-450) 25%, var(--dsw-static-neutral-bluish-00));box-shadow:0 0 10px color-mix(in srgb, var(--dsw-static-deepseek-400) 90%, transparent);}' +
  '.sk5-handleMoving{transform:translateX(-50%) scale(1.14);}' +
  '.sk5-handleMax{background:color-mix(in srgb, var(--dsw-static-deepseek-450) 25%, var(--dsw-static-neutral-bluish-00));box-shadow:0 0 10px color-mix(in srgb, var(--dsw-static-deepseek-400) 90%, transparent);}' +
  '/* Day mode only: a soft grey-black halo around the white knob, so that where it meets an equally white dropdown panel its own pixel edge is masked instead of showing. Night mode keeps the bare handle, and the top level keeps its blue glow. The host removes data-ds-dark-theme from <body> in the light appearance, so :not() is the day-mode test. */' +
  'body:not([data-ds-dark-theme]) .sk5-handle:not(.sk5-handleMax){box-shadow:0 0 3px rgb(0 0 0 / .28);}' +
  '.sk5-matrix{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;border-radius:9px!important;pointer-events:none;z-index:1;box-sizing:border-box;display:grid;gap:1px;justify-content:start;align-content:start;}' +
  '.sk5-cell{width:100%;height:100%;opacity:0;animation:sk5-appear .6s ease forwards;}' +
  '@keyframes sk5-appear{from{opacity:.1}to{opacity:1}}' +
  '.sk5-sq{width:100%;height:100%;border-radius:1px;animation:sk5-flash 1.45s infinite ease-in-out;}' +
  '/* One flash cycle: hold blue 250ms, jump to light, hold light 480ms, fade back over 720ms. */' +
    '@keyframes sk5-flash{0%,29.41%{background:var(--dsw-static-deepseek-500)}29.42%,57.65%{background:var(--flash-light,var(--dsw-static-deepseek-400))}100%{background:var(--dsw-static-deepseek-500)}}' 

/** Per-model (provider\u0000model) effort memory, shared across the whole page. */
const effortMemory = new Map<string, string | undefined>()

/** Two-level mask curve: right side opaque, left transparent, transition over 5%→75%. */
function fadeAt(fx: number): number {
  if (fx <= 0.05) return 0
  if (fx >= 0.75) return 1
  const t = (fx - 0.05) / 0.7
  return t * t * (3 - 2 * t)
}

/**
 * Client plugin body: inject the stylesheet once, then register the composer
 * model seat whose component reads `sessions.models` and writes
 * `sessions.selectModel`.
 * @param ctx - client root context carrying connection and slots.
 */
export function apply(ctx: any): void {
  /**
   * The first-party model directory service. It carries the same host catalog
   * and the same session selection projection the official `/model` selector
   * renders, so this seat always shows what `/model` shows. DSH 0.1.5 replaced
   * the older `connection.api.sessions` RPC face with this service.
   */
  const directories = ctx.modelDirectories as {
    directoryFor: (sessionId: string) => {
      store: { subscribe: (listener: () => void) => () => void; getSnapshot: () => any }
      load: () => Promise<unknown>
      select: (selection: { provider: string; model: string; reasoningEffort?: string }) => Promise<unknown>
    }
  }
  const runtimeSessions = ctx.sessions as {
    subagentAddress: (sessionId: string) => string | undefined
  }

  ctx.effect(() => injectCss(CSS))
  ctx.effect(() => ctx.locale.register(NS, DICTS), 'ui-skin-switcher: dictionaries')

  ctx.slots.inject('conversation.input.model', () => ctx.slots.register(
    { name: 'conversation.input.model', priority: -1, locale: NS },
    (props: any) => {
      const { locked, sessionId, t } = props
      /**
       * Read one dictionary key through the framework-injected `t` seat; the
       * Chinese table backs a host that shipped no locale service.
       */
      const tr = (key: string): string => (typeof t === 'function' ? t(key) : (DICTS.zh[key] ?? key))

      const [menu, setMenu] = React.useState<any>(null)
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState<any>(null)
      const [hoverIdx, setHoverIdx] = React.useState<any>(null)
      const [grid, setGrid] = React.useState<MatrixLayout | null>(null)
      const rootRef = React.useRef<any>(null)
      const trackRef = React.useRef<any>(null)
      const [moving, setMoving] = React.useState(false)
      const dragIdxRef = React.useRef<any>(null)
      const busyRef = React.useRef(false)
      const pendingRef = React.useRef<any>(null)
      const [settledIdx, setSettledIdx] = React.useState<any>(null)

      /** This session's shared directory — the official selector's own data source. */
      const directory = React.useMemo(() => directories.directoryFor(sessionId), [sessionId])
      const state = React.useSyncExternalStore(
        React.useCallback((listener: () => void) => directory.store.subscribe(listener), [directory]),
        React.useCallback(() => directory.store.getSnapshot(), [directory]),
      )

      /** Composer trigger row owns this width; the slider handle spans half of it. */
      const HANDLE_W = 20

      const load = () => {
        // The directory dedupes in-flight loads and surfaces failures on the store.
        directory.load().catch(() => {})
      }
      React.useEffect(() => { load() }, [])
      React.useEffect(() => { if (menu !== null) load() }, [menu])

      React.useEffect(() => {
        if (menu === null) return
        const handler = (ev: MouseEvent) => {
          if (rootRef.current !== null && !rootRef.current.contains(ev.target)) setMenu(null)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
      }, [menu])

      React.useEffect(() => {
        if (menu !== 'effort') return
        const measure = () => {
          if (trackRef.current !== null) {
            // Sub-pixel precision matters here: clientWidth rounds to whole CSS
            // px, and the column count is solved from device pixels.
            const rect = trackRef.current.getBoundingClientRect()
            const w = rect.width
            const dpr = window.devicePixelRatio > 0 ? window.devicePixelRatio : 1
            const next = solveMatrix(Math.floor(w * dpr), dpr)
            setGrid(g => (g !== null
              && g.c === next.c && g.r === next.r && g.sq === next.sq && g.gap === next.gap
              && g.trackWDev === next.trackWDev
              && g.padTop === next.padTop && g.padBottom === next.padBottom
              && g.padLeft === next.padLeft && g.padRight === next.padRight)
              ? g
              : next)
          }
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
      }, [menu])

      React.useEffect(() => {
        setHoverIdx(null)
      }, [state.current === null ? null : state.current.reasoningEffort])

      const apply = (sel: any, keepOpen: boolean) => {
        pendingRef.current = sel
        if (busyRef.current) return
        busyRef.current = true
        setBusy(true); setError(null)
        directory.select({
          provider: sel.provider,
          model: sel.model,
          ...(sel.reasoningEffort === undefined ? {} : { reasoningEffort: sel.reasoningEffort }),
        }).then(
          () => {
            busyRef.current = false
            setBusy(false)
            if (!keepOpen) setMenu(null)
            effortMemory.set(sel.provider + '\u0000' + sel.model, sel.reasoningEffort)
            const next = pendingRef.current
            if (next !== null && next !== sel) {
              pendingRef.current = null
              apply(next, true)
            }
          },
          (e: unknown) => {
            busyRef.current = false
            setBusy(false)
            setHoverIdx(null)
            setError(msg(e))
            pendingRef.current = null
          },
        )
      }

      const groups = state.groups
      const current = state.current
      /** Selection failures are local; catalog failures live on the shared store. */
      const shownError = error !== null ? error : state.error
      const loaded = state.status !== 'idle'
      const curGroup = current === null ? undefined : groups.find((g: any) => g.id === current.provider)
      const curModel = current === null ? undefined : findModel(groups, current.provider, current.model)
      const modelLabel = curModel !== undefined ? curModel.name : (current !== null && current.model !== '' ? current.model : tr('trigger.fallbackModel'))
      const reasoning = curModel !== undefined ? curModel.reasoning : undefined
      const effectiveEffort = (current !== null && current.reasoningEffort !== undefined)
        ? current.reasoningEffort
        : (reasoning !== undefined && reasoning.defaultEffort !== undefined ? reasoning.defaultEffort : undefined)
      const choices = reasoning === undefined ? [] : [
        ...(reasoning.defaultEffort === undefined ? [{ key: 'default', effort: undefined, label: tr('effort.default') }] : []),
        ...reasoning.efforts.map((e: any) => ({ key: 'e:' + e.id, effort: e.id, label: e.name })),
      ]
      const activeKey = effectiveEffort === undefined ? 'default' : 'e:' + effectiveEffort
      const activeIdx = Math.max(0, choices.findIndex((c: any) => c.key === activeKey))
      const posIdx = hoverIdx !== null ? hoverIdx : activeIdx
      const safePosIdx = choices.length > 0 ? Math.max(0, Math.min(choices.length - 1, posIdx)) : 0
      const atMaxPos = choices.length > 1 && safePosIdx === choices.length - 1
      const displayIdx = settledIdx === null ? activeIdx : settledIdx
      const safeDisplayIdx = choices.length > 0 ? Math.max(0, Math.min(choices.length - 1, displayIdx)) : 0
      const displayChoice = choices.length > 0 ? choices[safeDisplayIdx] : null
      const displayLabel = displayChoice !== null ? displayChoice.label : tr('effort.default')
      const inMax = choices.length > 1 && safeDisplayIdx === choices.length - 1
      const matrixVisible = inMax && atMaxPos
      const posPct = choices.length > 1 ? (posIdx / (choices.length - 1)) * 100 : 0

      const matrixCells = React.useMemo(() => {
        if (!inMax || grid === null) return []
        /** Blend a colour toward its own luminance: same hue, less saturation. */
        const desat = (rgb: number[], f: number) => {
        const l = 0.299 * rgb[0]! + 0.587 * rgb[1]! + 0.114 * rgb[2]!
          return rgb.map((v) => Math.round(v + (l - v) * f))
        }
        const deep = desat([65, 118, 230], 0.15)
        const lightMax = desat([103, 158, 254], 0.15)
        /**
         * How far the lightest cells reach past deepseek-400 (103,158,254)
         * toward deepseek-300 (183,200,254): a small lift reads lighter without
         * going pale. This is the knob for "a touch lighter".
         */
        const lightLift = 0.3
        const lightPeak = lightMax.map((v, i) => Math.round(v + ([183, 200, 254][i]! - v) * lightLift))
        /** Overall right-to-left sweep duration of the reveal. */
        const revealMs = 1800
        /**
         * Fog-style advance. Each cell's progress is its horizontal position
         * minus a smooth 2D noise field, so the frontier is ragged — some cells
         * lead, some lag, leaving scattered gaps — while neighbouring cells still
         * cross the threshold at nearby times, because the noise is continuous
         * rather than per-cell jitter. Direction stays right to left; the row
         * phases that advanced whole rows in alternation are gone.
         *
         * noiseAmp: how far the noise shifts a cell's progress as a fraction of
         * the full sweep — the roughness of the frontier.
         * noiseFreq: noise cells per matrix cell — larger means finer blobs.
         */
        const noiseLeadCols = 6
        const noiseFreq = 0.45
        /** Per-cell random stagger, ± this many ms: perforates the front edge. */
        const staggerMs = 80
        /** Integer-lattice hash folded into [0,1). */
        const noiseHash = (x: number, y: number, seed: number) => {
          let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2246822519)) | 0
          h = (h ^ (h >>> 13)) | 0
          h = Math.imul(h, 1274126177)
          return ((h ^ (h >>> 16)) >>> 0) / 4294967296
        }
        /** Value noise: lattice hashes blended by a smoothstep, hence smooth. */
        const valueNoise = (x: number, y: number, seed: number) => {
          const x0 = Math.floor(x)
          const y0 = Math.floor(y)
          const fx = x - x0
          const fy = y - y0
          const sx = fx * fx * (3 - 2 * fx)
          const sy = fy * fy * (3 - 2 * fy)
          const n00 = noiseHash(x0, y0, seed)
          const n10 = noiseHash(x0 + 1, y0, seed)
          const n01 = noiseHash(x0, y0 + 1, seed)
          const n11 = noiseHash(x0 + 1, y0 + 1, seed)
          return (n00 * (1 - sx) + n10 * sx) * (1 - sy) + (n01 * (1 - sx) + n11 * sx) * sy
        }
        /**
         * Two octaves in [-1,1]: a broad fog bank plus a finer grain, so the
         * frontier reads as eroded by noise rather than as a straight edge.
         */
                /**
         * Column-wise cluster centre: a smooth 1-D noise, so neighbouring columns
         * share the cluster and the frontier reads as melting rather than
         * flickering. Returns a fractional row index in [0, rows-1].
         */
        const clusterAt = (c: number) => {
          const w = valueNoise(c * 0.35, 0.5, 71) * 0.65 + valueNoise(c * 0.9, 3.5, 89) * 0.35
          return w * (grid.r - 1)
        }
        const out: any[] = []
        for (let r = 0; r < grid.r; r++) {
          for (let c = 0; c < grid.c; c++) {
            const k = 0.45 + cellUnit(r, c, 1) * 0.5
            const lc = deep.map((v, i) => Math.round(v + (lightPeak[i]! - v) * k))
            // Scattered phases, not a lattice: the phases stay continuous, and
            // every delay is non-negative so each cell enters on the base blue.
            // The 350ms lead-in defers the first round only, while the steady
            // cycle keeps its 250ms blue hold.
            const flashDelay = (cellUnit(r, c, 2) * 1.38 + 0.35).toFixed(3) + 's'
            /**
             * Per-cell cycle length, jittered around the stylesheet's 1.45s base.
             * With one shared duration every cell keeps a fixed phase, so the
             * whole pattern repeats exactly each round and a local area replays
             * the same order; the spread drifts the phases apart instead.
             */
            const flashDuration = (FLASH_CYCLE_S * (1 - FLASH_JITTER + cellUnit(r, c, 3) * 2 * FLASH_JITTER)).toFixed(3) + 's'
            const fx = grid.c > 1 ? c / (grid.c - 1) : 0
            const u = grid.c > 1 ? (grid.c - 1 - c) / (grid.c - 1) : 0
                        // Progress minus the noise field decides when this cell appears: the
            // smooth field keeps neighbours close in time, the offset makes the
            // frontier ragged.
                        // Lead is measured in COLUMNS: the scattered frontier is at most
            // noiseLeadCols wide, and because every cell's delay is a fixed
            // linear function of its column, the whole ragged edge translates
            // leftward at exactly the sweep's own speed.
                       // Rows are ordered by distance from this column's cluster centre, so
            // the lit set is always a contiguous run that grows outward: one row
            // at the front, a couple one column later, all rows three columns
            // later. The stage is a fixed number of columns, so the whole profile
            // still travels at exactly the sweep's speed.
            const m = clusterAt(c)
            const rank = Math.abs(r - m) / (grid.r - 1)
            const stages = noiseLeadCols - 1
            const stage = Math.min(stages, Math.round(rank * stages))
            // Per-cell stagger on top of the cluster ramp: some blocks lag on
            // purpose, which is what leaves the front perforated rather than
            // evenly filled.
            const stagger = (cellUnit(r, c, 4) * 2 - 1) * staggerMs
            const nu = Math.max(0, Math.min(1, u + stage / (grid.c - 1) + stagger / revealMs))
            const appearDelay = ((revealMs * nu) / 1000).toFixed(3) + 's'
            out.push({
              key: r + '-' + c,
              flashLight: 'rgb(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ')',
              flashDeep: 'rgb(' + deep.join(',') + ')',
              animationDelay: flashDelay,
              flashDuration: flashDuration,
              appearDelay: appearDelay,
              fade: fadeAt(fx),
            })
          }
        }
        return out
      }, [inMax, grid])

      React.useEffect(() => {
        const id = setTimeout(() => setSettledIdx(safePosIdx), 160)
        return () => clearTimeout(id)
      }, [safePosIdx])

      const isSubagent = runtimeSessions.subagentAddress(sessionId) !== undefined
      if (isSubagent) return null

      const insetPx = HANDLE_W / 2
      const posFrac = posPct / 100
      const dotLeft = (i: number) => 'calc(' + insetPx + 'px + (100% - ' + (insetPx * 2) + 'px) * ' + (choices.length > 1 ? (i / (choices.length - 1)) : 0) + ')'
      /**
       * Level dots are laid out in whole device pixels. Their proportional
       * `left` is fractional by nature, and a 6-device-pixel circle that
       * straddles two pixels reads as a rounded square: snapping both axes to
       * the device grid gives the rasterizer a symmetric circle to draw.
       */
      const dpr = (typeof window !== 'undefined' && window.devicePixelRatio > 0) ? window.devicePixelRatio : 1
      const dotDev = 4 * dpr
      const insetDev = insetPx * dpr
      const dotLeftSnapped = (i: number) => {
        if (grid === null) return dotLeft(i)
        const frac = choices.length > 1 ? i / (choices.length - 1) : 0
        const xDev = Math.round(insetDev + (grid.trackWDev - 2 * insetDev) * frac)
        return (xDev / dpr) + 'px'
      }
      const dotTopSnapped = grid === null ? undefined : (Math.round((grid.trackHeight * dpr - dotDev) / 2) / dpr) + 'px'
      const handleLeft = 'calc(' + insetPx + 'px + (100% - ' + (insetPx * 2) + 'px) * ' + posFrac + ')'
      const fillWidth = handleLeft
      const fillHidden = inMax && atMaxPos
      const fillSolid = 'color-mix(in srgb, var(--dsw-alias-label-primary) 42%, transparent)'

      const onPickModel = (m: any, g: any) => {
        setSettledIdx(null)
        const remembered = effortMemory.get(g.id + '\u0000' + m.id)
        apply({ provider: g.id, model: m.id, ...(remembered === undefined ? {} : { reasoningEffort: remembered }) }, false)
      }
      const onPickEffort = (effort: string | undefined) => {
        if (current === null) return
        apply({
          provider: current.provider,
          model: current.model,
          ...(effort === undefined ? {} : { reasoningEffort: effort }),
        }, true)
      }

      const idxFromEvent = (ev: MouseEvent) => {
        const el = trackRef.current
        if (el === null || choices.length < 2) return 0
        const rect = el.getBoundingClientRect()
        const usable = Math.max(rect.width - insetPx * 2, 1)
        const frac = Math.max(0, Math.min(1, (ev.clientX - rect.left - insetPx) / usable))
        const idx = Math.round(frac * (choices.length - 1))
        return Math.max(0, Math.min(choices.length - 1, idx))
      }

      const onWinMove = (ev: PointerEvent) => {
        if (dragIdxRef.current === null) return
        const idx = idxFromEvent(ev)
        dragIdxRef.current = idx
        setHoverIdx(idx)
      }
      const stopDrag = () => {
        window.removeEventListener('pointermove', onWinMove as any)
        window.removeEventListener('pointerup', onWinUp as any)
        window.removeEventListener('pointercancel', onWinCancel as any)
        window.removeEventListener('blur', onWinCancel as any)
      }
      const onWinUp = () => {
        if (dragIdxRef.current === null) return
        const idx = dragIdxRef.current
        dragIdxRef.current = null
        setMoving(false)
        stopDrag()
        const c = choices[idx]
        if (c !== undefined) {
          setHoverIdx(idx)
          onPickEffort(c.effort)
        }
      }
      const onWinCancel = () => {
        dragIdxRef.current = null
        setMoving(false)
        stopDrag()
        setHoverIdx(null)
      }
      const onTrackDown = (ev: PointerEvent) => {
        if (choices.length === 0) return
        dragIdxRef.current = idxFromEvent(ev)
        setHoverIdx(dragIdxRef.current)
        window.addEventListener('pointermove', onWinMove as any)
        window.addEventListener('pointerup', onWinUp as any)
        window.addEventListener('pointercancel', onWinCancel as any)
        window.addEventListener('blur', onWinCancel as any)
      }

      const triggerTitle = curGroup !== undefined && curModel !== undefined
        ? curGroup.name + ' / ' + curModel.name + (effectiveEffort !== undefined ? ' · ' + displayLabel : '')
        : tr('trigger.selectModel')

      return React.createElement('div', { ref: rootRef, className: 'sk5-root' },
        React.createElement('div', { className: 'sk5-triggers' },
          React.createElement('button', {
            type: 'button', className: 'sk5-trigger', disabled: locked || busy, title: triggerTitle,
            'aria-haspopup': 'menu', 'aria-expanded': menu === 'model',
            onClick: () => setMenu((m: any) => (m === 'model' ? null : 'model')),
          }, React.createElement('span', { className: 'sk5-triggerName' }, modelLabel)),
          reasoning !== undefined && choices.length > 0
            ? React.createElement('button', {
                type: 'button', className: 'sk5-trigger sk5-triggerEffort',
                disabled: locked || busy || current === null, title: tr('effort.title'),
                'aria-haspopup': 'menu', 'aria-expanded': menu === 'effort',
                onClick: () => setMenu((m: any) => (m === 'effort' ? null : 'effort')),
              }, React.createElement('span', { key: displayLabel, style: { animation: 'sk5-nameBlur .28s ease' } }, displayLabel))
            : null,
        ),
        menu === 'model'
          ? React.createElement('div', { className: 'sk5-drop sk5-model', role: 'menu', 'aria-label': tr('trigger.selectModel') },
              React.createElement('div', { className: 'sk5-modelsTitle' }, tr('menu.models')),
              React.createElement('div', { className: 'sk5-list' },
                !loaded && shownError === null ? React.createElement('div', { className: 'sk5-status' }, tr('status.loading')) : null,
                !loaded && shownError !== null ? React.createElement('div', { className: 'sk5-err' }, shownError) : null,
                loaded && groups.length === 0 ? React.createElement('div', { className: 'sk5-status' }, tr('status.noModels')) : null,
                loaded ? groups.map((g: any) => React.createElement('div', { key: g.id },
                  React.createElement('div', { className: 'sk5-group' }, g.name),
                  g.models.map((m: any) => {
                    const active = current !== null && current.provider === g.id && current.model === m.id
                    return React.createElement('button', {
                      key: m.id, type: 'button', role: 'menuitem', className: 'sk5-row', disabled: busy,
                      onClick: () => onPickModel(m, g),
                    },
                      React.createElement('span', { style: { minWidth: 0 } },
                        React.createElement('div', null, m.name),
                        m.description !== undefined ? React.createElement('div', { className: 'sk5-rowDesc' }, m.description) : null,
                      ),
                      active ? React.createElement('span', { className: 'sk5-check' }, '✓') : null,
                    )
                  }),
                )) : null,
              ),
            )
          : null,
        menu === 'effort'
          ? React.createElement('div', { className: 'sk5-drop sk5-effort', role: 'menu', 'aria-label': tr('effort.title') },
              React.createElement('div', { className: 'sk5-titleRow' },
                React.createElement('span', { className: 'sk5-effortLabel' }, 'Effort'),
                React.createElement('span', {
                  key: displayLabel,
                  className: 'sk5-effortValue' + (choices.length > 1 && inMax ? ' sk5-effortValueMax' : ''),
                  style: { animation: 'sk5-nameBlur .28s ease' },
                }, displayLabel),
                React.createElement('div', { className: 'sk5-help' },
                  React.createElement('button', { type: 'button', className: 'sk5-helpBtn', 'aria-label': tr('help.aria') },
                    React.createElement('svg', { className: 'sk5-helpRing', viewBox: '0 0 16 16', 'aria-hidden': 'true' },
                      React.createElement('circle', { cx: 8, cy: 8, r: 7.35, fill: 'none', stroke: 'currentColor', strokeWidth: 0.75 }),
                    ),
                    React.createElement('span', { className: 'sk5-helpQ' }, '?'),
                  ),
                  React.createElement('div', { className: 'sk5-helpTip' },
                    React.createElement('div', { className: 'sk5-helpTitle' }, tr('effort.title')),
                    React.createElement('div', { className: 'sk5-helpText' }, tr('help.text')),
                  ),
                ),
              ),
              React.createElement('div', { className: 'sk5-labelsRow' },
                React.createElement('span', { className: 'sk5-endLabel' }, 'Faster'),
                React.createElement('span', { className: 'sk5-endLabel' }, 'Smarter'),
              ),
              React.createElement('div', {
                ref: trackRef, className: 'sk5-track',
                style: grid === null ? undefined : { height: grid.trackHeight + 'px' },
                onPointerDown: onTrackDown as any,
              },
                React.createElement('div', {
                  className: 'sk5-fill' + (posPct > 96 ? ' sk5-fillEnd' : ''),
                  style: { width: fillWidth, background: fillSolid, opacity: fillHidden ? 0 : 1 },
                }),
                matrixVisible && grid !== null
                  ? React.createElement('div', {
                      className: 'sk5-matrix',
                      style: {
                        gridTemplateColumns: 'repeat(' + grid.c + ',' + grid.sq + 'px)',
                        gridTemplateRows: 'repeat(' + grid.r + ',' + grid.sq + 'px)',
                        gap: grid.gap + 'px',
                        padding: grid.padTop + 'px ' + grid.padRight + 'px ' + grid.padBottom + 'px ' + grid.padLeft + 'px',
                        justifyContent: 'start',
                        alignContent: 'start',
                      },
                    },
                      matrixCells.map((sq: any) => React.createElement('div', { key: sq.key, className: 'sk5-cell', style: { animationDelay: sq.appearDelay } },
                        React.createElement('div', {
                          className: 'sk5-sq',
                          style: { background: 'var(--dsw-static-deepseek-500)', opacity: sq.fade, animationDelay: sq.animationDelay, animationDuration: sq.flashDuration, borderRadius: grid.radius + 'px', '--flash-light': sq.flashLight,
            '--flash-deep': sq.flashDeep },
                        }),
                      )),
                    )
                  : null,
                !inMax
                  ? choices.map((c: any, i: number) => React.createElement('span', {
                      key: c.key, className: 'sk5-dotHit', style: { left: dotLeftSnapped(i) },
                    }, React.createElement('span', {
                      className: 'sk5-dot' + (i === choices.length - 1 ? ' sk5-dotMax' : ''),
                      style: { marginTop: dotTopSnapped },
                    }, React.createElement('svg', { className: 'sk5-dotShape', viewBox: '0 0 4 4', 'aria-hidden': 'true' },
                      React.createElement('circle', { cx: 2, cy: 2, r: 2, fill: 'currentColor' }),
                    ))))
                  : null,
                   React.createElement('div', {
                   className: 'sk5-handle' + (inMax ? ' sk5-handleMax' : '') + (moving ? ' sk5-handleMoving' : ''),
                   style: { left: handleLeft },
  // Lift the knob on press — a tap or a long hold — and let the track's
  // window-level release handlers drop it again. Pressing the bare track never
  // reaches this handler, so a track click still does not lift it.
                   onPointerDown: () => setMoving(true),
                 }),
              ),
              shownError !== null
                ? React.createElement('div', { className: 'sk5-err' }, shownError)
                : null,
            )
          : null,
      )
    },
  ))
}