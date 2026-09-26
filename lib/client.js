window.__ModuleLoader__.load({
	id: "@domitor-syh/dsh-ui-skin-switcher",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		//#region src/client/index.ts
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
		/**
		* Required services: the connection RPC face (sessions models/selectModel), the
		* runtime sessions service (subagentAddress), the locale service (which
		* synthesizes the seat's `t`), and the slot registry.
		*/
		const inject = [
			"locale",
			"modelDirectories",
			"remote",
			"remote.session",
			"sessions",
			"slots"
		];
		/** Dictionary namespace owned by this plugin. */
		const NS = "ui-skin-switcher";
		/** Plugin-owned copy: `zh` is the key-set source of truth, `en` mirrors it. */
		const DICTS = {
			zh: {
				"trigger.fallbackModel": "模型",
				"trigger.selectModel": "选择模型",
				"effort.title": "思考强度",
				"effort.default": "默认",
				"menu.models": "模型",
				"status.loading": "加载中…",
				"status.noModels": "暂无可用模型",
				"help.aria": "思考强度说明",
				"help.text": "调节模型推理深度，低强度回复快、内容简洁；高强度思考更全面，适合复杂问题，响应会稍慢。"
			},
			en: {
				"trigger.fallbackModel": "Model",
				"trigger.selectModel": "Select model",
				"effort.title": "Reasoning effort",
				"effort.default": "Default",
				"menu.models": "Models",
				"status.loading": "Loading…",
				"status.noModels": "No models available",
				"help.aria": "About reasoning effort",
				"help.text": "Adjusts how deeply the model reasons: lower effort answers faster and more concisely, while higher effort thinks more thoroughly for complex problems and responds a little slower."
			}
		};
		/** Dot-matrix rows to render. */
		const MATRIX_ROWS = 5;
		/** Designed track height in CSS px; the matrix is solved to land near it. */
		const MATRIX_TRACK_DESIGN = 23;
		/** Smallest block edge, in device px, that still reads as a square rather than a dot. */
		const MATRIX_MIN_BLOCK_DEV = 3;
		/** Design gap between blocks, in CSS px at 100% scaling. */
		const MATRIX_GAP_DESIGN = 1;
		/** Design margin above the first and below the last block row, in CSS px. */
		const MATRIX_MARGIN_DESIGN = .5;
		/** Flash cycle length in seconds, matching the `.sk5-sq` animation shorthand. */
		const FLASH_CYCLE_S = 1.7;
		/** Per-cell cycle spread (±8%): drifts the phases apart so no pattern repeats. */
		const FLASH_JITTER = .08;
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
		function solveMatrix(wDev, dpr) {
			const gap = Math.max(1, Math.round(MATRIX_GAP_DESIGN * dpr));
			const margin = Math.max(1, Math.round(MATRIX_MARGIN_DESIGN * dpr));
			const rows = MATRIX_ROWS;
			const block = Math.max(MATRIX_MIN_BLOCK_DEV, Math.round((MATRIX_TRACK_DESIGN * dpr - 2 * margin - 4 * gap) / rows));
			const cols = Math.max(1, Math.floor((wDev + gap) / (block + gap)));
			const restX = wDev - (cols * block + (cols - 1) * gap);
			const padX = Math.floor(restX / 2);
			return {
				c: cols,
				r: rows,
				sq: block / dpr,
				gap: gap / dpr,
				radius: block * .3 / dpr,
				trackHeight: (2 * margin + rows * block + 4 * gap) / dpr,
				trackWDev: wDev,
				padTop: margin / dpr,
				padBottom: margin / dpr,
				padLeft: padX / dpr,
				padRight: (restX - padX) / dpr
			};
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
		function cellUnit(r, c, seed) {
			let h = Math.imul(r + 1, 2654435761) ^ Math.imul(c + 1, 2246822507) ^ Math.imul(seed, 668265263);
			h = Math.imul(h ^ h >>> 15, 625341585);
			h ^= h >>> 13;
			return (h >>> 0) / 4294967296;
		}
		/** Insert one stylesheet and return its disposer. */
		function injectCss(css) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "skin-switcher";
			tag.textContent = css;
			document.head.appendChild(tag);
			return () => {
				tag.remove();
			};
		}
		/** Extract a message from an unknown error. */
		function msg(e) {
			if (e !== null && typeof e === "object" && typeof e.message === "string") return e.message;
			return String(e);
		}
		/** Find the model descriptor inside one provider group. */
		function findModel(groups, provider, model) {
			const g = groups.find((x) => x.id === provider);
			if (g === void 0) return void 0;
			return g.models.find((m) => m.id === model);
		}
		/** Effort slider / matrix / model list styles, injected once for this plugin. */
		const CSS = ".sk5-root{position:relative;display:inline-flex;}.sk5-triggers{display:inline-flex;align-items:center;gap:2px;}.sk5-trigger{display:inline-flex;align-items:center;padding:4px 8px;border-radius:10px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;max-width:210px;}.sk5-trigger:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}.sk5-trigger:disabled{opacity:.55;cursor:not-allowed;}.sk5-triggerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sk5-triggerEffort{color:var(--dsw-alias-brand-primary);}.sk5-drop{position:absolute;bottom:calc(100% + 6px);right:0;border-radius:14px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:0 10px 32px rgb(0 0 0 / .35);z-index:1200;color:var(--dsw-alias-label-primary);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}.sk5-model{width:256px;}.sk5-modelsTitle{font-size:14px;font-weight:700;color:var(--dsw-alias-label-secondary);padding:12px 14px 6px;text-align:left;}.sk5-list{overflow-y:auto;padding:2px 6px 10px;max-height:min(420px,60vh);}.sk5-group{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-tertiary);padding:8px 10px 3px;text-align:left;}.sk5-row{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;padding:6px 10px;border-radius:12px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;}.sk5-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}.sk5-row:disabled{opacity:.6;cursor:wait;}.sk5-rowDesc{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sk5-check{font-size:12px;color:var(--dsw-alias-brand-primary);}.sk5-status{padding:14px;font-size:12.5px;opacity:.65;text-align:center;}.sk5-err{padding:8px 4px 0;font-size:11.5px;color:var(--dsw-alias-state-error-primary);text-align:left;}.sk5-effort{width:225px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:10px 12px 12px;}.sk5-titleRow{display:flex;align-items:center;gap:8px;margin-bottom:8px;}.sk5-effortLabel{font-size:13px;font-weight:600;color:var(--dsw-alias-label-secondary);}.sk5-help{position:relative;margin-left:auto;display:inline-flex;}/* The ring is an SVG stroke, not a CSS border or gradient: a vector stroke is anti-aliased by the rasterizer at every size, while a sub-pixel gradient ring at this diameter quantises into visible steps. The ring inherits currentColor, so the existing hover colour change lights it up. */.sk5-helpBtn{position:relative!important;width:16px!important;height:16px!important;min-width:0!important;min-height:0!important;box-sizing:border-box!important;padding:0!important;border:none!important;box-shadow:none!important;outline:none!important;border-radius:50%!important;clip-path:circle(50%);background:transparent!important;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:help;flex:none!important;appearance:none;}.sk5-helpRing{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;}.sk5-helpQ{position:relative;}.sk5-helpBtn:hover{color:var(--dsw-alias-label-primary);}.sk5-helpTip{position:absolute;top:calc(100% + 6px);right:0;width:206px;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;box-shadow:0 8px 24px rgb(0 0 0 / .35);z-index:20;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .12s ease,visibility .12s ease;}.sk5-helpBtn:hover ~ .sk5-helpTip{opacity:1;visibility:visible;}.sk5-helpTip:hover{opacity:1;visibility:visible;}.sk5-helpTip::before{content:\"\";position:absolute;top:-8px;left:0;right:0;height:8px;}.sk5-helpTitle{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:3px;text-align:left;}.sk5-helpText{font-size:11.5px;line-height:1.55;color:var(--dsw-alias-label-secondary);text-align:left;}.sk5-effortValue{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);}.sk5-effortValueMax{color:var(--dsw-static-deepseek-400);}@keyframes sk5-nameBlur{from{filter:blur(5px);opacity:.3}to{filter:blur(0);opacity:1}}.sk5-labelsRow{display:flex;justify-content:space-between;margin-bottom:6px;}.sk5-endLabel{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-secondary);}.sk5-track{position:relative;height:23px;border-radius:9px!important;background:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;}.sk5-fill{position:absolute;top:0;bottom:0;left:0;border-radius:9px 0 0 9px!important;transition:width .16s ease,opacity .16s ease;pointer-events:none;}.sk5-fillEnd{border-radius:9px!important;}.sk5-dotHit{position:absolute;top:0;bottom:0;width:16px;transform:translateX(-50%);display:flex;align-items:flex-start;justify-content:center;cursor:pointer;z-index:2;}/* The dot is drawn as an SVG circle rather than a CSS background: at 4px on a 150% display that is a 6-device-pixel disc, and a vector circle is coverage-antialiased far more evenly than a border-radius fill at this size. The span keeps the 50% box radius so the hover glow stays circular. *//* The level marks and the handle are pinned to the theme static white instead of the alias label token: they must stay white in both appearances, so they never follow the light-mode near-black value. Only the top level keeps its brand blue. */.sk5-dot{width:4px!important;height:4px!important;min-width:0!important;min-height:0!important;flex:none!important;border-radius:50%!important;background:transparent!important;color:var(--dsw-static-neutral-bluish-00);opacity:.9;pointer-events:none;transition:opacity .12s ease;}.sk5-dotShape{display:block;width:100%;height:100%;overflow:visible;}/* Hover lights a soft halo with drop-shadow, not box-shadow: drop-shadow follows the painted alpha (our SVG circle), while box-shadow follows the element box — and the host overrides this span's border-radius, so a box-shadow halo came out as a blurred square with diamond corners. The resting state carries no filter at all: any filter, even a zero-blur one, moves the element onto its own rasterization layer and changes how this 6-device-pixel circle is antialiased. */.sk5-dotHit:hover .sk5-dot{opacity:1;}.sk5-dotShape{transition:filter .14s ease;filter:none;}.sk5-dotHit:hover .sk5-dotShape{filter:drop-shadow(0 0 2.5px currentColor);}.sk5-dotMax{color:var(--dsw-static-deepseek-400);}.sk5-handle{position:absolute;top:0;bottom:0;width:20px;border-radius:9px!important;background:var(--dsw-static-neutral-bluish-00);transform:translateX(-50%);box-shadow:0 0 0 transparent;transition:left .16s ease,transform .16s ease,box-shadow .5s ease,background-color .5s ease;z-index:3;cursor:grab;}.sk5-handleMax{background:color-mix(in srgb, var(--dsw-static-deepseek-450) 25%, var(--dsw-static-neutral-bluish-00));box-shadow:0 0 10px color-mix(in srgb, var(--dsw-static-deepseek-400) 90%, transparent);}.sk5-handleMoving{transform:translateX(-50%) scale(1.14);}.sk5-handleMax{background:color-mix(in srgb, var(--dsw-static-deepseek-450) 25%, var(--dsw-static-neutral-bluish-00));box-shadow:0 0 10px color-mix(in srgb, var(--dsw-static-deepseek-400) 90%, transparent);}/* Day mode only: a soft grey-black halo around the white knob, so that where it meets an equally white dropdown panel its own pixel edge is masked instead of showing. Night mode keeps the bare handle, and the top level keeps its blue glow. The host removes data-ds-dark-theme from <body> in the light appearance, so :not() is the day-mode test. */body:not([data-ds-dark-theme]) .sk5-handle:not(.sk5-handleMax){box-shadow:0 0 3px rgb(0 0 0 / .28);}.sk5-matrix{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;border-radius:9px!important;pointer-events:none;z-index:1;box-sizing:border-box;display:grid;gap:1px;justify-content:start;align-content:start;}.sk5-cell{width:100%;height:100%;opacity:0;animation:sk5-appear .6s ease forwards;}@keyframes sk5-appear{from{opacity:.1}to{opacity:1}}.sk5-sq{width:100%;height:100%;border-radius:1px;animation:sk5-flash 1.45s infinite ease-in-out;}/* One flash cycle: hold blue 250ms, jump to light, hold light 480ms, fade back over 720ms. */@keyframes sk5-flash{0%,29.41%{background:var(--dsw-static-deepseek-500)}29.42%,57.65%{background:var(--flash-light,var(--dsw-static-deepseek-400))}100%{background:var(--dsw-static-deepseek-500)}}";
		/** Per-model (provider\u0000model) effort memory, shared across the whole page. */
		const effortMemory = /* @__PURE__ */ new Map();
		/** Two-level mask curve: right side opaque, left transparent, transition over 5%→75%. */
		function fadeAt(fx) {
			if (fx <= .05) return 0;
			if (fx >= .75) return 1;
			const t = (fx - .05) / .7;
			return t * t * (3 - 2 * t);
		}
		/**
		* Client plugin body: inject the stylesheet once, then register the composer
		* model seat whose component reads `sessions.models` and writes
		* `sessions.selectModel`.
		* @param ctx - client root context carrying connection and slots.
		*/
		function apply(ctx) {
			/**
			* The first-party model directory service. It carries the same host catalog
			* and the same session selection projection the official `/model` selector
			* renders, so this seat always shows what `/model` shows. DSH 0.1.5 replaced
			* the older `connection.api.sessions` RPC face with this service.
			*/
			const directories = ctx.modelDirectories;
			const runtimeSessions = ctx.sessions;
			ctx.effect(() => injectCss(CSS));
			ctx.effect(() => ctx.locale.register(NS, DICTS), "ui-skin-switcher: dictionaries");
			ctx.slots.inject("conversation.input.model", () => ctx.slots.register({
				name: "conversation.input.model",
				priority: -1,
				locale: NS
			}, (props) => {
				const { locked, sessionId, t } = props;
				/**
				* Read one dictionary key through the framework-injected `t` seat; the
				* Chinese table backs a host that shipped no locale service.
				*/
				const tr = (key) => typeof t === "function" ? t(key) : DICTS.zh[key] ?? key;
				const [menu, setMenu] = react.useState(null);
				const [busy, setBusy] = react.useState(false);
				const [error, setError] = react.useState(null);
				const [hoverIdx, setHoverIdx] = react.useState(null);
				const [grid, setGrid] = react.useState(null);
				const rootRef = react.useRef(null);
				const trackRef = react.useRef(null);
				const [moving, setMoving] = react.useState(false);
				const dragIdxRef = react.useRef(null);
				const busyRef = react.useRef(false);
				const pendingRef = react.useRef(null);
				const [settledIdx, setSettledIdx] = react.useState(null);
				/** This session's shared directory — the official selector's own data source. */
				const directory = react.useMemo(() => directories.directoryFor(sessionId), [sessionId]);
				const state = react.useSyncExternalStore(react.useCallback((listener) => directory.store.subscribe(listener), [directory]), react.useCallback(() => directory.store.getSnapshot(), [directory]));
				/** Composer trigger row owns this width; the slider handle spans half of it. */
				const HANDLE_W = 20;
				const load = () => {
					directory.load().catch(() => {});
				};
				react.useEffect(() => {
					load();
				}, []);
				react.useEffect(() => {
					if (menu !== null) load();
				}, [menu]);
				react.useEffect(() => {
					if (menu === null) return;
					const handler = (ev) => {
						if (rootRef.current !== null && !rootRef.current.contains(ev.target)) setMenu(null);
					};
					document.addEventListener("mousedown", handler);
					return () => document.removeEventListener("mousedown", handler);
				}, [menu]);
				react.useEffect(() => {
					if (menu !== "effort") return;
					const measure = () => {
						if (trackRef.current !== null) {
							const w = trackRef.current.getBoundingClientRect().width;
							const dpr = window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
							const next = solveMatrix(Math.floor(w * dpr), dpr);
							setGrid((g) => g !== null && g.c === next.c && g.r === next.r && g.sq === next.sq && g.gap === next.gap && g.trackWDev === next.trackWDev && g.padTop === next.padTop && g.padBottom === next.padBottom && g.padLeft === next.padLeft && g.padRight === next.padRight ? g : next);
						}
					};
					measure();
					window.addEventListener("resize", measure);
					return () => window.removeEventListener("resize", measure);
				}, [menu]);
				react.useEffect(() => {
					setHoverIdx(null);
				}, [state.current === null ? null : state.current.reasoningEffort]);
				const apply = (sel, keepOpen) => {
					pendingRef.current = sel;
					if (busyRef.current) return;
					busyRef.current = true;
					setBusy(true);
					setError(null);
					directory.select({
						provider: sel.provider,
						model: sel.model,
						...sel.reasoningEffort === void 0 ? {} : { reasoningEffort: sel.reasoningEffort }
					}).then(() => {
						busyRef.current = false;
						setBusy(false);
						if (!keepOpen) setMenu(null);
						effortMemory.set(sel.provider + "\0" + sel.model, sel.reasoningEffort);
						const next = pendingRef.current;
						if (next !== null && next !== sel) {
							pendingRef.current = null;
							apply(next, true);
						}
					}, (e) => {
						busyRef.current = false;
						setBusy(false);
						setHoverIdx(null);
						setError(msg(e));
						pendingRef.current = null;
					});
				};
				const groups = state.groups;
				const current = state.current;
				/** Selection failures are local; catalog failures live on the shared store. */
				const shownError = error !== null ? error : state.error;
				const loaded = state.status !== "idle";
				const curGroup = current === null ? void 0 : groups.find((g) => g.id === current.provider);
				const curModel = current === null ? void 0 : findModel(groups, current.provider, current.model);
				const modelLabel = curModel !== void 0 ? curModel.name : current !== null && current.model !== "" ? current.model : tr("trigger.fallbackModel");
				const reasoning = curModel !== void 0 ? curModel.reasoning : void 0;
				const effectiveEffort = current !== null && current.reasoningEffort !== void 0 ? current.reasoningEffort : reasoning !== void 0 && reasoning.defaultEffort !== void 0 ? reasoning.defaultEffort : void 0;
				const choices = reasoning === void 0 ? [] : [...reasoning.defaultEffort === void 0 ? [{
					key: "default",
					effort: void 0,
					label: tr("effort.default")
				}] : [], ...reasoning.efforts.map((e) => ({
					key: "e:" + e.id,
					effort: e.id,
					label: e.name
				}))];
				const activeKey = effectiveEffort === void 0 ? "default" : "e:" + effectiveEffort;
				const activeIdx = Math.max(0, choices.findIndex((c) => c.key === activeKey));
				const posIdx = hoverIdx !== null ? hoverIdx : activeIdx;
				const safePosIdx = choices.length > 0 ? Math.max(0, Math.min(choices.length - 1, posIdx)) : 0;
				const atMaxPos = choices.length > 1 && safePosIdx === choices.length - 1;
				const displayIdx = settledIdx === null ? activeIdx : settledIdx;
				const safeDisplayIdx = choices.length > 0 ? Math.max(0, Math.min(choices.length - 1, displayIdx)) : 0;
				const displayChoice = choices.length > 0 ? choices[safeDisplayIdx] : null;
				const displayLabel = displayChoice !== null ? displayChoice.label : tr("effort.default");
				const inMax = choices.length > 1 && safeDisplayIdx === choices.length - 1;
				const matrixVisible = inMax && atMaxPos;
				const posPct = choices.length > 1 ? posIdx / (choices.length - 1) * 100 : 0;
				const matrixCells = react.useMemo(() => {
					if (!inMax || grid === null) return [];
					/** Blend a colour toward its own luminance: same hue, less saturation. */
					const desat = (rgb, f) => {
						const l = .299 * rgb[0] + .587 * rgb[1] + .114 * rgb[2];
						return rgb.map((v) => Math.round(v + (l - v) * f));
					};
					const deep = desat([
						65,
						118,
						230
					], .15);
					const lightMax = desat([
						103,
						158,
						254
					], .15);
					/**
					* How far the lightest cells reach past deepseek-400 (103,158,254)
					* toward deepseek-300 (183,200,254): a small lift reads lighter without
					* going pale. This is the knob for "a touch lighter".
					*/
					const lightLift = .3;
					const lightPeak = lightMax.map((v, i) => Math.round(v + ([
						183,
						200,
						254
					][i] - v) * lightLift));
					/** Overall right-to-left sweep duration of the reveal. */
					const revealMs = 1800;
					/** Per-cell random stagger, ± this many ms: perforates the front edge. */
					const staggerMs = 80;
					/** Integer-lattice hash folded into [0,1). */
					const noiseHash = (x, y, seed) => {
						let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2246822519) | 0;
						h = h ^ h >>> 13 | 0;
						h = Math.imul(h, 1274126177);
						return ((h ^ h >>> 16) >>> 0) / 4294967296;
					};
					/** Value noise: lattice hashes blended by a smoothstep, hence smooth. */
					const valueNoise = (x, y, seed) => {
						const x0 = Math.floor(x);
						const y0 = Math.floor(y);
						const fx = x - x0;
						const fy = y - y0;
						const sx = fx * fx * (3 - 2 * fx);
						const sy = fy * fy * (3 - 2 * fy);
						const n00 = noiseHash(x0, y0, seed);
						const n10 = noiseHash(x0 + 1, y0, seed);
						const n01 = noiseHash(x0, y0 + 1, seed);
						const n11 = noiseHash(x0 + 1, y0 + 1, seed);
						return (n00 * (1 - sx) + n10 * sx) * (1 - sy) + (n01 * (1 - sx) + n11 * sx) * sy;
					};
					/**
					* Two octaves in [-1,1]: a broad fog bank plus a finer grain, so the
					* frontier reads as eroded by noise rather than as a straight edge.
					*/
					/**
					* Column-wise cluster centre: a smooth 1-D noise, so neighbouring columns
					* share the cluster and the frontier reads as melting rather than
					* flickering. Returns a fractional row index in [0, rows-1].
					*/
					const clusterAt = (c) => {
						return (valueNoise(c * .35, .5, 71) * .65 + valueNoise(c * .9, 3.5, 89) * .35) * (grid.r - 1);
					};
					const out = [];
					for (let r = 0; r < grid.r; r++) for (let c = 0; c < grid.c; c++) {
						const k = .45 + cellUnit(r, c, 1) * .5;
						const lc = deep.map((v, i) => Math.round(v + (lightPeak[i] - v) * k));
						const flashDelay = (cellUnit(r, c, 2) * 1.38 + .35).toFixed(3) + "s";
						/**
						* Per-cell cycle length, jittered around the stylesheet's 1.45s base.
						* With one shared duration every cell keeps a fixed phase, so the
						* whole pattern repeats exactly each round and a local area replays
						* the same order; the spread drifts the phases apart instead.
						*/
						const flashDuration = (FLASH_CYCLE_S * (.92 + cellUnit(r, c, 3) * 2 * FLASH_JITTER)).toFixed(3) + "s";
						const fx = grid.c > 1 ? c / (grid.c - 1) : 0;
						const u = grid.c > 1 ? (grid.c - 1 - c) / (grid.c - 1) : 0;
						const m = clusterAt(c);
						const rank = Math.abs(r - m) / (grid.r - 1);
						const stages = 5;
						const stage = Math.min(stages, Math.round(rank * stages));
						const stagger = (cellUnit(r, c, 4) * 2 - 1) * staggerMs;
						const appearDelay = (revealMs * Math.max(0, Math.min(1, u + stage / (grid.c - 1) + stagger / revealMs)) / 1e3).toFixed(3) + "s";
						out.push({
							key: r + "-" + c,
							flashLight: "rgb(" + lc[0] + "," + lc[1] + "," + lc[2] + ")",
							flashDeep: "rgb(" + deep.join(",") + ")",
							animationDelay: flashDelay,
							flashDuration,
							appearDelay,
							fade: fadeAt(fx)
						});
					}
					return out;
				}, [inMax, grid]);
				react.useEffect(() => {
					const id = setTimeout(() => setSettledIdx(safePosIdx), 160);
					return () => clearTimeout(id);
				}, [safePosIdx]);
				if (runtimeSessions.subagentAddress(sessionId) !== void 0) return null;
				const insetPx = HANDLE_W / 2;
				const posFrac = posPct / 100;
				const dotLeft = (i) => "calc(10px + (100% - 20px) * " + (choices.length > 1 ? i / (choices.length - 1) : 0) + ")";
				/**
				* Level dots are laid out in whole device pixels. Their proportional
				* `left` is fractional by nature, and a 6-device-pixel circle that
				* straddles two pixels reads as a rounded square: snapping both axes to
				* the device grid gives the rasterizer a symmetric circle to draw.
				*/
				const dpr = typeof window !== "undefined" && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
				const dotDev = 4 * dpr;
				const insetDev = insetPx * dpr;
				const dotLeftSnapped = (i) => {
					if (grid === null) return dotLeft(i);
					const frac = choices.length > 1 ? i / (choices.length - 1) : 0;
					return Math.round(insetDev + (grid.trackWDev - 2 * insetDev) * frac) / dpr + "px";
				};
				const dotTopSnapped = grid === null ? void 0 : Math.round((grid.trackHeight * dpr - dotDev) / 2) / dpr + "px";
				const handleLeft = "calc(10px + (100% - 20px) * " + posFrac + ")";
				const fillWidth = handleLeft;
				const fillHidden = inMax && atMaxPos;
				const fillSolid = "color-mix(in srgb, var(--dsw-alias-label-primary) 42%, transparent)";
				const onPickModel = (m, g) => {
					setSettledIdx(null);
					const remembered = effortMemory.get(g.id + "\0" + m.id);
					apply({
						provider: g.id,
						model: m.id,
						...remembered === void 0 ? {} : { reasoningEffort: remembered }
					}, false);
				};
				const onPickEffort = (effort) => {
					if (current === null) return;
					apply({
						provider: current.provider,
						model: current.model,
						...effort === void 0 ? {} : { reasoningEffort: effort }
					}, true);
				};
				const idxFromEvent = (ev) => {
					const el = trackRef.current;
					if (el === null || choices.length < 2) return 0;
					const rect = el.getBoundingClientRect();
					const usable = Math.max(rect.width - 20, 1);
					const frac = Math.max(0, Math.min(1, (ev.clientX - rect.left - insetPx) / usable));
					const idx = Math.round(frac * (choices.length - 1));
					return Math.max(0, Math.min(choices.length - 1, idx));
				};
				const onWinMove = (ev) => {
					if (dragIdxRef.current === null) return;
					const idx = idxFromEvent(ev);
					dragIdxRef.current = idx;
					setHoverIdx(idx);
				};
				const stopDrag = () => {
					window.removeEventListener("pointermove", onWinMove);
					window.removeEventListener("pointerup", onWinUp);
					window.removeEventListener("pointercancel", onWinCancel);
					window.removeEventListener("blur", onWinCancel);
				};
				const onWinUp = () => {
					if (dragIdxRef.current === null) return;
					const idx = dragIdxRef.current;
					dragIdxRef.current = null;
					setMoving(false);
					stopDrag();
					const c = choices[idx];
					if (c !== void 0) {
						setHoverIdx(idx);
						onPickEffort(c.effort);
					}
				};
				const onWinCancel = () => {
					dragIdxRef.current = null;
					setMoving(false);
					stopDrag();
					setHoverIdx(null);
				};
				const onTrackDown = (ev) => {
					if (choices.length === 0) return;
					dragIdxRef.current = idxFromEvent(ev);
					setHoverIdx(dragIdxRef.current);
					window.addEventListener("pointermove", onWinMove);
					window.addEventListener("pointerup", onWinUp);
					window.addEventListener("pointercancel", onWinCancel);
					window.addEventListener("blur", onWinCancel);
				};
				const triggerTitle = curGroup !== void 0 && curModel !== void 0 ? curGroup.name + " / " + curModel.name + (effectiveEffort !== void 0 ? " · " + displayLabel : "") : tr("trigger.selectModel");
				return react.createElement("div", {
					ref: rootRef,
					className: "sk5-root"
				}, react.createElement("div", { className: "sk5-triggers" }, react.createElement("button", {
					type: "button",
					className: "sk5-trigger",
					disabled: locked || busy,
					title: triggerTitle,
					"aria-haspopup": "menu",
					"aria-expanded": menu === "model",
					onClick: () => setMenu((m) => m === "model" ? null : "model")
				}, react.createElement("span", { className: "sk5-triggerName" }, modelLabel)), reasoning !== void 0 && choices.length > 0 ? react.createElement("button", {
					type: "button",
					className: "sk5-trigger sk5-triggerEffort",
					disabled: locked || busy || current === null,
					title: tr("effort.title"),
					"aria-haspopup": "menu",
					"aria-expanded": menu === "effort",
					onClick: () => setMenu((m) => m === "effort" ? null : "effort")
				}, react.createElement("span", {
					key: displayLabel,
					style: { animation: "sk5-nameBlur .28s ease" }
				}, displayLabel)) : null), menu === "model" ? react.createElement("div", {
					className: "sk5-drop sk5-model",
					role: "menu",
					"aria-label": tr("trigger.selectModel")
				}, react.createElement("div", { className: "sk5-modelsTitle" }, tr("menu.models")), react.createElement("div", { className: "sk5-list" }, !loaded && shownError === null ? react.createElement("div", { className: "sk5-status" }, tr("status.loading")) : null, !loaded && shownError !== null ? react.createElement("div", { className: "sk5-err" }, shownError) : null, loaded && groups.length === 0 ? react.createElement("div", { className: "sk5-status" }, tr("status.noModels")) : null, loaded ? groups.map((g) => react.createElement("div", { key: g.id }, react.createElement("div", { className: "sk5-group" }, g.name), g.models.map((m) => {
					const active = current !== null && current.provider === g.id && current.model === m.id;
					return react.createElement("button", {
						key: m.id,
						type: "button",
						role: "menuitem",
						className: "sk5-row",
						disabled: busy,
						onClick: () => onPickModel(m, g)
					}, react.createElement("span", { style: { minWidth: 0 } }, react.createElement("div", null, m.name), m.description !== void 0 ? react.createElement("div", { className: "sk5-rowDesc" }, m.description) : null), active ? react.createElement("span", { className: "sk5-check" }, "✓") : null);
				}))) : null)) : null, menu === "effort" ? react.createElement("div", {
					className: "sk5-drop sk5-effort",
					role: "menu",
					"aria-label": tr("effort.title")
				}, react.createElement("div", { className: "sk5-titleRow" }, react.createElement("span", { className: "sk5-effortLabel" }, "Effort"), react.createElement("span", {
					key: displayLabel,
					className: "sk5-effortValue" + (choices.length > 1 && inMax ? " sk5-effortValueMax" : ""),
					style: { animation: "sk5-nameBlur .28s ease" }
				}, displayLabel), react.createElement("div", { className: "sk5-help" }, react.createElement("button", {
					type: "button",
					className: "sk5-helpBtn",
					"aria-label": tr("help.aria")
				}, react.createElement("svg", {
					className: "sk5-helpRing",
					viewBox: "0 0 16 16",
					"aria-hidden": "true"
				}, react.createElement("circle", {
					cx: 8,
					cy: 8,
					r: 7.35,
					fill: "none",
					stroke: "currentColor",
					strokeWidth: .75
				})), react.createElement("span", { className: "sk5-helpQ" }, "?")), react.createElement("div", { className: "sk5-helpTip" }, react.createElement("div", { className: "sk5-helpTitle" }, tr("effort.title")), react.createElement("div", { className: "sk5-helpText" }, tr("help.text"))))), react.createElement("div", { className: "sk5-labelsRow" }, react.createElement("span", { className: "sk5-endLabel" }, "Faster"), react.createElement("span", { className: "sk5-endLabel" }, "Smarter")), react.createElement("div", {
					ref: trackRef,
					className: "sk5-track",
					style: grid === null ? void 0 : { height: grid.trackHeight + "px" },
					onPointerDown: onTrackDown
				}, react.createElement("div", {
					className: "sk5-fill" + (posPct > 96 ? " sk5-fillEnd" : ""),
					style: {
						width: fillWidth,
						background: fillSolid,
						opacity: fillHidden ? 0 : 1
					}
				}), matrixVisible && grid !== null ? react.createElement("div", {
					className: "sk5-matrix",
					style: {
						gridTemplateColumns: "repeat(" + grid.c + "," + grid.sq + "px)",
						gridTemplateRows: "repeat(" + grid.r + "," + grid.sq + "px)",
						gap: grid.gap + "px",
						padding: grid.padTop + "px " + grid.padRight + "px " + grid.padBottom + "px " + grid.padLeft + "px",
						justifyContent: "start",
						alignContent: "start"
					}
				}, matrixCells.map((sq) => react.createElement("div", {
					key: sq.key,
					className: "sk5-cell",
					style: { animationDelay: sq.appearDelay }
				}, react.createElement("div", {
					className: "sk5-sq",
					style: {
						background: "var(--dsw-static-deepseek-500)",
						opacity: sq.fade,
						animationDelay: sq.animationDelay,
						animationDuration: sq.flashDuration,
						borderRadius: grid.radius + "px",
						"--flash-light": sq.flashLight,
						"--flash-deep": sq.flashDeep
					}
				})))) : null, !inMax ? choices.map((c, i) => react.createElement("span", {
					key: c.key,
					className: "sk5-dotHit",
					style: { left: dotLeftSnapped(i) }
				}, react.createElement("span", {
					className: "sk5-dot" + (i === choices.length - 1 ? " sk5-dotMax" : ""),
					style: { marginTop: dotTopSnapped }
				}, react.createElement("svg", {
					className: "sk5-dotShape",
					viewBox: "0 0 4 4",
					"aria-hidden": "true"
				}, react.createElement("circle", {
					cx: 2,
					cy: 2,
					r: 2,
					fill: "currentColor"
				}))))) : null, react.createElement("div", {
					className: "sk5-handle" + (inMax ? " sk5-handleMax" : "") + (moving ? " sk5-handleMoving" : ""),
					style: { left: handleLeft },
					onPointerDown: () => setMoving(true)
				})), shownError !== null ? react.createElement("div", { className: "sk5-err" }, shownError) : null) : null);
			}));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
