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
		/** Required services: the connection RPC face (sessions) and the slot registry. */
		/** Required services: the connection RPC face (sessions models/selectModel), the runtime sessions service (subagentAddress), and the slot registry. */
		const inject = [
			"connection",
			"sessions",
			"slots"
		];
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
		const CSS = ".sk5-root{position:relative;display:inline-flex;}.sk5-triggers{display:inline-flex;align-items:center;gap:2px;}.sk5-trigger{display:inline-flex;align-items:center;padding:4px 8px;border-radius:7px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;max-width:210px;}.sk5-trigger:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}.sk5-trigger:disabled{opacity:.55;cursor:not-allowed;}.sk5-triggerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sk5-triggerEffort{color:var(--dsw-alias-brand-primary);}.sk5-drop{position:absolute;bottom:calc(100% + 6px);right:0;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:0 10px 32px rgb(0 0 0 / .35);z-index:1200;color:var(--dsw-alias-label-primary);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}.sk5-model{width:256px;}.sk5-modelsTitle{font-size:14px;font-weight:700;color:var(--dsw-alias-label-secondary);padding:12px 14px 6px;text-align:left;}.sk5-list{overflow-y:auto;padding:2px 6px 10px;max-height:min(420px,60vh);}.sk5-group{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-tertiary);padding:8px 10px 3px;text-align:left;}.sk5-row{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;padding:6px 10px;border-radius:8px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;}.sk5-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}.sk5-row:disabled{opacity:.6;cursor:wait;}.sk5-rowDesc{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sk5-check{font-size:12px;color:var(--dsw-alias-brand-primary);}.sk5-status{padding:14px;font-size:12.5px;opacity:.65;text-align:center;}.sk5-err{padding:8px 4px 0;font-size:11.5px;color:var(--dsw-alias-state-error-primary);text-align:left;}.sk5-effort{width:225px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:10px 12px 12px;}.sk5-titleRow{display:flex;align-items:center;gap:8px;margin-bottom:8px;}.sk5-effortLabel{font-size:13px;font-weight:600;color:var(--dsw-alias-label-secondary);}.sk5-help{position:relative;margin-left:auto;display:inline-flex;}.sk5-helpBtn{width:16px;height:16px;border-radius:50%;clip-path:circle(58%);border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;cursor:help;flex:none;}.sk5-helpBtn:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);}.sk5-helpTip{position:absolute;top:calc(100% + 6px);right:0;width:206px;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;box-shadow:0 8px 24px rgb(0 0 0 / .35);z-index:20;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .12s ease,visibility .12s ease;}.sk5-helpBtn:hover ~ .sk5-helpTip{opacity:1;visibility:visible;}.sk5-helpTip:hover{opacity:1;visibility:visible;}.sk5-helpTip::before{content:\"\";position:absolute;top:-8px;left:0;right:0;height:8px;}.sk5-helpTitle{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:3px;text-align:left;}.sk5-helpText{font-size:11.5px;line-height:1.55;color:var(--dsw-alias-label-secondary);text-align:left;}.sk5-effortValue{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);}.sk5-effortValueMax{color:var(--dsw-static-deepseek-400);}@keyframes sk5-nameBlur{from{filter:blur(5px);opacity:.3}to{filter:blur(0);opacity:1}}.sk5-labelsRow{display:flex;justify-content:space-between;margin-bottom:6px;}.sk5-endLabel{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-secondary);}.sk5-track{position:relative;height:26px;border-radius:6px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;}.sk5-fill{position:absolute;top:0;bottom:0;left:0;transition:width .16s ease,opacity .16s ease;pointer-events:none;}.sk5-dotHit{position:absolute;top:0;bottom:0;width:16px;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;}.sk5-dot{width:4px;height:4px;border-radius:50%;background:var(--dsw-alias-label-primary);opacity:.9;pointer-events:none;transition:transform .12s ease,opacity .12s ease;}.sk5-dotHit:hover .sk5-dot{opacity:1;transform:scale(1.2);}.sk5-handle{position:absolute;top:0;bottom:0;width:20px;border-radius:6px;background:var(--dsw-alias-label-primary);transform:translateX(-50%);box-shadow:0 0 0 transparent;transition:left .16s ease,box-shadow .5s ease,background-color .5s ease;z-index:3;cursor:grab;}.sk5-handleMax{background:color-mix(in srgb, var(--dsw-static-deepseek-450) 25%, var(--dsw-alias-label-primary));box-shadow:0 0 10px color-mix(in srgb, var(--dsw-static-deepseek-400) 90%, transparent);}.sk5-matrix{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;border-radius:6px;pointer-events:none;z-index:1;box-sizing:border-box;display:grid;gap:2px;justify-content:center;align-content:center;}.sk5-cell{width:100%;height:100%;opacity:0;animation:sk5-appear .15s ease forwards;}@keyframes sk5-appear{from{opacity:0}to{opacity:1}}.sk5-sq{width:100%;height:100%;border-radius:1px;animation:sk5-flash 1s infinite ease-in-out;}@keyframes sk5-flash{0%,24%{background-color:var(--dsw-static-deepseek-500)}28%,72%{background-color:var(--flash-light,var(--dsw-static-deepseek-400))}76%,100%{background-color:var(--dsw-static-deepseek-500)}}";
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
			const api = ctx.connection.api.sessions;
			const runtimeSessions = ctx.sessions;
			ctx.effect(() => injectCss(CSS));
			ctx.slots.inject("conversation.input.model", () => ctx.slots.register({
				name: "conversation.input.model",
				priority: -1
			}, (props) => {
				const { locked, sessionId } = props;
				const [menu, setMenu] = react.useState(null);
				const [data, setData] = react.useState(null);
				const [busy, setBusy] = react.useState(false);
				const [error, setError] = react.useState(null);
				const [hoverIdx, setHoverIdx] = react.useState(null);
				const [grid, setGrid] = react.useState({
					c: 0,
					r: 0
				});
				const rootRef = react.useRef(null);
				const trackRef = react.useRef(null);
				const dragIdxRef = react.useRef(null);
				const busyRef = react.useRef(false);
				const pendingRef = react.useRef(null);
				const [settledIdx, setSettledIdx] = react.useState(null);
				const GAP = 2;
				const HANDLE_W = 20;
				const load = () => {
					api.models({ sessionId }).then((resp) => {
						const r = resp.result;
						if (!r.ok) {
							setError(msg(r.error));
							return;
						}
						setData({
							groups: r.value.groups,
							failures: r.value.failures,
							current: r.value.current
						});
						setError(null);
					}, (e) => setError(msg(e)));
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
							const w = trackRef.current.clientWidth;
							const h = trackRef.current.clientHeight;
							const cn = Math.max(1, Math.floor((w + GAP) / 6));
							const rn = Math.max(1, Math.floor((h + GAP) / 6));
							setGrid((g) => g.c === cn && g.r === rn ? g : {
								c: cn,
								r: rn
							});
						}
					};
					measure();
					window.addEventListener("resize", measure);
					return () => window.removeEventListener("resize", measure);
				}, [menu]);
				react.useEffect(() => {
					setHoverIdx(null);
				}, [data === null ? null : data.current === null ? null : data.current.reasoningEffort]);
				const apply = (sel, keepOpen) => {
					pendingRef.current = sel;
					if (busyRef.current) return;
					busyRef.current = true;
					setBusy(true);
					setError(null);
					api.selectModel({
						sessionId,
						provider: sel.provider,
						model: sel.model,
						...sel.reasoningEffort === void 0 ? {} : { reasoningEffort: sel.reasoningEffort }
					}).then((resp) => {
						busyRef.current = false;
						setBusy(false);
						const r = resp.result;
						if (!r.ok) {
							setError(msg(r.error));
							return;
						}
						const selected = r.value.selected;
						if (!keepOpen) setMenu(null);
						setData((d) => d === null ? null : {
							...d,
							current: selected
						});
						effortMemory.set(sel.provider + "\0" + sel.model, selected.reasoningEffort);
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
				const groups = data === null ? [] : data.groups;
				const current = data === null ? null : data.current;
				const curGroup = current === null ? void 0 : groups.find((g) => g.id === current.provider);
				const curModel = current === null ? void 0 : findModel(groups, current.provider, current.model);
				const modelLabel = curModel !== void 0 ? curModel.name : current !== null && current.model !== "" ? current.model : "模型";
				const reasoning = curModel !== void 0 ? curModel.reasoning : void 0;
				const effectiveEffort = current !== null && current.reasoningEffort !== void 0 ? current.reasoningEffort : reasoning !== void 0 && reasoning.defaultEffort !== void 0 ? reasoning.defaultEffort : void 0;
				const choices = reasoning === void 0 ? [] : [...reasoning.defaultEffort === void 0 ? [{
					key: "default",
					effort: void 0,
					label: "默认"
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
				const displayLabel = displayChoice !== null ? displayChoice.label : "默认";
				const inMax = choices.length > 1 && safeDisplayIdx === choices.length - 1;
				const matrixVisible = inMax && atMaxPos;
				const posPct = choices.length > 1 ? posIdx / (choices.length - 1) * 100 : 0;
				const matrixCells = react.useMemo(() => {
					if (!inMax || grid.c <= 0 || grid.r <= 0) return [];
					const deep = [
						65,
						118,
						230
					];
					const lightMax = [
						103,
						158,
						254
					];
					const revealMs = 1e3;
					const revealCycles = 3;
					const revealDepth = .6;
					const speedAt = (t, phase) => 1 + revealDepth * Math.sin(2 * Math.PI * revealCycles * t + phase);
					const integrate = (u, phase) => {
						const steps = 120;
						const du = u / steps;
						let s = 0;
						for (let i = 0; i < steps; i++) {
							const t = (i + .5) * du;
							s += 1 / speedAt(t, phase) * du;
						}
						return s;
					};
					const phases = [];
					const fulls = [];
					for (let r = 0; r < grid.r; r++) {
						const ph = r % 4 * (Math.PI / 2);
						phases.push(ph);
						fulls.push(integrate(1, ph));
					}
					const out = [];
					for (let r = 0; r < grid.r; r++) for (let c = 0; c < grid.c; c++) {
						const k = .45 + (r * 37 + c * 53) % 51 / 100;
						const lc = deep.map((v, i) => Math.round(v + (lightMax[i] - v) * k));
						const flashDelay = ((r * 7 + c * 13) % 29 * .034).toFixed(3) + "s";
						const fx = grid.c > 1 ? c / (grid.c - 1) : 0;
						const appearDelay = (revealMs * (integrate(grid.c > 1 ? (grid.c - 1 - c) / (grid.c - 1) : 0, phases[r]) / fulls[r]) / 1e3).toFixed(3) + "s";
						out.push({
							key: r + "-" + c,
							flashLight: "rgb(" + lc[0] + "," + lc[1] + "," + lc[2] + ")",
							animationDelay: flashDelay,
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
					stopDrag();
					const c = choices[idx];
					if (c !== void 0) {
						setHoverIdx(idx);
						onPickEffort(c.effort);
					}
				};
				const onWinCancel = () => {
					dragIdxRef.current = null;
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
				const triggerTitle = curGroup !== void 0 && curModel !== void 0 ? curGroup.name + " / " + curModel.name + (effectiveEffort !== void 0 ? " · " + displayLabel : "") : "选择模型";
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
					title: "思考强度",
					"aria-haspopup": "menu",
					"aria-expanded": menu === "effort",
					onClick: () => setMenu((m) => m === "effort" ? null : "effort")
				}, react.createElement("span", {
					key: displayLabel,
					style: { animation: "sk5-nameBlur .28s ease" }
				}, displayLabel)) : null), menu === "model" ? react.createElement("div", {
					className: "sk5-drop sk5-model",
					role: "menu",
					"aria-label": "选择模型"
				}, react.createElement("div", { className: "sk5-modelsTitle" }, "Models"), react.createElement("div", { className: "sk5-list" }, data === null && error === null ? react.createElement("div", { className: "sk5-status" }, "加载中…") : null, data === null && error !== null ? react.createElement("div", { className: "sk5-err" }, error) : null, data !== null && groups.length === 0 ? react.createElement("div", { className: "sk5-status" }, "暂无可用模型") : null, data !== null ? groups.map((g) => react.createElement("div", { key: g.id }, react.createElement("div", { className: "sk5-group" }, g.name), g.models.map((m) => {
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
					"aria-label": "思考强度"
				}, react.createElement("div", { className: "sk5-titleRow" }, react.createElement("span", { className: "sk5-effortLabel" }, "Effort"), react.createElement("span", {
					key: displayLabel,
					className: "sk5-effortValue" + (choices.length > 1 && inMax ? " sk5-effortValueMax" : ""),
					style: { animation: "sk5-nameBlur .28s ease" }
				}, displayLabel), react.createElement("div", { className: "sk5-help" }, react.createElement("button", {
					type: "button",
					className: "sk5-helpBtn",
					"aria-label": "思考强度说明"
				}, "?"), react.createElement("div", { className: "sk5-helpTip" }, react.createElement("div", { className: "sk5-helpTitle" }, "思考强度"), react.createElement("div", { className: "sk5-helpText" }, "调节模型推理深度，低强度回复快、内容简洁；高强度思考更全面，适合复杂问题，响应会稍慢。")))), react.createElement("div", { className: "sk5-labelsRow" }, react.createElement("span", { className: "sk5-endLabel" }, "Faster"), react.createElement("span", { className: "sk5-endLabel" }, "Smarter")), react.createElement("div", {
					ref: trackRef,
					className: "sk5-track",
					onPointerDown: onTrackDown
				}, react.createElement("div", {
					className: "sk5-fill",
					style: {
						width: fillWidth,
						background: fillSolid,
						opacity: fillHidden ? 0 : 1,
						borderRadius: posPct > 96 ? 6 : "6px 0 0 6px"
					}
				}), matrixVisible && grid.c > 0 && grid.r > 0 ? react.createElement("div", {
					className: "sk5-matrix",
					style: {
						gridTemplateColumns: "repeat(" + grid.c + ",4px)",
						gridTemplateRows: "repeat(" + grid.r + ",4px)"
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
						"--flash-light": sq.flashLight
					}
				})))) : null, !inMax ? choices.map((c, i) => react.createElement("span", {
					key: c.key,
					className: "sk5-dotHit",
					style: { left: dotLeft(i) }
				}, react.createElement("span", { className: "sk5-dot" }))) : null, react.createElement("div", {
					className: "sk5-handle" + (inMax ? " sk5-handleMax" : ""),
					style: { left: handleLeft }
				})), error !== null ? react.createElement("div", { className: "sk5-err" }, error) : null) : null);
			}));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
