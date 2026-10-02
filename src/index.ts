/**
 * Skin-switcher plugin, node half. Pure UI plugin: the empty apply exists so
 * the plugin appears in the host cordis.yml / Loader; the browser half ships
 * via exports["./client"], discovered through the package.json dsh.client
 * declaration.
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

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply(): void {}
