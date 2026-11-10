/**
 * Live palette store shared by the composer seat and the plugin-detail
 * settings section.
 *
 * The seat renders before (and without) the settings namespace, so the store
 * owns the "effective" palette: `null` means "no configuration is being
 * served", and the stylesheet falls back to the shipped static colours. When a
 * namespace does appear, its values are derived here once and published both
 * as a small CSS custom-property set on `<html>` (what the seat's stylesheet
 * reads) and as a snapshot React can subscribe to (what the dot matrix reads).
 */
import * as React from 'react'
import { DEFAULT_MASTER, deriveFromMaster, parseHex, SLOT_KEYS, toHex } from './palette.js'

/** The six accent slots, already resolved to uppercase `#RRGGBB`. */
export interface PaletteColors {
  dialogFont: string
  maxDot: string
  slider: string
  sliderGlow: string
  gridNormal: string
  gridBlink: string
}

/** CSS custom properties the seat's stylesheet reads, one per slot. */
const CSS_VARS: Record<keyof PaletteColors, string> = {
  dialogFont: '--sk5-c-dialog',
  maxDot: '--sk5-c-dot',
  slider: '--sk5-c-slider',
  sliderGlow: '--sk5-c-glow',
  gridNormal: '--sk5-c-grid',
  gridBlink: '--sk5-c-blink',
}

/** The shipped palette, used when no configuration is served. */
export const DEFAULT_PALETTE: PaletteColors = /** @type {PaletteColors} */ (
  deriveFromMaster(DEFAULT_MASTER)
)

interface PaletteSnapshot {
  colors: PaletteColors | null
  /** Whether the top-effort seat text follows the popover value colour. */
  followSeat: boolean
}

let snapshot: PaletteSnapshot = { colors: null, followSeat: true }
const listeners = new Set<() => void>()

/** `<html>` attribute the seat's stylesheet keys the follow switch on. */
const FOLLOW_ATTR = 'data-sk5-follow-seat'

/**
 * Publish the effective palette. `null` restores the shipped colours by
 * removing every override (the stylesheet's `var()` fallbacks then apply).
 * @param colors - resolved slots, or null for "no configuration served".
 * @param followSeat - whether the top-effort seat text takes the value colour.
 */
export function setPalette(colors: PaletteColors | null, followSeat = true): void {
  const style = document.documentElement.style
  for (const key of SLOT_KEYS as (keyof PaletteColors)[]) {
    if (colors === null) style.removeProperty(CSS_VARS[key])
    else style.setProperty(CSS_VARS[key], colors[key])
  }
  if (followSeat) document.documentElement.setAttribute(FOLLOW_ATTR, '')
  else document.documentElement.removeAttribute(FOLLOW_ATTR)
  snapshot = { colors, followSeat }
  for (const listener of listeners) listener()
}

/** @returns the current snapshot object (stable until the next publish). */
function getSnapshot(): PaletteSnapshot {
  return snapshot
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Subscribe the calling component to palette changes.
 * @returns resolved slots, or null while the shipped colours stand.
 */
export function usePaletteColors(): PaletteColors | null {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot).colors
}

/**
 * Whether the top-effort seat text follows the popover value colour. Stored
 * configuration wins; an absent field means "follow", matching the switch's
 * default.
 * @param value - the config section from the settings form, when ready.
 * @returns the switch state.
 */
export function readFollowSeat(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return true
  return (value as Record<string, unknown>).followSeat !== false
}

/** Accept a stored colour only when it parses; otherwise "derive it". */
function storedColor(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const rgb = parseHex(value)
  return rgb === null ? null : toHex(rgb)
}

/**
 * Resolve one configuration section into effective slots.
 *
 * `auto` derives every slot from the master; `custom` honours the per-slot
 * values but still derives any slot left empty, so a partially customised
 * palette keeps following the master where the user did not override it.
 * @param value - the config section from the settings form, when ready.
 * @returns resolved slots, or null when nothing usable is stored.
 */
export function readPaletteConfig(value: unknown): PaletteColors | null {
  if (value === null || typeof value !== 'object') return null
  const section = value as Record<string, unknown>
  const master = storedColor(section.master) ?? toHex(parseHex(DEFAULT_MASTER))
  const derived = deriveFromMaster(master)
  if (derived === null) return null
  if (section.mode !== 'custom') return derived
  const resolved: PaletteColors = { ...derived }
  for (const key of SLOT_KEYS as (keyof PaletteColors)[]) {
    const stored = storedColor(section[key])
    if (stored !== null) resolved[key] = stored
  }
  return resolved
}