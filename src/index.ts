/**
 * Skin-switcher plugin, node half. The surface itself is browser-only; this
 * half exists so the plugin has a Host entry, which is also where its colour
 * settings live.
 *
 * ## Why the colours are Host configuration
 *
 * The colour switcher rendered on the bundle's detail page must survive a
 * restart and follow the user across browsers, so the six colours are plugin
 * configuration rather than page state. DSH's settings service discovers a
 * namespace from this entry's `Config` schema (`ns = entry.options.id`), and
 * only `volatile` fields are writable from the browser without restarting the
 * entry: `@deepseek-ai/dsh-settings` filters the form through
 * `schema.meta.volatile` and rejects any other path with
 * "Config field ... is not volatile". Every field below is therefore volatile.
 *
 * The browser half reads and writes this namespace through the `configForms`
 * client service; it never imports this module.
 *
 * ## Why the offsets are relative
 *
 * `master` is the one colour the user picks (the popover's effort value). The
 * other five follow it through the relative offsets measured in
 * `src/client/palette.js`; an empty string means "derive from master", so a
 * reset is a cleared field rather than a copied default and a future change to
 * the derivation also updates existing users.
 *
 * This half deliberately declares NO `inject`. Cordis parks a fiber whose
 * injected Service is absent (`_refresh()` drops the epoch to INACTIVE), so a
 * host-side `inject: ['locale', 'slots', …]` — names that only exist in the
 * Browser assembly — keeps the whole plugin unloaded: the host row never
 * applies, and because the entry never activates, the browser half is never
 * requested either. The six Services the browser half consumes are declared on
 * the client bundle's own `inject` export, which is the declaration site the
 * Client Loader reads.
 */
import z from '@deepseek-ai/schemastery'

/** Shipped effort-value colour; the derivation reproduces the original palette for it. */
const DEFAULT_MASTER = '#679EFE'

const color = () => z.string().default('').volatile()

/**
 * The plugin's configuration: one picked colour, the six resolved slots, and
 * the mode that decides whether the slots follow the master.
 */
export const Config = z.object({
  /** `auto` derives every slot from `master`; `custom` keeps the per-slot values. */
  mode: z.union([z.const('auto'), z.const('custom')]).default('auto').volatile(),
  /** The effort-value colour the user picks. */
  master: z.string().default(DEFAULT_MASTER).volatile(),
  /**
   * Whether the top-effort label on the composer seat follows the popover's
   * effort-value colour. Off keeps the seat's neutral label colour.
   */
  followSeat: z.boolean().default(true).volatile(),
  /**
   * Whether the plugin's own copy follows the DSH interface language. Off by
   * default: the plugin then speaks English regardless of the shell, which
   * keeps screenshots and shared settings predictable.
   */
  followLocale: z.boolean().default(false).volatile(),
  /** Per-slot overrides; an empty string derives the slot from `master`. */
  dialogFont: color(),
  maxDot: color(),
  slider: color(),
  sliderGlow: color(),
  gridNormal: color(),
  gridBlink: color(),
})

/** Host plugin body — no host-side behaviour for this surface plugin. */
export function apply(): void {}