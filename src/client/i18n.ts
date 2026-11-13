/**
 * Plugin-wide language switch.
 *
 * The shell's locale service picks the dictionary for the *interface* language.
 * The plugin's default is English regardless of that language, and only when
 * the user turns "follow the DSH interface language" on does the framework
 * translator win. This module owns that flag so both the composer seat and the
 * detail-page section react to a change made in the other one.
 */
import * as React from 'react'

/** Whether the plugin follows the DSH interface language. */
let followLocale = false

const listeners = new Set<() => void>()

/**
 * Set the flag and notify subscribers.
 * @param value - the stored setting; anything but `true` means English.
 */
export function setFollowLocale(value: unknown): void {
  const next = value === true
  if (next === followLocale) return
  followLocale = next
  for (const listener of listeners) listener()
}

/** @returns whether the plugin currently follows the DSH interface language. */
export function isFollowLocaleEnabled(): boolean {
  return followLocale
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Re-render the calling component whenever the language switch changes. */
export function useFollowLocale(): boolean {
  return React.useSyncExternalStore(subscribe, isFollowLocaleEnabled, isFollowLocaleEnabled)
}