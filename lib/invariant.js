//#region src/invariant.ts
const PACKAGE_NAME = "@domitor-syh/dsh-ui-skin-switcher";
/** Cordis companion plugin name. */
const name = "client-ui-skin-switcher-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: a pure UI surface plugin whose slot registration
* disposal is proven by the HMR-safety contract — it emits no cordis events and
* owns no cross-plugin mutable state.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
