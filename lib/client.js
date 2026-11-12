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
		//#region src/client/palette.js
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
		const DEFAULT_MASTER = "#679EFE";
		/**
		* Relative offsets from the master (the "strong" colour) to each derived slot.
		* `ratio` scales chroma so a grey master stays grey; `dL`/`dH` apply directly.
		*/
		const D_STRONG = {
			dL: .114793,
			ratio: .849409,
			dH: -2.4327
		};
		const D_SOFT = {
			dL: .150329,
			ratio: .637884,
			dH: -.4457
		};
		const D_MID = {
			dL: .057276,
			ratio: .923871,
			dH: -1.003
		};
		/** sRGB <-> OKLab matrices; the inverses are the numeric inverses of these two. */
		const M1 = [
			[
				.4122214708,
				.5363325363,
				.0514459929
			],
			[
				.2119034982,
				.6806995451,
				.1073969566
			],
			[
				.0883024619,
				.2817188376,
				.6171959274
			]
		];
		const M2 = [
			[
				.2104542553,
				.793617785,
				-.0040720468
			],
			[
				1.9779984951,
				-2.428592205,
				.4505937099
			],
			[
				.0259040371,
				.7827717662,
				-.808675766
			]
		];
		const M1I = [
			[
				4.076728996215054,
				-3.309834733049987,
				.23612405674476947
			],
			[
				-1.2684192879954381,
				2.6128949076486467,
				-.3489359889652868
			],
			[
				-.004289722831717083,
				-.719115504557837,
				1.745720374764302
			]
		];
		const M2I = [
			[
				.9999999984505199,
				.39633779217376786,
				.2158037580607588
			],
			[
				1.0000000088817607,
				-.10556134232365634,
				-.0638541747717059
			],
			[
				1.000000054672411,
				-.08948418209496577,
				-1.291485537864092
			]
		];
		function multiply(matrix, vector) {
			return [
				matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
				matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
				matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2]
			];
		}
		function toLinear(value) {
			const v = value / 255;
			return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
		}
		function fromLinear(value) {
			const v = value <= .0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - .055;
			return Math.min(1, Math.max(0, v)) * 255;
		}
		/**
		* Parse `#RGB`, `#RRGGBB` or `#RRGGBBAA` (alpha is ignored: these slots are
		* opaque; transparency is applied with `color-mix` where the UI needs it).
		* @param {string} input
		* @returns {{r: number, g: number, b: number} | null}
		*/
		function parseHex(input) {
			if (typeof input !== "string") return null;
			let hex = input.trim().replace(/^#/, "");
			if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
			if (hex.length === 8) hex = hex.slice(0, 6);
			if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
			return {
				r: parseInt(hex.slice(0, 2), 16),
				g: parseInt(hex.slice(2, 4), 16),
				b: parseInt(hex.slice(4, 6), 16)
			};
		}
		/**
		* @param {{r: number, g: number, b: number}} rgb
		* @returns {string} uppercase `#RRGGBB`
		*/
		function toHex(rgb) {
			return "#" + [
				rgb.r,
				rgb.g,
				rgb.b
			].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
		}
		/**
		* @param {{r: number, g: number, b: number}} rgb
		* @returns {[number, number, number]} OKLab
		*/
		function toOklab(rgb) {
			const lms = multiply(M1, [
				toLinear(rgb.r),
				toLinear(rgb.g),
				toLinear(rgb.b)
			]).map((v) => Math.cbrt(v));
			return multiply(M2, lms);
		}
		/**
		* @param {[number, number, number]} lab
		* @returns {{r: number, g: number, b: number}}
		*/
		function fromOklab(lab) {
			const lms = multiply(M2I, lab).map((v) => v ** 3);
			const [r, g, b] = multiply(M1I, lms);
			return {
				r: fromLinear(r),
				g: fromLinear(g),
				b: fromLinear(b)
			};
		}
		function toLch(lab) {
			const [L, a, b] = lab;
			return {
				L,
				C: Math.hypot(a, b),
				H: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360
			};
		}
		function fromLch(lch) {
			const rad = lch.H * Math.PI / 180;
			return fromOklab([
				lch.L,
				lch.C * Math.cos(rad),
				lch.C * Math.sin(rad)
			]);
		}
		/**
		* Linear sRGB interpolation.
		* @param {string} a
		* @param {string} b
		* @param {number} t 0 picks `a`, 1 picks `b`
		* @returns {string | null}
		*/
		function mixHex(a, b, t) {
			const ra = parseHex(a);
			const rb = parseHex(b);
			if (ra === null || rb === null) return null;
			return toHex({
				r: ra.r + (rb.r - ra.r) * t,
				g: ra.g + (rb.g - ra.g) * t,
				b: ra.b + (rb.b - ra.b) * t
			});
		}
		/**
		* Derive the six palette slots from one master colour (the effort value).
		* Returns `null` for an unparseable master so callers can fall back.
		* @param {string} master `#RRGGBB`
		* @returns {{dialogFont: string, maxDot: string, slider: string, sliderGlow: string, gridNormal: string, gridBlink: string} | null}
		*/
		function deriveFromMaster(master) {
			const rgb = parseHex(master);
			if (rgb === null) return null;
			const strong = toLch(toOklab(rgb));
			const base = fromLch({
				L: strong.L - D_STRONG.dL,
				C: strong.C / D_STRONG.ratio,
				H: strong.H - D_STRONG.dH
			});
			const baseLch = toLch(toOklab(base));
			const soft = fromLch({
				L: baseLch.L + D_SOFT.dL,
				C: baseLch.C * D_SOFT.ratio,
				H: baseLch.H + D_SOFT.dH
			});
			const mid = fromLch({
				L: baseLch.L + D_MID.dL,
				C: baseLch.C * D_MID.ratio,
				H: baseLch.H + D_MID.dH
			});
			const masterHex = toHex(rgb);
			return {
				dialogFont: masterHex,
				maxDot: masterHex,
				slider: mixHex(toHex(mid), "#FFFFFF", .75),
				sliderGlow: masterHex,
				gridNormal: toHex(base),
				gridBlink: toHex(soft)
			};
		}
		/** The six slots in the order the settings list renders them. */
		const SLOT_KEYS = [
			"dialogFont",
			"maxDot",
			"slider",
			"sliderGlow",
			"gridNormal",
			"gridBlink"
		];
		//#endregion
		//#region src/client/palette-store.ts
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
		/** CSS custom properties the seat's stylesheet reads, one per slot. */
		const CSS_VARS = {
			dialogFont: "--sk5-c-dialog",
			maxDot: "--sk5-c-dot",
			slider: "--sk5-c-slider",
			sliderGlow: "--sk5-c-glow",
			gridNormal: "--sk5-c-grid",
			gridBlink: "--sk5-c-blink"
		};
		/** The shipped palette, used when no configuration is served. */
		const DEFAULT_PALETTE = deriveFromMaster(DEFAULT_MASTER);
		let snapshot = {
			colors: null,
			followSeat: true
		};
		const listeners = /* @__PURE__ */ new Set();
		/** `<html>` attribute the seat's stylesheet keys the follow switch on. */
		const FOLLOW_ATTR = "data-sk5-follow-seat";
		/**
		* Publish the effective palette. `null` restores the shipped colours by
		* removing every override (the stylesheet's `var()` fallbacks then apply).
		* @param colors - resolved slots, or null for "no configuration served".
		* @param followSeat - whether the top-effort seat text takes the value colour.
		*/
		function setPalette(colors, followSeat = true) {
			const style = document.documentElement.style;
			for (const key of SLOT_KEYS) if (colors === null) style.removeProperty(CSS_VARS[key]);
			else style.setProperty(CSS_VARS[key], colors[key]);
			if (followSeat) document.documentElement.setAttribute(FOLLOW_ATTR, "");
			else document.documentElement.removeAttribute(FOLLOW_ATTR);
			snapshot = {
				colors,
				followSeat
			};
			for (const listener of listeners) listener();
		}
		/** @returns the current snapshot object (stable until the next publish). */
		function getSnapshot() {
			return snapshot;
		}
		function subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		/**
		* Subscribe the calling component to palette changes.
		* @returns resolved slots, or null while the shipped colours stand.
		*/
		function usePaletteColors() {
			return react.useSyncExternalStore(subscribe, getSnapshot, getSnapshot).colors;
		}
		/**
		* Whether the top-effort seat text follows the popover value colour. Stored
		* configuration wins; an absent field means "follow", matching the switch's
		* default.
		* @param value - the config section from the settings form, when ready.
		* @returns the switch state.
		*/
		function readFollowSeat(value) {
			if (value === null || typeof value !== "object") return true;
			return value.followSeat !== false;
		}
		/** Accept a stored colour only when it parses; otherwise "derive it". */
		function storedColor$1(value) {
			if (typeof value !== "string") return null;
			const rgb = parseHex(value);
			return rgb === null ? null : toHex(rgb);
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
		function readPaletteConfig(value) {
			if (value === null || typeof value !== "object") return null;
			const section = value;
			const derived = deriveFromMaster(storedColor$1(section.master) ?? toHex(parseHex("#679EFE")));
			if (derived === null) return null;
			if (section.mode !== "custom") return derived;
			const resolved = { ...derived };
			for (const key of SLOT_KEYS) {
				const stored = storedColor$1(section[key]);
				if (stored !== null) resolved[key] = stored;
			}
			return resolved;
		}
		//#endregion
		//#region src/client/color-section.ts
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
		const SLOT_KEYS_ORDER = [
			"dialogFont",
			"maxDot",
			"slider",
			"sliderGlow",
			"gridNormal",
			"gridBlink"
		];
		/** Presets carried over from the supplied design. */
		const PRESETS = [
			"#2F6BFF",
			"#5B8CFF",
			"#7AC0FF",
			"#35E0A1",
			"#2BD9C0",
			"#F5D061",
			"#FFB020",
			"#FF5B4A",
			"#E85C8A",
			"#9B7BFF",
			"#C9CDD8",
			"#8A90A0",
			"#3A3F4E",
			"#ECEEF3"
		];
		/** Parse a user string the way the design's field promised: #RGB, #RRGGBB, #RRGGBBAA. */
		function normalizeHex(input) {
			if (typeof input !== "string") return null;
			const rgb = parseHex(input);
			return rgb === null ? null : toHex(rgb);
		}
		function storedColor(value, fallback) {
			return normalizeHex(value) ?? fallback;
		}
		function draftFrom(value) {
			const mode = value?.mode === "custom" ? "custom" : "auto";
			const custom = {};
			for (const key of SLOT_KEYS_ORDER) custom[key] = storedColor(value?.[key], "");
			return {
				mode,
				master: storedColor(value?.master, DEFAULT_MASTER),
				custom
			};
		}
		/** An all-empty custom map: every slot follows the master. */
		function emptyCustom() {
			const custom = {};
			for (const key of SLOT_KEYS_ORDER) custom[key] = "";
			return custom;
		}
		/** Resolve a draft to the six colours the composer UI shows. */
		function resolveDraft(draft) {
			const derived = deriveFromMaster(draft.master) ?? deriveFromMaster("#679EFE");
			if (draft.mode === "auto") return derived;
			const resolved = { ...derived };
			for (const key of SLOT_KEYS_ORDER) {
				const picked = normalizeHex(draft.custom[key]);
				if (picked !== null) resolved[key] = picked;
			}
			return resolved;
		}
		function rgbToHsv(hex) {
			const rgb = parseHex(hex);
			if (rgb === null) return {
				h: 0,
				s: 0,
				v: 0
			};
			const r = rgb.r / 255;
			const g = rgb.g / 255;
			const b = rgb.b / 255;
			const max = Math.max(r, g, b);
			const d = max - Math.min(r, g, b);
			let h = 0;
			if (d !== 0) {
				if (max === r) h = (g - b) / d % 6;
				else if (max === g) h = (b - r) / d + 2;
				else h = (r - g) / d + 4;
				h *= 60;
				if (h < 0) h += 360;
			}
			return {
				h,
				s: max === 0 ? 0 : d / max * 100,
				v: max * 100
			};
		}
		function hsvToHex(h, s, v) {
			const c = v / 100 * (s / 100);
			const x = c * (1 - Math.abs(h / 60 % 2 - 1));
			const m = v / 100 - c;
			let r = 0;
			let g = 0;
			let b = 0;
			if (h < 60) {
				r = c;
				g = x;
			} else if (h < 120) {
				r = x;
				g = c;
			} else if (h < 180) {
				g = c;
				b = x;
			} else if (h < 240) {
				g = x;
				b = c;
			} else if (h < 300) {
				r = x;
				b = c;
			} else {
				r = c;
				b = x;
			}
			return toHex({
				r: (r + m) * 255,
				g: (g + m) * 255,
				b: (b + m) * 255
			});
		}
		/**
		* Hue stops just short of 360: hsl(360) is the same red as hsl(0), and the
		* round trip through RGB would report hue 0 again, snapping the thumb from
		* the far right to the far left. Keeping the top of the range at 359.9 keeps
		* both ends stable.
		*/
		const HUE_MAX = 359.9;
		function clamp(value, min, max) {
			return Math.min(max, Math.max(min, value));
		}
		/** Small stroke icon; the settings page supplies no icon set to plugins. */
		function icon(path) {
			return react.createElement("svg", {
				viewBox: "0 0 24 24",
				width: 15,
				height: 15,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true
			}, react.createElement("path", { d: path }));
		}
		const ICON_PALETTE = "M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H13a1.5 1.5 0 0 1 0-3h1.5A5.5 5.5 0 0 0 20 9.5C20 5.9 16.4 3 12 3Zm-4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2.5 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z";
		const ICON_LIST = "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01";
		const ICON_DROP = "M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z";
		/**
		* Render the colour switcher section.
		* @param props - the settings form for this plugin's namespace and a translator.
		* @returns the section element.
		*/
		function ColorSection({ form, t }) {
			const snapshot = react.useSyncExternalStore(react.useCallback((listener) => form.subscribe(listener), [form]), react.useCallback(() => form.getSnapshot(), [form]), react.useCallback(() => form.getSnapshot(), [form]));
			const ready = snapshot.status === "ready";
			const [draft, setDraft] = react.useState(() => draftFrom(snapshot.value));
			const [target, setTarget] = react.useState("dialogFont");
			const [text, setText] = react.useState("");
			const [error, setError] = react.useState(null);
			const [saved, setSaved] = react.useState(false);
			const [busy, setBusy] = react.useState(false);
			/** Seat-follow switch; mirrors the stored value and updates optimistically. */
			const [followSeat, setFollowSeat] = react.useState(() => snapshot.value?.followSeat !== false);
			const hueRef = react.useRef(null);
			const svRef = react.useRef(null);
			/**
			* Hue as picked, kept across the 8-bit colour round trip. Near 360°, a hex
			* quantises to pure red, whose hue reads back as 0 — deriving the thumb from
			* the hex alone would therefore snap it from the far right to the far left.
			*/
			const hueLock = react.useRef(null);
			const draftRef = react.useRef(draft);
			draftRef.current = draft;
			react.useEffect(() => {
				if (!ready) return;
				hueLock.current = null;
				setDraft(draftFrom(snapshot.value));
				setFollowSeat(snapshot.value?.followSeat !== false);
				setError(null);
				setSaved(false);
			}, [ready, snapshot.revision]);
			react.useEffect(() => {
				setPalette(resolveDraft(draft), followSeat);
			}, [draft, followSeat]);
			const savedRef = react.useRef(snapshot.value);
			savedRef.current = snapshot.value;
			react.useEffect(() => () => {
				const value = savedRef.current;
				setPalette(readPaletteConfig(value), readFollowSeat(value));
			}, []);
			const colors = resolveDraft(draft);
			const activeKey = draft.mode === "auto" ? null : target;
			const activeHex = activeKey === null ? draft.master : colors[activeKey];
			const hsv = rgbToHsv(activeHex);
			/** Hue shown on the track: the picked one while dragging, else the colour's own. */
			const hue = hueLock.current ?? hsv.h;
			react.useEffect(() => {
				setText(activeHex);
				setError(null);
			}, [activeHex]);
			/** `keepHue` keeps a hue that a dragged colour cannot represent exactly. */
			const setActive = (hex, keepHue = false) => {
				const normalized = normalizeHex(hex);
				if (normalized === null) return;
				if (!keepHue) hueLock.current = null;
				setSaved(false);
				setDraft((current) => {
					if (current.mode === "auto") return {
						...current,
						master: normalized
					};
					const custom = {
						...current.custom,
						[target]: normalized
					};
					return {
						...current,
						custom
					};
				});
			};
			const pickFromHue = (clientX) => {
				const rect = hueRef.current?.getBoundingClientRect();
				if (rect === void 0 || rect.width === 0) return;
				const h = clamp((clientX - rect.left) / rect.width * 360, 0, HUE_MAX);
				hueLock.current = h;
				setActive(hsvToHex(h, hsv.s === 0 ? 100 : hsv.s, hsv.v === 0 ? 100 : hsv.v), true);
			};
			const pickFromSv = (clientX, clientY) => {
				const rect = svRef.current?.getBoundingClientRect();
				if (rect === void 0 || rect.width === 0 || rect.height === 0) return;
				const s = clamp((clientX - rect.left) / rect.width * 100, 0, 100);
				const v = clamp(100 - (clientY - rect.top) / rect.height * 100, 0, 100);
				setActive(hsvToHex(hue, s, v), true);
			};
			const drag = (handler) => (event) => {
				if (event.button !== void 0 && event.button !== 0) return;
				event.preventDefault();
				handler(event.clientX, event.clientY);
				const move = (e) => handler(e.clientX, e.clientY);
				const up = () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					window.removeEventListener("pointercancel", up);
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				window.addEventListener("pointercancel", up);
			};
			const apply = async () => {
				if (busy) return;
				setBusy(true);
				setError(null);
				try {
					const fields = [["mode", draft.mode], ["master", draft.master]];
					if (draft.mode === "custom") for (const key of SLOT_KEYS_ORDER) fields.push([key, normalizeHex(draft.custom[key]) ?? ""]);
					for (const [field, value] of fields) if (!await form.set(field, value)) {
						setError(t("color.saveFailed"));
						return;
					}
					setSaved(true);
					setPalette(resolveDraft(draftRef.current), followSeat);
				} catch (error) {
					setError(error?.message ?? String(error));
				} finally {
					setBusy(false);
				}
			};
			/** Restore the shipped palette immediately and persist it. */
			const reset = async () => {
				if (busy) return;
				const next = {
					mode: "auto",
					master: DEFAULT_MASTER,
					custom: emptyCustom()
				};
				hueLock.current = null;
				setDraft(next);
				setSaved(false);
				setBusy(true);
				setError(null);
				setPalette(resolveDraft(next), followSeat);
				try {
					const fields = [["mode", "auto"], ["master", DEFAULT_MASTER]];
					for (const key of SLOT_KEYS_ORDER) fields.push([key, ""]);
					for (const [field, value] of fields) if (!await form.set(field, value)) {
						setError(t("color.saveFailed"));
						return;
					}
					setSaved(true);
				} catch (error) {
					setError(error?.message ?? String(error));
				} finally {
					setBusy(false);
				}
			};
			/** Toggle whether the seat's top-effort label takes the value colour. */
			const toggleFollowSeat = async () => {
				const next = !followSeat;
				setFollowSeat(next);
				setPalette(resolveDraft(draftRef.current), next);
				try {
					if (!await form.set("followSeat", next)) {
						setFollowSeat(!next);
						setPalette(resolveDraft(draftRef.current), !next);
						setError(t("color.saveFailed"));
					}
				} catch (error) {
					setFollowSeat(!next);
					setPalette(resolveDraft(draftRef.current), !next);
					setError(error?.message ?? String(error));
				}
			};
			const modeOption = (mode) => react.createElement("label", {
				key: mode,
				className: "sk5c-mode" + (draft.mode === mode ? " is-on" : "")
			}, react.createElement("input", {
				type: "radio",
				name: "sk5c-mode",
				checked: draft.mode === mode,
				onChange: () => {
					hueLock.current = null;
					setSaved(false);
					setDraft((current) => ({
						...current,
						mode
					}));
				}
			}), react.createElement("svg", {
				className: "sk5c-dot",
				viewBox: "0 0 14 14",
				width: 14,
				height: 14,
				"aria-hidden": true
			}, react.createElement("circle", {
				cx: 7,
				cy: 7,
				r: 6.5,
				fill: "none",
				stroke: "var(--sk5c-input)",
				strokeWidth: 1
			}), draft.mode === mode ? react.createElement("circle", {
				cx: 7,
				cy: 7,
				r: 3.5,
				fill: "var(--sk5c-primary)"
			}) : null), react.createElement("span", null, react.createElement("span", { className: "sk5c-mode-title" }, t("color.mode." + mode)), react.createElement("span", { className: "sk5c-mode-desc" }, t("color.mode." + mode + ".desc"))));
			const row = (key) => {
				const auto = draft.mode === "auto";
				const selected = !auto && target === key;
				const value = colors[key];
				return react.createElement("li", { key }, react.createElement("button", {
					type: "button",
					className: "sk5c-row" + (selected ? " is-selected" : "") + (auto ? " is-auto" : ""),
					disabled: auto,
					"aria-pressed": selected,
					onClick: () => {
						if (!auto) {
							hueLock.current = null;
							setTarget(key);
						}
					}
				}, react.createElement("span", { className: "sk5c-row-text" }, react.createElement("span", { className: "sk5c-row-name" }, t("color.slot." + key), react.createElement("span", { className: "sk5c-auto" }, t("color.auto"))), react.createElement("span", { className: "sk5c-hex" }, value)), react.createElement("span", {
					className: "sk5c-chip",
					style: { background: value }
				})));
			};
			return react.createElement("div", { className: "sk5c" }, react.createElement("header", { className: "sk5c-header" }, react.createElement("span", { className: "sk5c-badge-icon" }, icon(ICON_PALETTE)), react.createElement("span", null, react.createElement("h3", { className: "sk5c-title" }, t("color.title")), react.createElement("p", { className: "sk5c-subtitle" }, t("color.subtitle")))), react.createElement("div", { className: "sk5c-panel" }, react.createElement("div", { className: "sk5c-col" }, react.createElement("section", { className: "sk5c-section" }, react.createElement("div", { className: "sk5c-head" }, react.createElement("h4", null, t("color.mode"))), react.createElement("div", { className: "sk5c-modes" }, modeOption("auto"), modeOption("custom"))), react.createElement("section", { className: "sk5c-section" }, react.createElement("div", { className: "sk5c-head" }, icon(ICON_LIST), react.createElement("h4", null, t("color.items")), react.createElement("span", { className: "sk5c-hint" }, t("color.items.hint"))), react.createElement("ul", { className: "sk5c-list" }, SLOT_KEYS_ORDER.map(row)))), react.createElement("section", { className: "sk5c-section sk5c-palette" }, react.createElement("div", { className: "sk5c-head" }, icon(ICON_DROP), react.createElement("h4", null, t("color.palette")), react.createElement("span", { className: "sk5c-hint" }, t("color.palette.hint"))), draft.mode === "auto" ? react.createElement("div", { className: "sk5c-master" }, react.createElement("span", null, react.createElement("span", { className: "sk5c-row-name" }, t("color.master")), react.createElement("span", { className: "sk5c-hex" }, draft.master)), react.createElement("span", {
				className: "sk5c-chip",
				style: { background: draft.master }
			})) : react.createElement("p", { className: "sk5c-target" }, t("color.target"), react.createElement("strong", null, t("color.slot." + target))), react.createElement("div", { className: "sk5c-presets" }, PRESETS.map((preset) => react.createElement("button", {
				key: preset,
				type: "button",
				className: "sk5c-preset" + (preset === normalizeHex(activeHex) ? " is-active" : ""),
				style: { background: preset },
				title: preset,
				"aria-label": preset,
				onClick: () => setActive(preset)
			}))), react.createElement("div", { className: "sk5c-picker" }, react.createElement("div", { className: "sk5c-picker-block" }, react.createElement("div", {
				className: "sk5c-hue",
				ref: hueRef,
				role: "slider",
				tabIndex: 0,
				"aria-label": t("color.hue"),
				"aria-valuemin": 0,
				"aria-valuemax": 360,
				"aria-valuenow": Math.round(hue),
				onPointerDown: drag(pickFromHue),
				onKeyDown: (event) => {
					const step = event.shiftKey ? 1 : 5;
					let next;
					if (event.key === "ArrowLeft") next = clamp(hue - step, 0, HUE_MAX);
					else if (event.key === "ArrowRight") next = clamp(hue + step, 0, HUE_MAX);
					else return;
					event.preventDefault();
					hueLock.current = next;
					setActive(hsvToHex(next, hsv.s, hsv.v), true);
				}
			}, react.createElement("svg", {
				className: "sk5c-hue-thumb",
				viewBox: "0 0 20 20",
				width: 20,
				height: 20,
				"aria-hidden": true,
				style: { left: hue / 360 * 100 + "%" }
			}, react.createElement("circle", {
				cx: 10,
				cy: 10,
				r: 9.5,
				fill: "none",
				stroke: "rgba(0,0,0,.45)",
				strokeWidth: 1
			}), react.createElement("circle", {
				cx: 10,
				cy: 10,
				r: 8.5,
				fill: `hsl(${hue} 100% 50%)`,
				stroke: "rgba(255,255,255,.92)",
				strokeWidth: 2
			})))), react.createElement("div", { className: "sk5c-picker-block" }, react.createElement("div", {
				className: "sk5c-sv",
				ref: svRef,
				role: "slider",
				tabIndex: 0,
				"aria-label": t("color.sv"),
				style: { backgroundColor: `hsl(${hue} 100% 50%)` },
				onPointerDown: drag((x, y) => pickFromSv(x, y)),
				onKeyDown: (event) => {
					const step = event.shiftKey ? 1 : 5;
					if (event.key === "ArrowLeft") setActive(hsvToHex(hue, clamp(hsv.s - step, 0, 100), hsv.v), true);
					else if (event.key === "ArrowRight") setActive(hsvToHex(hue, clamp(hsv.s + step, 0, 100), hsv.v), true);
					else if (event.key === "ArrowUp") setActive(hsvToHex(hue, hsv.s, clamp(hsv.v + step, 0, 100)), true);
					else if (event.key === "ArrowDown") setActive(hsvToHex(hue, hsv.s, clamp(hsv.v - step, 0, 100)), true);
					else return;
					event.preventDefault();
				}
			}, react.createElement("svg", {
				className: "sk5c-sv-thumb",
				viewBox: "0 0 20 20",
				width: 18,
				height: 18,
				"aria-hidden": true,
				style: {
					left: hsv.s + "%",
					top: 100 - hsv.v + "%"
				}
			}, react.createElement("circle", {
				cx: 10,
				cy: 10,
				r: 9.5,
				fill: "none",
				stroke: "rgba(0,0,0,.45)",
				strokeWidth: 1
			}), react.createElement("circle", {
				cx: 10,
				cy: 10,
				r: 8.5,
				fill: activeHex,
				stroke: "rgba(255,255,255,.92)",
				strokeWidth: 2
			}))))), react.createElement("div", { className: "sk5c-switch-row" }, react.createElement("span", { className: "sk5c-switch-text" }, t("color.followSeat")), react.createElement("button", {
				type: "button",
				role: "switch",
				"aria-checked": followSeat,
				className: "sk5c-switch" + (followSeat ? " is-on" : ""),
				onClick: () => void toggleFollowSeat()
			}, react.createElement("span", {
				className: "sk5c-switch-knob",
				"aria-hidden": true
			}))), react.createElement("div", { className: "sk5c-code" }, react.createElement("label", {
				className: "sk5c-label",
				htmlFor: "sk5c-code-input"
			}, t("color.code")), react.createElement("div", { className: "sk5c-code-row" }, react.createElement("input", {
				id: "sk5c-code-input",
				className: "sk5c-input" + (error === null ? "" : " is-error"),
				value: text,
				spellCheck: false,
				onChange: (event) => {
					setText(event.target.value);
					const normalized = normalizeHex(event.target.value);
					if (normalized === null) setError(t("color.invalid"));
					else {
						setError(null);
						setActive(normalized);
					}
				},
				onKeyDown: (event) => {
					if (event.key === "Enter" && normalizeHex(text) !== null) apply();
				}
			}), react.createElement("button", {
				type: "button",
				className: "sk5c-apply",
				disabled: busy || error !== null,
				onClick: () => void apply()
			}, busy ? t("color.saving") : t("color.apply")))), react.createElement("div", { className: "sk5c-actions" }, react.createElement("button", {
				type: "button",
				className: "sk5c-reset",
				disabled: busy,
				onClick: () => void reset()
			}, t("color.reset"))), error !== null ? react.createElement("p", { className: "sk5c-note is-error" }, error) : saved ? react.createElement("p", { className: "sk5c-note" }, t("color.saved")) : react.createElement("p", { className: "sk5c-note" }, t("color.previewHint")))));
		}
		//#endregion
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
		* Required Browser Services, exported as the Client Loader's declaration site.
		*
		* The Client Loader creates this package's entry from the module table and the
		* fiber's dependencies come from THIS export — `dsh.client.inject` in
		* package.json only orders bundle arrival. Without the export the fiber injects
		* nothing, every `ctx.<service>` below stays undefined, and the shell reports
		* the package as "is waiting for activation".
		*
		* Same six names the first-party `@deepseek-ai/dsh-client-ui-model-selection`
		* declares; `modelDirectories` is the Service that plugin provides.
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
				"help.text": "调节模型推理深度，低强度回复快、内容简洁；高强度思考更全面，适合复杂问题，响应会稍慢。",
				"color.title": "颜色切换器",
				"color.subtitle": "逐项配置界面元素配色；调整即时预览，点击应用后写入插件配置。",
				"color.mode": "配色方式",
				"color.mode.auto": "按主色自动配色",
				"color.mode.auto.desc": "由主色统一派生六项颜色",
				"color.mode.custom": "逐项自定义配色",
				"color.mode.custom.desc": "六项颜色分别独立调整",
				"color.items": "逐项配色",
				"color.items.hint": "点击行选择目标",
				"color.palette": "调色盘",
				"color.palette.hint": "点击色块即预览",
				"color.master": "主色",
				"color.target": "当前应用到：",
				"color.auto": "自动",
				"color.code": "色码（支持 #RGB、#RRGGBB、#RRGGBBAA）",
				"color.apply": "应用",
				"color.reset": "重置颜色",
				"color.followSeat": "最高思考强度文字跟随档位值颜色",
				"color.saving": "保存中…",
				"color.saved": "已保存",
				"color.previewHint": "调整即时预览，应用后写入插件配置",
				"color.invalid": "格式无效，请使用 #RGB、#RRGGBB 或 #RRGGBBAA",
				"color.saveFailed": "保存失败，请重试",
				"color.hue": "色相",
				"color.sv": "饱和度与明度",
				"color.slot.dialogFont": "弹层档位值",
				"color.slot.maxDot": "档位圆点",
				"color.slot.slider": "滑块把手",
				"color.slot.sliderGlow": "滑块外发光",
				"color.slot.gridNormal": "点阵底色",
				"color.slot.gridBlink": "点阵闪烁"
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
				"help.text": "Adjusts how deeply the model reasons: lower effort answers faster and more concisely, while higher effort thinks more thoroughly for complex problems and responds a little slower.",
				"color.title": "Colours",
				"color.subtitle": "Tune each accent of the composer UI; edits preview immediately and are saved when you apply.",
				"color.mode": "Palette mode",
				"color.mode.auto": "Derive from one main colour",
				"color.mode.auto.desc": "One main colour produces all six slots",
				"color.mode.custom": "Customise each slot",
				"color.mode.custom.desc": "Adjust the six colours independently",
				"color.items": "Slots",
				"color.items.hint": "Click a row to edit it",
				"color.palette": "Palette",
				"color.palette.hint": "Click a swatch to preview",
				"color.master": "Main colour",
				"color.target": "Editing:",
				"color.auto": "auto",
				"color.code": "Colour code (#RGB, #RRGGBB or #RRGGBBAA)",
				"color.apply": "Apply",
				"color.reset": "Reset colours",
				"color.followSeat": "Top-effort text follows the effort-value colour",
				"color.saving": "Saving…",
				"color.saved": "Saved",
				"color.previewHint": "Edits preview live and are written to the plugin configuration when applied",
				"color.invalid": "Invalid format: use #RGB, #RRGGBB or #RRGGBBAA",
				"color.saveFailed": "Could not save, please retry",
				"color.hue": "Hue",
				"color.sv": "Saturation and brightness",
				"color.slot.dialogFont": "Effort value",
				"color.slot.maxDot": "Effort dot",
				"color.slot.slider": "Slider handle",
				"color.slot.sliderGlow": "Slider glow",
				"color.slot.gridNormal": "Dot matrix",
				"color.slot.gridBlink": "Matrix flash"
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
		const CSS = "@font-face{font-family:\"Space Grotesk\";font-style:normal;font-display:swap;font-weight:300 700;src:url(data:font/woff2;base64,d09GMgABAAAAAFcQABQAAAAAzrwAAFagAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoMkG/p0HIlOP0hWQVKDKQZgP1NUQVRYJx4AhFovRBEICoGBMOZ3C4RIADDoWAE2AiQDiQwEIAWEbgeLCgwHG969N1C9ds4vQm9WFed8bvrxZyNqt+M7lhAPFHBj6IaNA4AmGZH9//9nJMghIwn6R7Bt9d22IAqpoBI7iIr2hQzbEEyP1hG+DDEsRbZ6qHFCVQUIyJxRmxGz0jGjEKqEjEBHcdLg8OSUCldUPu8UbeWAT9/KcjzRGd+RVbwJQoKQIJ3grGvPn2fr+w7Z8v21uOOvt65Ydgop8/AVJDuIlfzfT9LmAJb3DKd/B5zCx81oHuXIlREEiJUppXXyhSzdn+vVndgO39KdQgrnjfR2LLQO3znnrQJjl8eIqFgn2pfnn/xldu6rljSAbAK1xsj0vSEwRg4XTNliRkBlEc05+/exj2AhQMTRBpNCwGtOqZg7oTRQFaBuDM9vs4fB8PP/tjMSkSmKCFISn09IRNmoGCigs+byXOUtXcW5aM+tZbul7iq3q/Jqt6vtIqd/N/s/EVGScBIgWJBSSinLtvvM5ffeSaDP7Mv9S8xWTLvefdvuUhj+3fT/4IVtd2sn1jE1Nr/39pl++X6f6KfJV1n33K5qrxulGZVRTAKEOMlJchKSEEJIiNrv2ey9r6ZkS4KpGorCz8HQbFEsIi5B23xRMFseDcIYi8OYFupKyOeHa58zgcK8pExGolGBz3hnW97Y/bYE7lSBleqULa3m6emZBZZ4JftYZy6fDiGNvtyroyj59KMPDxCMknlHu0PQsMgmTjIoJQlFdaJygf/3d6G+e27y26dgNqN5ErNpmhCFCtTNfV8uFWFpl9YGFVKlElIzS29quwL4hxuwc0Jgi4lXKJCPrBITqwUGHn5u7cG8jpRsQTAvLK34wSL036992r3bS3LPQoBHBXBqvZm84PsnYfUyKoBTUYDCgFCJk8CjgizklzEmwvv8valp+x9A6JaCA6C467hQXDjCqRfh2FKuXDsX3d+/C+5+LBZY4NICIHUgSFrLA08GwJMEkgpYgncD4s4zpORwyTHTKX/yEuiIk5wC5RhjUblTU7osQyydi662T+3Xqmi/iEdKvdBuqIROvXl/h/2oyLK7t4uYhswQQqUWk/Qj4slC5d6517a9ZJAhyk9TrlI2d/dffiEDRMUKqG9uwgEKPTk5P6EJHn//Tm+CxdUZcSGPYoycftZ3w/rmxX/vFjqUUgYRcUOQEIKIuMdx+1uvxuv49r9z2nUcIiLykvQYU/+LZryx7fJbmxpDCDUHIhI8ESm1+QsqYs6dPcHSLjxqCkiPhrqVA95kQ8yXpfUhFMxYsASyDnKsdFKt+ehIOcVorRSRyufy0islSpUlHeGxnGbH8SdG9QhHddl/nsnjm4uwbHB7/0qexVg1TCUAT4oIvBFf/oiWFtGzInaBSAgHEikGiROHJEhEeorBmWEG8lc4Bd9iipqi+x7oscflpTJHH33SV9/yDxH5lUkk+e0PFnUFLgHJpUQIXJUUChTpyJPkhgiJQGHh8tc7zFMZEPjOdwmKZvmeICqGkqygKE7SLC/Kqm6UNhaimFDmvJDte3Hb94fX7jvIw6gQ15JGZ74Li/vGb45jKYCAOULUlnDiyWdeaPqd1z14t+l4oHsaCA6746b77/apn4Lcu+74Xiu9SHYv7R3aRFdvkhLz7DcguF7bbF/wwKg58OWs/KkwD1rgyBt7Q9dwd0X2Tve1S4VNdeT+qtxBg7SiBo7866GpUrrRHPuBovf4pa7Uhr2/7Csg4s5pHUOK9OgLBs/BJ+H98Gp4BTwKd8ONcDmcu/0n9x/4/72GFI36tiYJ7SiFsGZpqoY2VqO23Daz4Rm4v9dP9V19Wu/Wy0C9WJfrDNSHa1dtrBW1oHqqverLU7bSFFYbiwO1o0iVWgT6n0f5Mu9Dvp6JxDMG+Xj2Qd6cY1kDGfJl9mUgkTQlEFs0wVIWSjIDAym89cwd+eAL4LmssRU0gzO1z5KZkEQDM7XP4MxLJeZJpggz5wIyQMvOih90CrSIgX0+Dpp/mRovm2ECVm16hScBHDMAJ+zQEpmpfaRLPGCZn6l9amdQwBIMM2MALRGZOoKA/h6LCDAH0AZo7tS6Q18cH8PiDeNfgxYRvYLx85iBwMyjgOZWpsYT41NYEmD6OdCSkKnpE+MdWPbCgf8GzUBgzwdBiwbGbwYt8bD3raAZOPE9y0BLzUxNx8Yvl5gkmH4raInOlJjxkyXGCdPfBi0JsOd2I2FPcFxLmfx7lqajHQaXjGdSPd5NJV3Fp/+5nBAB03+We+83+h78412opn/mUSgY9hxpJ0HIbSkDOHBHkcb63tdL6TBT6omAhH5RHFn9olNg9R6itoj3BLL76VPo9Hr0oRvPkTT4qePtQ6iffl3fzTpRUx+JV3KRe+NjXwnDrrgrOQGgr0m9dsRIsJWO5yTEhW9SmZ+gXjCr6bk43qyL1vWoP73/Ekfpn/xQdk+0t0TbDNDoBMmECLMoNocvEIokMrlCpda84L44E1MzcwtrG1s7h9O7Zs7sab0fflGCz4IPg3eC1yMTwZOA+wG3Aq4GXAg4HXAs4HDMg4qPHYDGnanDg4dDwBTiFaJCYczs8Wixf9oEi4PkhQ20wn/Qx2ibcDh14fzxvYHD1+g3HP8uIVwJshb+rnfDP52NOp1v54eHjSHKF0itH9/+HMGR4vb5KwG344dygN2/3PmHBBHWe+/iYbvS3r3DbuwZPp1Q99lmTc/3/uF4Fw7n8PcYZ/oBH0ZnNmdQftwZh93V2eld9edkdv5CAYcHND/rEXLV6zO04l25rVkfJ1Dn83z54tXeStP6MzM6fnJPIxCEvZZDYqMkklwxeMh9MdcO2wPAuucz46lIQ/FGjDUlCv1pS3Opfl25YLVjh55PNdH+7o+eDK+RzzJ+nBlYGfqqO9McDaiqyXsFf7nTWd1nTQjdfFm7x9DsiF0dX9tO5Nv9kXGHP//Ix3XE6pwme8pKmIw1enbYW9C5Ujnu2jpdGnJ5m6PpLTGabCXLHDHiX3or/GVPNlrMgC/LeC3nkOilC1WKCnfFtKPP+lPCJZ5KJhql09u08Pn9h3fHv+vttgaNUOX/7PNm2qcTh+v+YpDn8tgXya42f+B94evOxt3/p1jq5r3orFWE3ykj30dKLy9v7uFt6Sc98q5yH2jn2j6vHh6lustfi+fjrmutzH86X7dysbnN5dkrR7Kpnf7Gt+VZXTfqfcDwfRD5rJjBu9JHTmEsKp0QSRnSit3s4PkAcdvj8D2ShKzJqpxmR14IyY/XP/g/O+TA8dR3c5NH8IfBZ8bf/tKoraGFsrWFU9yRaI60CrvLcvYfNs2vPCbV2cw9XifrLOPrj6LOyPRQc9G7Z1vZ8f8AzfrnA5cj9x86jLvv3YZ8izkicIjKKMjeqgth0/sHnomPg9LT3u4uSPHMhncPUntfKPKP1djVy0/XpMT/fR/VpH8BHZhPAJRglPwXgkeT5n9q7T+KMfOR8XTvzUi78uU3E/PJOOLOkEJu4bSl964yzufnwB/CtgYtRMWnYeUOqWG7+rXyD1wQ+/7lLpM2WiqqVS3Kz0v6RpzYkDzAuiPsR/WzXvrg1QOplBIc40EqQSgJ1zAT3Ryva4mJT4vQb8yu3sKiB0EusKMwxttTntn8glhNyVjlS2WRkFyugsVm4Zu2GZ3HR/v2bGYwEuKVMpyANuZgLDmPm/JrxPiPHGbVhnWwKoRd/0UKmfGMAzF0J4kguJdIRXy0Cx/v8AmoWbw8WxkfKEBVC0hmr3QwYh09PrCWa7t1Hy29ODZvgZwIrIJVD7/xkRiwhxJrnslcwGdzH2i9Y8IDm9Sz2ducfabSXKex0RivHMM8NdiNJLRBe1CEpSv4JI4/jU5iV2L4xYeNDKPrq9azplhJO4/VSsym49rZLIhzrm/tWPmSszHZxXvyq3xrpTphh2WO8/79RbfzzUM/i+40YNlvbccKw/s/q9H3uf+mQJN3AKkfmkeGRh4kt0BrETQv8IgUns9pQ1fX1qyFHmLn674hspL1vJgjoNlRr3lUZmzokv8PAiV3WyvV04/bS3NrP5CnyA87/y+Zcbc0Sd8las4OWQPpGCW34fR/HsZpbHzB+5h3eTPq18sccRAHiMmyiL2knqqlx3fzuxv0yyPike/H8/h4fne1K9YUnZA5GmUvQmzAMqNa9VQ/NCn+jxWRzp/IDy8BJQmT+iw/7f8vRYtnA9uFM4sULVSseA6JkkRKloUrhwamJi+JxgK0GjTSadfHaI7l8qy0SgdHbTLSq1xGeZvbGMWKjXXPPeM89dR4L5WZ4Lvvpvrpp2nKQQevDkJKzEhqUs1MQQrMAnMH4JABmDUACwfgsAHYdwCmBmDPAGwagJUDcOwOnLQDx+3AxADsHYAlAzAzAOMBOGIA1g9Q6kvCExMR7dLoNJoOnU4nSR2EBByODo+nIxBAoZAnEgGx2FwiEUqlFjIZJZeLFAo9pZKh0mjr65MGBtqGhgwjY6aJKcPMnLCw0La0JKystK2tCRsbZGtL2tnp2ttjBweJo6Olk5Ous7PUxUXl6mrk5mbm7m7q4WHg5WXi7W3s46Pv62uIO2ZTK1SJVqGanFLV55WjsYAcrTTK0FkMXi9dEgwyaIahhnDGGI83wQSeJplBZKZ5yHwLyC20iJfFFpNaYhWyxkaslZAhoMEbb/RF8I5W3zL4LrkfkvopuV+SKp/enISjMM4YJnw7H5yGo4ZhRlOIVMSTKZpQ9yenIKZUAJWCeIRn5UXMW8RHMdQivvKikcBPWv7iBCiWVgY6xdFLxbDfbzayBcnYFCrQ0nkIScO9dqFTkWYAH+TWDx9FmFKIRKklySZZUVIUyakKUhUmTRHSFS5DpTLFlCWanNtpY4cMOfLORyXqiZNCydSbczh99OmOSSiIIVLHG+ppOKPNTwVcqGJ6mgck4x45XyThkoz77gEzEJaGeqhXSkiUSqbMkmDJJFgSvH34WNG9ui8KcCKg98xH9g9pc6Z81lXn/Cvr/5H1Usw2yQ1D5u3suam6UxtP1Kb0SZag/AXBKmnE2wvP79XZ3K82FqrfpbgjdLP+4eT6T72o1KNrx+3M5x1z3+u5B3m4ekCsXUjXVqOOMctQikI9U5ya2ZCAWVuEwzY8f2Fx3ggv+wfTSGSYRDwRCRklD958qL8s3AG3DTIxh20+SPD+cETs35IkTQYlFQ0tHQMzFzcPr4AGQY3ahXXoFBHVbcCgeeZbYKFFnrbYWOOMN8FEk0w2xVTTTDfDTLPMNsdc86Yj3Xz7YksstcxyK6y0ymqbHJDvpkK3uD37tqffVeaN9777GUCN5KQi72SFFApy4N8iBasHSU/9dBqRoC7MPiJ4J3RJ1TJTXQ2ps8ckbZi2VrYuyEtn9k51v7BnpzYQPO0bqIle97O67bv/C9KUu/9fmoTyI4LK7zCykLlhXt/cpCnoBQcMMJetS1OFolGP7fRslrguOx92gZe8ooRSyl5VrIryiRfV4D4NaaaMQyc5eEfp1p2iBIETX+3F0X92Ib6jidf59YqecjoEa2DivXSd1BmpN7WV3wnNtYvcZacr3ehOD3p6QkULLLLwYmIUc5aUAcTDKWEQjy6cwnp7VqagkZ3rTZ40H/wW8Hf+OYjskVPfqcb1pL1LpUDg0pat4O/BVPQQGlvzxomdp0hgW5kvXbWvU58Hrl0jzwDPPkb+AgS2TyGAViIOQQiiSwsWo7oQlR0bB4vPZQ5H4NKo7h0ui+ZLTIfUYzszQRHXVSdk7mXvocQwhjOCkYxitMe481gwjvGe4JGVngymMJVpTGeGZ4JZng3mMJd5LGEpy1jOClayymva8FqwjvVsYKPze2AX7B6AX0a/IkoopayCgwex9s0OxHd9YgVlL6eQHza6KOB0wdjRJGcoUyPyDmDFXoIofQfDDoxGpKGc3Io667lLoCvd6E4PenqSgSeDKUxlGtOZ4ZlglmeDOcxlnud78QJooQYs8hLGS8EylrOClayyuwf+Xu2fdCscPsB5kj5Es3eS5SMq4VJlF/KYd7Qab6LpdhtjhLaFuRv1D8sJq20l7BsHM7Z1HI6AoxhH48Ex3a1RsVB7xa3SPKfMSfYvmunt0W+Suz1BgLMTI9J87M5xl54iPY90Brdxu+8Ad3IXd/se7x4KhjGcEYxkFKM9yaMngylMZRrTmeGZjXkWmM0c5jJv44XC841FXpJ5KVjGclawklVe0w+vBetYzwY2Ot/eLtg9Kr+MfkWUUEpZBUcNWBPz0gu6QtY/71Uwv+xxlW7tLW4GLFC1qppYsDOPZWKovE0hJvtms3VCkuj+oyLL33HxkleUUEpZge0HN834cOd5mpkyrjnXBsknIOFtj9elcgrMEmLFYPJV61TpduzQO26HgtwNKr+CvaxcgJ36S2vQSqJOoYItg/3LuWIxDy+laDXrGMz2juBlzVesa3m1fUz7RFbe9Fov4lA3Nq6veT3paiyVC3dezgnisfgMz85n45smWVBajIXMHFa3IQjsYxVHtuy3x/6pedvDkJlQbB0kPxpHWWaE3YsxSLIwq5lA/SZz8OUfl0v5QC1Vba2qIUFX5jf9lRlSMG2GKd7ng+scxCMZVLErPZbmKuaIvlyzjhC7yyp8oG89Tfe8l1/nLRaQFW23StbX83PllET126YBuTSksVvxbg3auLOGu4CudKM7PegZE9q5Sa1oYbMzryI2xMY69dutj16eQt88ZmOJJxx34SaQdT3zRHjHheef8e2mge6ZBQrDk5CSEQo3XHxK0dFTSL0Z4GHpic1HbFyj3WBRWDAU64qCwf9/ALoHxCLhtkbQHulqjoCmE7U3+GL90R7g6F4fA6Y+bEyHNIBQ44MCMQKS8N3fvr0zpaF05ec1jVKPvjVaw89fUvLiVGE+zK0Mpy/Bctxf7+n2myvCt2kbhlwJ1ASEjxonmkSSKCGs9DQ8uXBCleEEy8cJ8hLHphRjE6rkmAn2arsD5WgM/X/HxUiIJUlkSLYP3mYGKfA8OHaK9pfIIOOUSSxdmhTJkhDBc299CI54Ukyt9U9+ZnWkZr0elRKXg2Vv7OSM+GaCp157p9yHkkBK0iQvBaIIa+Dz9i6OP3tXQns3InZDUG+WF+uRN1f1jpzPLKYkkC6Z3nkdhAxblDf3Q445iaRPlvfeZDrJ8SwAhSTJBGSVAo7bTzZxlIJvfCHN/o5hbp4o9+0ZyHiDZy3o11wjyUCadeo+uzrUjjjSwmx7FENrNSUwy20f3xnaHQo6lKcMek7fiRV54JNv/iTXzKcHu3nPcX4Cu5iXxxiEkbuyXpNqyq5++MWoH0p50Qvc99FXv5NDDEbaMhBSzYivo1nPzFMN4FYraD8QYVSUQJovzYwvw/kMYzgWqAHyuJiyOvbGZU9GCUFA+Ah71y2zfkRNRrzd7WlqbHk5T+zl0rm9RG+EkRc5cgon82HN8hSuR/U0r9NZ6CieoihtQ/OL5MQ3oiVpM3ahgKfz80tL7Wqz1WoOd0iHOxTDHfLh8nK2/JxptloYxk9sS7no2eAkCOueCGf9YdRtwsvUPAFwaxSc83vKkcgF/5ui2Rb6VELxE6n8QGoL/pijp6cOKntJXOxLdDuO03jM7KXDnmzc/KUKMnxJnSQPR3n/kjFaWIOnhKjj96x30XDkOG09VbGynkvxoGdhR3dp1xXOHMuidC34BkLBM+W+kzX5vWefzX/5pTZBc/wP+pDTNvMbs31DrhwvgGEpPfFmu9sfbt9hgN9Ph2c/qsgwiaBeWQHAGcfCuRovRdYbHOAWwO0CJ1+87z9PuWU59uD/OIyeDnUToDcB+XnFwSYMIVIEluHBOtwjt9z6YACYRc0uCgEJOUADFY5mQ30OysFGX9XYNCpdlxA977RJi3i/bhMIfWdD2ssLYphkxn8hqjLgQgrJ1JQiVZShWtA8izzvEpfHSnxQ7puLu+I1Ue/Xhw3HeCZjtk0MZS5lGXRhACMYw3k4gI/f9KPNheFnNm/ZkhoZMw/zmUVJlqlGo/kOOO2yAk+U+hhuXDWueCJgjUmPXwpt6J1qBy5d6vcDZkFfgP4O0J/oT0J/vD8BHQP+P//+eSwB/O95Bv5s5adnAcAPjyN4AD/c9ul9BPrJqzvrO9b28fY9QOB8wN2ARwGDiYDnAd8Gf/cTwF9jlj9nA1yD9f/Dpgmrs/Y4qCMLHb02VzXUwMPAx+95J53WTAsVM7Vb2puQw0jrtv+aOm+v3fap7oSrttvss/NJtcM1F5xR6JZL/tqmrVfctMUXhxx2RHPd5r43rlX8dufVZr3HjZ7I74g11lpnvQ022Wi0Ve4p9lFBcvx231e12bk4OLn9mxTQUySZZUM6x4hJNmUmxwsKkNMSeD00+GtqNM8l6p6FwvCtQJ2MVv1GWnwvsOIaYPRZaI8CGAEoDOHQ2eCYbXKl+j1N/UsLXq6RjrZ4qbEmIfeqUOzSsnRjhi25Gk5t0XpnKSlndJdolS2bmXbewPCxr8EmURtarnXD7cITlXUFrVVX6ykmo/w3sCQ1oqkrt6565ZyHEvVMF9dX7kvmwXAJaXzHbvYIHAhIpKxYopwgBKQp5C9d5hozlEfhCVU5HFvch5XobsEhwShwTvJu0Jq7gUeLpxliNjJ700apUcWl4DiDgcVhtdDNOMEwLeX9m1DBf+4bG5SoAojNQo8tmLD+jLhvIl5sR3qqUugZSmQwUEcoEKAPAKxpBJHbCCEQRKEp5CI3DVHGSp5gqcz0RqmruMEKJoVs12ZvFQ88gJSFKALzWighwxcAyOdu4Dis9OKrs1wxO0+HNeBsQUS/28CoWqHRhaJFCCBXr4e4+dfQuMIQdxQYSB8XQUQbD3CP5OQQLskUTi/uTaAS41Tq1geAPrqSXMhIS8Cwwv4hvFMVvkwFWHeYtb4Nnsgg3CnWC+cEBLCc1pHTr662OooJjZOcXMx4MOzJqayu2MWwhlO514co7JWwvHHfJloor2FEOyWGAWCCBvQQiao2UzDHZArNZJ32VLJd9F+qtNKRnpg2uITVV1UTQ4Fp+DZa04ZtDaUNNojS2xnT571r/DPa4Qg6dogPNE+sXfiQ41EHHneh+F2hbiJT0GldaigboncE2rtLAmIKYoWPk5gjj9RQ5FEeryb2hDQ7DyQjwuK20G4Rm8dzo9GEWtLwurSMAq/ZsacFeYp/pfSQBATJU0z7IRjgS1xEIh1gqPRB4FhbY7jIgkhUPfI+uE+UczpV9HWsUpfP1+wjypqs7SLtnjvX/tw1h6jdPWb5wiMPuGPHs417xrerEX5TiFoYXIIzTe+UtSrT2uVE1s0rF3LsdxJgwfEWXj27RBgo0S8qm+qMwRAayRPHQIMiZLVDPvE7Jcz1jwpFy+8ncsFvqKb13mQGUkMAPoTrLqRyKyQTz34WTrRpuChNb/zcEEEJsa5hn/7g1Mc2A53wItwy3X6v5lDvsjutIMFNioiiRAPtR/Q+jZEhVrrGJPYg9UEtiGE5yIkYjxKECCVxtbebA+mMPHhuejCZ8QU1GbHSkDYMpL0Xv34S7ZktqnxyPJp76w3A02WV4zJjlzF+pfUDOpQii0/rHAokNPJaJgw4SeoybkO6hTPvabSYnNNTWn/XqmboY0Quf4akOy7efMzgjjTcQX+LTx/yNjaNbdRYQwLnSTqjNWRYqNq1VnApedg64pPdakX+kJcKrlOPjAvVJ/S3dXtNR+vXjNB+oxi0PYi1QxWiEbXHECBZ+r92g5vXiwPpjA8HDWpx73zig5iCI20N1bEHHT4iPowjmNJENUtt44qTPgnVIVuYsF9ujV5uQBW634qChPYSkhKRXb2DrB4FSh0hgaMJRFI7JKEdfXe7zr5n7o1oaxAVF8d3F/dS8wg3xtK6ni88jxhjg4zzlKHjL1JdjyFFeYm4q54Dg3jPi/O07Za+dRIaTJvvddmBqmsOkaGqKxGGUzdQXhDIHtSzLr1Gw/2DVLVzkvRduP0JGqV/+WtwiOdtLoZTmeXDgcJZtZvusGT4iSTpjNVZ6lKle4FwPqdwlLntmR7ERaePrQO0Ye4K01mqSVgzN/MUQcOu4sDCyN0As9GppiYngpz4fXqnEy/HD/3DU0bN4O62N4tOrLaP/c5X7AJxr3fC/GK63XiJv0cMzC6BB9lWU/Or9BfqDyKlxH+xBLvoDwe08YVKxXhVGGKpU9CRBxjO4itDZ/5t7zQXsiUDeKpGWOQH3GxdvZPV6XQ1L8jLrLULMg2LktSqg6K6UqzfNXXIgO/TyD/vzP6nsvLHL2Y276fcaecXTq5m+/vQT+pIXbJjN3TeCxqiDVCZIt1n04IedevESd3qaLW+hd8XRDGMqOsKmtv0T45utglgFA0b4waSCrAnY/YgtNQZ1ekrmhM3YpNwkj/JQ4BBADXzg8iuQXVp0ptivu8+0ViJ4ap0nuwtRbfMcfzTxlKn1HWsQ2jZJnkfnYl1bX1PbJxnGg6B/Y7pJ8Pk8tvkyetzTrLyTEJiTyPb0gnRp8+TDBNvzxF75XNkteMiLGiG8c6dWquTzcopklB7aFrsvt9X6fXLPF6pr3VjYHN1QarpwIr7I9wY5dQVTi5eEIrtNrE5wo+25f6jzmt2zrZnqbln+WWerSakdu7wizWXdIfbqt39A6q1y1niRBu86aZuCsLcq4bqnVMj726StzD9TAzZWeOauoS9Tes3ckdMKs1eHivTkL6H5vXpmqFiRlXEQc3ql12OY8lU6aVnkZNhrpxltCqx0rMI41m4A99ax7lUcLVO60VvEqr1st5s5Y9Netw9Z5q5lNnaZxoKv2XPiRK34ShaHW/ZrcAQHzpjw/ptd8pjrcygoxp1cavIT2tjBwr1O7v1lAFXeqg202d3BcJrZxmvhlli+4ncE2mqLcNETu8P4jEjBmzgQ3Epl5fGnDmN2ylH5Jjab8pqNZ11tLkjGtsjF7pa9SDQUAE26cH0sc2N1kuumzdZH9ZzqS6DqG2kIpD1Oz2C7vEXzt9lvaqs8RY7C1qCRJNq6mu4qUW9jdYXgYZ6Rgua1o5yqDrJdlFVBAKxj2qUP8OPEyTY8OYBPNSu46mILMV8za7eUgfhdXM/HciCF5svtkynGDUaBQ/bwHOlaw/bu1a4eYPc6ca3G7CK3ULl6NsoNAlViDk7yCPKhulYDbI8GGLDVmR7cDIIr/VPwhog6e6Pmt9tNXfabCJ5e/1cqUfuJ8a7vrL0/KQ4dNbMbAvU1dT7biOhUdW2GGBX1eYYdhW3QqgQa9SQRqxWsCim1kBqTPPW9rQdaRcrfdVxpVeVL2fmC2dM44zQmCoGm6VjVZD4ZPbzllmccjPlJXoy9fWf4tPeHUtlAtKX4z3waskV+Qpbf81dcRAGCSxkCGE10joG38YncBvc2+FtITsXEgud9WXSc+IzZotWQpDsGeYz2JjWpkEhVCztGLAi8zdvXLdvnTqYP29o1UCyYpqvOhJsjPR3HuqU1RjsOL4ZCmRgPMb9EoFW71izZfGWHatXt4hbY73hgZVzettjrcAXP4q14c2YmdCJ+dkfwIJ4NaZWASPimKNQLqojwQUrZ59NVOxxcBTbmoaqaF3612jx1go7fOmqLue/tkIRavAxpwqpnrx0cZCEhPp6olwF12iutTlktcbRBRgeM41GW3v27l0KqyXV4ar+xhqbEj48s6QbQGHhW9vgZnBhXD78pD0dOjySfjr/RRWBXbUdWJD5m0RHm/oei/PETR1fcJtrauxMMPIHP1ckyptYYn8lXIkFmsplt6n1cbPPqIY0HoM1zuGDacVdirfQVaklk7Qi4IunKpsYqEsC6dWOD2HKn6xHiq8ps4ogevPLNo9Bk6xxGRwvAwwx9/PVEU+aIq0xVuvz1zkqy5YYyH//v6HJrDCIxZi7janVxtiKWh1bwRax1c6CCmO9akWgUZd/iUVqykQmmUxaFeUA/JLvsHTsuyXAjJi7+ZWdrvuK+/VN1VVVTdX1v2yXvHM2H/z76bj69WG40dUXFnh23riyaxu8cdsAOoyu7B4+ZyMbUL8NflVtvcmCb7Gs4Es76wQfvssH0zP+PWJ5qQ5udIuXyAD8wPYCaB12b/PBcwgDD5EKVyFbzeH+7yzgjdEkaqVSYZLf2Xi1QuMtldaGGnwPySQ2X1HAp0yD7q5W5rxjra/1ws/xNUw2W8cDNYgjINfDVVhcyoDvPTSRBKqwVNZtha3y7rDUJnC3husIdXXO7WpLMGwgQPQxaeVsK2Sr7KZDvS7IF3piJ3U0hb5EIHBzOAEZQQbGEji2O7tPbkA9s9WAjijDUjnH7yxZd4dUKTSSHt6DGdI4VgXrA3JlAwwRYo7JZbNNsHnze0FErtO0o5IOE2VfQnV7k0Njkkn9n9rcpX/Tgom2Oo/J2OAB10cPCA+sobbRBoURMnnJiHBkFFT+BFvl0bBEKV/HaBPVT7MIFQXkN+DJH4wkobJDIov93qewthpCbWvrpNZaQk1bGwgo4qJeOqHJ5Qv8DL5fXSqlOuwatbm5MfTrnmdyBP7jtUDBQ9offtz78Ac7vxxxEJjCFPB3SpZMYhA8gZP1AiXPWEo3cK1SPf+RGLOaDLScUFZVw5lOqe3kXQHQQhNDgJhicmm3GTa3+HuW6UmNUeBrjlQTqp3zeUMJZhj4J8+oMO5o4cO7bDg+AyqBifTDJJx/5ceWPe3nyXzhFT0HbPKuWAvtBjvzhJqc6/u8DH49yhWjCpFSpuKAbCSwwI0ET/TBupxSqYHDYGpmrb5/30g5WlbZpHe5QyZYN3+niY2KlHR66Xn0fpad/DVL22YCBFobNbRHuOei9OIJ4YlaMrlHCFJT+IE2OMpu15lS5dSADy98pdh/CW50xTcLHIt+JW+4Bi+41ooOo8u7h4cXMADvxd9uPzLvm4Ctm407BcvIq7DPAbZOCklk8r2OJK8g+tV0abGhJe0fS5uobTSgcOnckEw4z6V/shxCIEcGVm1Yf2B9nRz4XtMvCgYHwsfCJIPk7z4AhpEdibpR+tw4wLRmgS9YoUwrmG4qo6v5ScaQ2+YOB2oQKWKpbO8WGgwRvqS+MkXD9zUIFelkh4m6QJh1EgUsxNgjUnRY0uTp3nDQ62uo0eH5M1xkXpsn7wZ0CP20Ovs6JFK2MCU+JaSUBKMCsGPjgEny2eDjeei8jT2Tgtfh0ruAiZiimLRdi8ih6pYqhy/Y6Ce4axstzD2EzbX9d9AVM+Aju3X5AlkjKm43QDqsMyIDfEQbEynCpt8tWCQqsVnDIkGdRK4NuH2BYNDbCc8KoDZlGypt1cN6RVtMpBE5W+pcBBHL7mQKhQWfbBHBNVhxcCC7MD4j89eU59BfjUXEZ4dys4EEcfVx5AEJJGRp1dTb8MSdRSwIU9i7yvR6YzMwiLXo/LvwWyrqki2EJJvwRqZTVBPR6wj6iK6mpth6gq5XU13ja1bLCfJz0veYA2UIRK4eO6nK7a1q4BTtkjYdbFC0FrS6qKg/2fy7WRyNScwV3w93CA0n9ICQ5XhRwe6vyP58Rb6fPMxfnkcuIect54O0rwpzuGY58PtX+W35BonSjJmVEgMK7f5kxSZqIpxINRXLmBpVtBombND+Vc0yuWFNt2+2YfU3q4Y/H9ezZIVlec9SsUH0K/4C3Oylyy0rZi9RnH+QZPVsX7dhTSVInkxtXiYrywDvE5KUBLzRy9LLkuZqPaC9fEYfkvN/zrcyYOwty6ZkEcmenk0+eZDttpiB93iqPJV8iQa/357JJHkSefzXzh/HzcxPDv7rlStlrP/sFC7XM6tCI6DLyzSVtV1sg76TJ/GLRXSThnvwX1pKruVkGfL9vVwAvahGLW/Tv6K/chTySubHh/7V/f9a/u+gcL51a/kBdWXdPOylI525edoLpkbEVz41DI1UAm1ebuCrqoD7K7QUvfPeQD/t5+S2grwbBQU38gq2HzTAGUbvoSBzcsnLLf23N6RviN6+3fJ0+oLxpvCVpWmr6oe8WSXNBQi8DPuBh9XLhTFdql4YrZNj3A/QLbAZ24Ich2doxM1ziP2Bg/s90dTuY766U0Mzh0Knxny9N4T3f9IGWmqgmoNUqw20BeDAOw8AaF2ZyClhFik734euaUxqqchVQxcuFw5JPQota64yj7a7V9obEoZ07wv2z9wv9yl1Or8SsN9mBdR4Y/VH/7cOb8WrAz1Meuth+GqjGj/D6h8q+EP8aawSX4QVEdTYz9xxaQnx3MHnsQf2K2DDpnzpvrP7d+t2R8Q+dNXy5QOegdIqsG0vNsHypqzBbntfXcRMwl6f8FJyL2Ls1GADRgM2u12lVodQNGyibkzyNTXblTp5GZbKtFI/4lmD9V7oosjIZLGs/CWeqNlo7NA6LjEkJqVSZZe91X1FoA6UyjRVIlZGxjPTN+TcyHIUjhW5E5wBj8FQH3BxKynp6pBrMXvxemKaZdH8Xkp+a/6mbuvYkF86L6owCVA3t7xKQqgKRb3eEq96bK/5tyo6XAX4iCkql3abEPMZs1Ima1Sfo4BfjRkNmjYU6zAV7E0MtLY4NUaZtPUnuYuutM02nYbn8RqmWeBpiVQTqkIRr9d2FaG6fY93/1yfYKt1m4xNfrAJEQeKhYbm+c87xBKJqoJLwZ7+gVOQkzOr5bUiD4Nt5ArKPHS0xnpLct0jmxOt1ItdtHI1vSxvTSrhDWIWMuLQlJ5ks8u1LirwTy6TMIgPJlZd7Rij3TmLD+8TSVc9LdDiace8UcFZt8gmEAptbMG8bPqrbPbfixhXTZVqtUlXuSczncKk5X6bA8dO3vxBNIGmDBZ/Syn4D7zvtjcGfb6StTuCdxQsY6Bac2UlJkp+7wA8EuoJ12ZJU7UOu1mikLLYSqaBWDvDrZZlT/x8h5fE4igchVxvp9NeJC0ocVwq5OqYHIGNqUKcT1VhUu7BscmsabraqkyyvhmhaYs18BOX+GZOydc2xPcDIGCQspmBuqWQFHWHGIqP49Lltcs1XSkZKS6HWYLH7FYQIHoWKbSrOjsi2pUV0wN5Fyg0KyMdnZpVqvUuJYQH5q5qX9UOhAkdeaHXrXXkyi1yu9xKjdGlzJDkFavLS7i8XaxYUck4O1OSodA5AUyX1vOFdTJZwa9mabHxgrW21ppwljpkXRnpx95iT046Q48HNFJZIs/IELn7uU9lTJ+e/hQXJH/0sV5wFb+L0H9cEscLx7Hl8fGLcUvh9UJLHIy9vYK/4hTC2+jbe4SV/JWnlFIbwp5Te0Bjw86dZ3NtDCaRZ3bt3PWHjcRgRn5zYueJDSQbkxH5zPGdx7+z5TIZbf/aiRP6uFyfGOP5vFyhUDzPLxb/jvg4c5NOWltGpCNAjpqSdXzdsnCsMxjkBQ9L5GKT0aPXmTymJSv5K5NbUJBJvfvTpgADf0+8S/3sOH8Zf2lXu9V9/Rcz2PIAewCUxBjvfAwMIWMV58di5/U+nxFv8nn1LnhNeGPva0vH5izgQrz5HM58HsRd4GysnQqy1168gF64iN0tBpqV6AgK9u6ZsyPtOdt3VLE8sfPluW9cHFfmZu+f4CVYmXl2LaszbfGz5xwNr2veCElB82JdaCNEdSNTQfb68xfQC+exu8yj9ZSO6eiVtKZ4CSw7v4Z2fA1W5RidKiQjK//HP/d/jkD3W52aN/8/JZ2+OR2aHACvPfR2oAfWg/G9ZepimprJLPg1UMZQFZhvw8NlfAazoqysgsngA4mSz+TPY9olCZNGk6akU/nizI8ysz5s7uvLWZmvhDrxpDnIJSlhWJdaapYCyRNlv83ZDw68QC6Ub//bnplxI+2pg1lUqION19LeLc49dGMbWoiDN7n9sLzZXtqvg3fazXAEKBRnvpyZ9dKDjmdlxl8qdgRlf26b3yKVIHltmvqErMwDXTBx9BhvO2vajz+2Pvts/WaBHtMLNtcf9NZ7R+AuYnaJWaRg6uew5m4xy83XaAqDVXxXA/+SECSxpl8uE4O3v4Cyj8fbRynYzz3O7iLlx9jsWD6pC8yNtCxYr1o4qHBtHy1lDZ/TbNhWvpXP9/DdXe206gssEy67T6NDwqE5pPHfrlsX21jA1FLTPVvjW+GTSaHu16gOQnZKTEw4esuhKV3e0Fy2c/9J38Y3EZ1DGSy2L2BxGopLAnTa3l2Ku4XMnzrg49+zaC9n0DC7Hvwa+Eh45TXv+26mO/D60v1n4c0jYMfGHpMo7Ah0TfJQcWfbRTVLrZalYP2fzn6bsh/Yc/IvmRoRr/xhGJqvTCoNAHVObuCrZiclLw5YVjTNQM06lJp+MyPT/vd2eSGZdPNQXvEDWsX9Rvt+wcCUdAqkiBq7iHKJt/H3S3kmz0ipdqtOqW8IKZNb3wz5rZcGP7FKDOU/ZsCPgWgi9bGS+hjcRNQ2sTnJ8ITL6y0pgAcQvsRdKZH41VqtXyUZkPhNmpO8tcUla3jcXSXFu8FGCozWiYK7rfVANYxsSNQeoQ/GVWJIDNzfK3teRXlp8u6C0t6yst5S+t11rc/alZGxKysTT95I39e+PJH1WFn6+O50XrOUx6CRMp6z/Cb0hMmQbnn3uYV54HJ24V5W8a8pr6EzjVziue7cbPAiovWrMbiKQCE0mctderk58DwNQ45vSYf7s/Rm3RsgJF6hlqwAlkoehTdXP3K1cHX81vOd5gvnB+9vqmuIokYhSyv7nsnaUVgSrJDwVmqhL5hc8SotpAAGHkrt0+aDlsLh+5t+y8z4NOOTIgi6Yhjrdk9lBV8rInYAmv+a83jjHzlZQsEnJIj4YtUnOmL/t7lvSJgIfV8FSDl8rVo34/TyQoqBydolfSpZ6a1UqRxyoUgj+OjaJvs/TJCDJ6lSjJkIXkgxejxGgamVmNwek8A40cjg7eHKebt59a2+knP3xB63ww8w6dFk6Ch+ObPqp9BwpW5GO9xp7i53xr3vyvc867AHsywz5VtBRWXhp4AdO+URIzc3mqLlvL5ot71Ebi7myQQ/nHVhoaRvU8DvfbICkrYirrVJdy+JbdFePefBXeKuSLEyElOX29CfiactKu0LS7CALZIAdwUhZY0KbwbYp77nKxN99S0KP5485c/rtalWMCpT4XORGncQy8tnvwM4GAJFNdNvs5XgrMyGz0R2KhwU/rQlCeA2kEfhyccb3k8psK84dmcv2hJwcpv75zVGMtKa+wtLYuvS9tFEVIWrwpo6L6j7t8IP38eXr2Ch785b1f3PJBUceddbhxVMkw5wCUd8MZ2Vk07qrpLyOsHGAMbJGLgkYlJnR3X/JpsggMuQ0PP+zQDsSOLiDgfO3GPvsl/eFV3uiazkLkl+6wN3gO3YNYMiSJzbx2qKOCBXn6UONNMllIOujGZqEjUfR7XFCk9LGpXxla9V6mLv3cUvNOICzpYL72QebKVglcxg2qSR16qGNIMpcxOpU8mzpSlKevTPNGDhXwb4b7ePfzNPwz3fHj6+r+2iQ19Pm/Xx5wE4HvDJOdTNvm/7HOLML3bOi4ePiItBS90lF1n9T2S0B0aBHMnkMcUoqxXGcyIrMTtVSFCXtm5Ei/h6fMHFjsno5TLWi6IIXVlxeQNhvRGte2VrGeAjHtJzvlHR1yDrAYZOQSSRx7QeimpVHaMoEY0gCPPBJNSlhqhK0SKVQTOhzmxBNECtOKKN+nb7DhgftpYvyGMrmosaoo0aB17M0g94Yg3Az0K9AAnrPUhDjYdqSe2WmkwNYLoPLcABwCpz1KtZRFUp2m5YbV5NvVfPru56y6p7ACPEwp2FKq44MD2j/iwLkROp3SEsvjogUvybDxftl5MMDXXq3ZrR9TBirxcZ40hAn2yOrhW5RWaPhng0BI2CSqH2llZHoRrlnUOa1GfQNdP5khqV0HpoKjoNzRI8Q5KKi6Dt0MpQDmfPNZUFIXuB1GaWx9FsoA4m64hnJjghEQSxb1okkyqkCEpXAy47/2M/qMdR173xJxAlRhd7OrMoa7I/o3kjP1ZeqWphra6Req4m6kF9W/80QQu2Ne1C+6j9Piob6Uf2kX/UMeoddZwD77X3y9k00nHN0tkzV+eFIcbYXVu+jq3fZ3Z8Xz9AzZzjdt6bBwnzc9QzyGZ2M8JZLnODZYo0YVAwcXOb+0h4kUSbQCIZyUdR9AlfTCyUoUqzR3z275mUYxY6LjGlWiERfRZYZp2t9hhxynlxd6woaqKGkNCfv3h5a++6LaP7L/xqU1coRg4VammklZJOMpGLqqmJOqiH5tESwjjKNjdceeCFN/54F79hRa259VuHrPesjtoRb8yLbXEzbmlSRZ0m7brk0xwt1TPardO6oo/VYz0uhUrPTHJgoIcN7OQARznDRW5wEwbdZcMT33a71XO90fe85krHXTj9nx7bc/uETRmiDHmGlmoa6WeItRzlNqRAkfll5mYyMvmZssxmuxzwiKc9700z1pUCRVmcLEXeauvpUMcbbbyJblW7L5vsX7YgW5od/PIf/+gv/ZUrN7P1ajmFKoD2PUDl+o/WlUgKdbqNxhIug1VN9Ai1B9Vmh29GjsivRrUeV+PFoSZyzY/C+mORd7V5JQyLxYJYqjbnuouB7XLlNouijuzyFJLKUoRus1MhgdXagqXVTOiTrOtEidpFjkxO2c5Yk3mc0XVFMiZCy0HVefhsqiIvsyQrGwPwdAwWiFLKkeMSuC84my99SP5P9/C2zv6wBGG5ShIEgNN9RWp4jdMybp6XnCd1f12NauVylh5uGOqAvpsL7008NUBvr9Zw/qcALlOs3+nfseuSDxpHA0yMi3CMEZTac4iR2J0QKC5iIbqaUoHAYwZDM4jhC0MVtEtg3NUe70yZNTTZngCYHCGj0NhQgzyvbqQl0qFmz3A8pIRwyZtcYCHhwM0ObdVhtj4wN7JzrTGwGszxz2jGfBixMg0cWVAhIGmIYhCRAgsiZ6qpTDKLpfaf+3BWh4TLkNSmQfAw9czGLJraeyYJ1ujZm0D1vpaJoBuJ9q1tSF9tcOVnrCl1pOpAea3UFSRJo251LtOOlNLzwlof5D7te6J4sJChut68xXWW2OS+Eru37E6kYK9EujfA4DFcldrAkx/agWbBYkZPtM9D5EpOLJV2uTqbAKbM+ABQesB9SWUO+PMnSaQkfsMFfI9Y3jtw6K2Fuy5/y2sPOEKOxBnwSaTRuAEkAzCK7AiMFvo/vLzKCCFSlv02I/0/2bsq0B893G02gX2svNgdI4uLyaJ+BQcJ1d8/cKy5x/86hY9Zs7JSC0s5n6p2HFRUXElBpMclQQpt9vI+YA1hyVUk1CSFmaG3GTmvvOFINT3UI5qfBJwARluddhrw3TNB7M5yOyZwBuByrNXaUhIpXBxwT8cXctUU4VnbXWnYFhRjODLP884iilJ5kR23M3wriYs84QmVUQBjnnAQOz3FVNHOQK2dCKJHCx2T/jMAkWPWHVtNaaydpJCSSHXEAf906lj7CyC8w+nV+gKCzvBCza1KS+1urJFFiaTXgHH0hVhVbKchDWX2hsHFdgKC/8vMpESFCBUfquOQt+FdtokTnGyoGTo2lkl1SdxKa98NDcmmUwxdTRaYVhCbwbEZ7gVfdUiEfQL+DKpQUgYMUilyoPO8jYcVtKudLQFaZmhsoGTkhseGOnNdkOikxpoLKF8c86X59BR8yp8AUzlCEu0PGtIh/Gnu8/0jnxH1yyee8qEmvAKgspd7WRkeI7UagdxyUlxGT6L8p51da+cEenqPLwuc76wi2ayxHQJ3l7eep1q/TycJ0GUKcDnfnwGcgN9OqO33frtRCvYNA4qC6fK+sC9c/2s6iT3/2MdwC2925hM1XCaPsubnJXu2V2mu61mpkHQjcp7KZEWdVAx6fckODOdg6gCXmYsoF52+AtSyIZF9E5UXQQ4vtBkpdlwUEAftM+J9XiMDL99GYHiGEw/DTm/cuiGX6l635umiSENeR1HLAu0Mm8vpYENmqEJRc7kH47w628b3HGwN2N93cBYVGFMZvto3G3hqf7GyxpRlyqq2Dvvtak1yvKjtDiNOMavLUWprsJRZ3nqYEp6QtOXhDDZzUsJieL82WDAyCavfBFm8KUgyqenRzexiKpMBl92ksBqp4l0PU574T3k/H8dj5YhSCDxxKArVJcdBNat1vkTn5uR1ZnXRLIrk3K9/fUwXTXBNjnxIKReSoto6lrb2J1asTYCANbl7M/uqhFqZ/k/DUf9YgmqCr3nWA7ssAzZkStRqMXFZvE5lsWKiF5MKXkEbh1FJYBs3a319crnIrWTKUou5NiuMTydc6YEUQq66Flktl1lx0hi5+yFe5pEmkRg/MwxIHhZGECe30Arahq3f8k7VN1xHN9rLiyO/zQC4HNEHIldyJQUPZ6RNltcKUWhAPeZphUEgP1BWMJ1wreqdOf3m8rMElST4wQIrHE4QNBdCKNaCgMBzEmWD21cz8jTddWWaUEQpNOXxRqKjvOLvtUnbVShCDHV1Th+tovqhRpAqSZpiOdf33MfUm3J6rQtpw1VNysTEiYJJh2ETvYRG4AmjoXKyBZyhujEbwsq5nhG6zqQdt3pXwNdut99itHwHmzF46in7IMa5XE67zMoAnpWI1b0x1CVPpGXtoVfr9shO6GWaKHOtToWYeKjsWZVHPMYztRRp+rvCkxgGn23SPcVsgnQNu5CYSKoxmhatmWcNHhHfMJfGCRQMGWr1fAsWCqWktVAO8ZlO5zh5rdnSJbyEmTRakj6eeGQjrqakZ3I0l1imUpT5Lss7nbokFpEMCbsIBBM5io+B+tBpiYDNoMD1RLVUreONp0LD+xLdtpePYOBoLHfkFgQfIHgQubuovtIu487l+CQeeGydpLcWD8cWsb8wVtlAx7FCAaqBzvMuW5Wt7VZhrpUZQEjJj7wuS6Bb7u0HIkJIjOMMZLVgvCDML0ICcy8fGABepkRMnGqyMFDpYgHlC/n0pvdJfEV568Hur+9Hp8BlM1rzeCMblkirRQnhM5Pu5qkTE//+3Q1zp18lsP4gVECIvYQVWDoW2OHk73D1at7nfLndg5210KI20kvbuS7pGkWE1+OE6FV6mRC1+zkfAM5Fkurv/249lbykYlkwyTGffHPAGf7iaqdDjKHX47FHWMoP8jSspMCHpl3q0VGG2RZHZyripQ2eesrYiN3A2CTGyqmBmjwaAyF9daPyyceDtsawTEaWnSq82KqHDr9P08a93Ac8abTn0HVOzboVlkLM6xBcKGAYrH/Yxui0JlFULnpsbl7DeIEJ8LAxxs5E186zPAzkntT3yoOBfcKznDJs9BB0TjCRoLg87eutwRd/fCdG6BuGXtEy1EZigJAj3dhVZTcGkniEm7XykdGPMCzJPj+rNgNccArVgsw7sC5Efe1iuv9Y//PG3tHSOZkxn9U3YP+XDwMq9MIxUEO16onkJHjc+EXpAelE0rypRN2zc4u9pi+0+5+XUWiAyky3ABrXPlQ5eQTfzSS7zEpSUkynj1UCVqkECQy1m+vzAXK4VLuoXDkU77nuIWs4Xl056Jdc07AzZIk0qYTRQ6rG3bjlB7UjgsQWgMxiAu4XlzEkXWs9J5TtNEQRwWDwVIDhqJpRqapibEubfaZNj2yzb/76E0eph+MSFrgTbNLv9PQ//B1L4i+g3pRK4COjK6EWsHG19UwqlamSV+BRacJdOwhsqg6lC/TP68JxRCsCGTbe5g8jXnwJsJMkOC0zyYM4A5tlA1FobFWpWdKma9Nt21gVYARa8NRTZaEVE9a1Z/VDA9fFQySWjrMDccfKykFwvzMKGhKUMjybo2UtCcOimkoTM4yDuCBLgoqNTqYoJ+WG8lzm5AAJpG8xfc5h04nSM1ONIGMV2N+vinp8hEmnnju2q30nP6h1kYWP93WLxSZ+sQCUSoigctPrAofh2Kxb9HnlxARHppsHgPIkJTSEVv7PGTNFQcIUnpkrTWWV6idP8ZMPG7uw213+Na6/lCRL/Z94UARtWWjUmnUD7U0hjdsBhkE6WOuH3TxjMM5SFgQvLEAeWOQvdPmH1VBOCVN8yzPSca5nGKKFbIPOmB5UTb4jNpn8uNz1/aSY+CCnkgo7hKdFX2U3iO5H8+JKMpibd7oZxpm554dFnwMaCYvz+TNEQ4LMiX36rD4kDbsvnKwDR9shgcpa4BIQPEysYtbHvJD1Z1tMQG2WmZHgVUMC9txpfRw8WpBXf94U0Bn0mQPM7k5DhiOw/0jNbn1jLibBkljloNU2fyBCIGKIMJT2Hky2n8jZccUrT7cYDJAAAHRKh1EGArEW2kHrsVIfDKV6YwQuv1ZefOqGfomAAPTCIx8tKXhXddm0/EO8U0F4WevimzmdvvfsB1F+jOEQISincfvidgdiBmxb6hTyQb7vdQdhJ2B/fff39wQAK/RGG3T+SpFiq9n3JHtlxy310TpXKsM6hYK3lgsIzNDfPLKdUnsJbEnjGaYbxTAvlFwe04uVY0yXSfRmxnlNmURp1jQGDTN6a7z4dO24GBsY6nQgNDYSVcVH3Q46LOasuLksqYswrS2i6BoKG1EbfDGBlm2EMBOdvtRyHAx2/jCMr+EkbQh3bmin4/HVcLKGIyEyuvgudB8xhYLrAE/S07YerylfJHAlI7QP2fbukD5/td7hjPtHhSGz5k5J4fxWaPd+XfEkQfTnfwwBFKMQXfdf3wUqzgXQHOxJUOOH7CInIHRuyvYFFQO8tpFXXl4u9tm/Kd2xwpCO66yIjKN0peUkgr4i6EcVYCXjeZThC01biNgcp26GaxOWV3IdyIkqjHskVV1aWFhaiirk98hr70kP9RsrwvYiRttDm3Wc4pck8E53Li6HgBPEiMcE5W0YnPm/6wfLCJfiLJf6LV+4Xvs6Vwqlkmk+ST0Mk35cn7cK0pbB6fXOMAJsf7bA+kl9k+FxO9slRi8vA405wwpIGJrjumwEzYjF4tiPa3O0XlgIUT0u8rc97tRcroDrMuP9b2yCwAzjWLt25vyA2DGQ6loILGWXedA5d5kHsVphZ2zUl5KscuI8DwuPwExaG57pWEopieMahLU4TkqK5Ziel7FhTL0C5XkMNiRHOCqviojyjAkZCsZ8Gg2qXKnrBEsxYjVXqRRwvFCp5KoiQ7HEXDh2iyUDspVVjuZG80fjV22ERrV1LIXZ6VaGbeXP9iz2qDvbuQjuyBGVSu0Pz1EfXh4TBLEPyoVjuwoAjONsvNybAnejSdH60Vq9h2AjWiBaNFq/twvc3giIVTYQrUY1rYIkmrBqDNuq/dLqKYNBNqppG3qcobQsu717lTeAVmJ8ZGb47ZOkMhnKIX6/P+a3KwXQ0vfkrbxy616dbwi95tzblE3t6KUS33VwaQQnUtSn3t19aLKMw2CrSaZn/dbkepuAtNLK3sEMaaPxq9bB54orX6+s/hKXl9eyy21C6Fr61W995R9YGvPu/EMBoJzhpQQt02pph1Bpofz7YkdhdL9JcFy3TUYCnX3sEz/6WzMJXn82CzGlzBWWQhW4Kkz1GUXpjmKD8+eV62YJdgvOZxFzWyMC1KIxBL2RMkdmNhrUlZYyBqPRnSKzDas7egSW8MrRhraTBW3QnMJz2XKl0vO44CvMAZN5MWOSUYOVWyfWTQEq05oFhGIMAYKY63qYPN21+Q2JwKcGNZVEYZYnjRC5OlgbP1luMgjBtbpyND6a5G3PMILTyk+iRaJZvREgvfugjKaAPmPaaMwqCh4tLufDVKVsvcrDm5wkd4o1vJUv0KQUFtPz3z5QrRYLLVHiaKQOFUzn2IulfPELv97X2wj+8xZNF9E3RxP5yN2RAZw654YHR868XpfiNlaSz3if7GhZd3UNjzCXV1Qj5zzPXreRO5YMO6ZMWr5S0aE4pOLuHAHoGMquFhDLrd7K48Xt9VajsmicB6HMAqqFwM6WDmKNKgSaJAUtbdCsmNdX+NGUaCRRZOqZqo2FBKGkVppxE8fWVZlG1d4jQFsNytGcaFI0cxVMPCsON/XcXH+h7huSn5Z1Rn59oT/MTugVBNoZtkjkcd6Ij/+SKNXNhwwDry60IrWMQFL+uVjP4nZuy1FNDZUDCHTEFTQvITtfsL12ZIYIZjKzMMG+0iS7OrptcwSeo3WvZiQbuwYI/NhUajJSccPTEXSzjrVHCrXFtHlsoyu8althXIj7F0g/JTAoktw+yKGK1sgQcVNG+Gxh5R6UQXF+ylXf5xvyIMgJNLxTY876uxb3i4q7xTPRMDSqAKdwH0u9hfQ4HAnFyLfN3SNWwEmZ2RjcL/S4rRdDI1KeZRS7Vk0Rp6We1aoRpzOqlNMvQccQLox4RjFzPUFBcUtilREt6I5oQ2Fg5cdupCI3b/ckBGMpwc8+2bbj+NR79lp4ipQFXZnSZBtRC+O4epPP54Ha36MxRo1UP4WP51eoXjyszDSVxrDocGhKrE3zEBVZNy/IpNflGe4RdENQHWuB16myS9TH5sCUGRGhVeTB8OBRYzubIUq29hzK/T92ocRkYvnuJAhy2l2elJQX1Oh+/R3xkNGrP3ahpqYothPorMpZAQpG4c5aijzTHIQw2wteudePsrzKs18oKlRVklyxO5rPWsQ4CuEAQ8ZrgDEAecxapQBPNNcBcHLTJsVcT8MwGEamrn9oblZZgkCOkAA+QNY2y0y1M1S8T0oXQWm2e9aphOlbJyTu1nQ4170YP7sL8IfxiwB3mkDA0QHWu6FWM3GoLiZ1hQCbC/hdKfGZyzu9fe0Q0J4O7vy7lhJcA52Tc/ehKBzwdKcUFU5IqbnQrSjgxp8rPlNVAeojXfWh91wQGCzTlZcJar1Gx5YopkK0QF+JdVW5rXEFlT8auOSB8E9jm7lU1/Ru7DKZpzzihhCd5vteoWdpWink80C0Q90xONPtsjatmVwO89ze+ntYjHfFI1pED5Jnrl1tV9jEVmD3rloUnersD7Nv8jhFODGJXOxmrMiBP8bxRzAerEUw+ivaiTTsVWmDufaPOVwFnWjY12wsgSs/ZTe42JDkDhvMFpq63gVx/0TvXmsIFhLzr03ZpuDR8dsHd+vDdHkRZvWiTKFKbywLXd0JBKrsp0JSNkrQ5a2swFhexOTAmtwG12cMTswcrdYwK9UYEsdC5d3f68UEr2rFvM8wgZ8xIY6Zf6ppIE7c4EE1Bxk1Q/knmbadDjDkB3dOBQcI71nQNFjk/9QPfYfxWZw42jPbc84X7B0PLfTPQa4NO7haFjaD6+O6ef0G99RBh69qV0Gigigozqg9a53m94F6iM2OKMPzfe7h26nnn3t3D2OVt/Lv0rtbj1W1cvRy7/VCC2e4ub5+L0jPazV3DFZTsnEE7CTq/LiKLPTrv+Uaz0+CO0H8D1LX0Y7NJhzZDoZY53z8Rvz8lgFg+yKopnia+Dyo7hivIjgeg18h/+5NCTUQcZnwvNbQtfqqSIybV1maxveZOf/X8GY+SL7cSlrS7mLjAUWQfD1fzs9bXQraCQDuK7f/aM/PCKqktf7RwK2rDXC/OqjP1LbLD21b5xsIR5M4tlQ00CspjM10CbcRdyoVk5ogagTbZlTquannejjjBvcog4nUX1zn25PzReBpqeKCJk5CMqeJzDkQIRlt3oDC1u4EIC9wspJiTIC1wOZGkWGDrqGmUPPCgL1ISvg15hGzSuBrsIA/4Y0xJ0z1raHkPcezpVjb0SQwDY6XBF0IxiniSnwzMD/ZrK0FZHuKHk2uSaOlOGXouWTIq1aqHzMT7aF4RRD0nMZ1GYaUmUoI+lJUQJ0u3lxHd8YU2NOchQzY0GokjURwZQKRpu+rREyzeegWrJM2mfxKsf1Yvs0ayLvCrESaYyuAtmvF92YxNSzmzAFGew+K5qdJ/6kt+qSstJhR6HBvBYMsi+Y5HJTc187VALyyMsGX4BU4V0PzY9eII40xh5Dxncr96PAGUZSxrI6kLUYklLIEitXSHbj1aIt+M+EF9grxtS3OmPTrI6/xv/T1Gfnt6he9Jt7yU449nkA4xZvYSmYthnYf22Xi6V09mnOynsZ5cWo4GaSv8m+W9a1gndxZZIQ2l/ehGCNCwJYxGoiUvsRda6KpiaqS83ZbDNuFjwf8eCAfrAJ40WDdjE2KTWMghT7Nd9xeRDZrTpmgEReFICTrAGzKDPdBWzUHAVzIw8MUkltCpIov0/wG3kKwd8Ff3DPt6ZxvRCTyQCXVChzmUdvBu9xk+vSVb4uZQEwjEJlZrEZ3ksG1AQovEZMH3qVTaw2HnpslOK2LbJnOGrmJg8ecYxWqEYIfOVpxtxowLXyr2PzsR5q8Uef1NcfZZu/hFY3+nKYuJ3l39EIyDgDq3Xm5NYXuEUJr293dPmZuvXjXdXhJ6zpSEhXq5F2u9jAS0OctB46a/eYIrK6IIYYGJocyWu+n2wF9bbm70183p1E4NTMQjtBvAe5G0Z0uSsF1xmg9BhgZdg8EDxsvh35L7jlfbp1uvcIdmERvTgJpCaT5JAdwtMUAjeXTxX+x/6v7w72r5+lFVOA/aayGp2tjgCRABxX7QUGiO8acCVrdQNNhLzabvQx/V1evR0vaelFZvgjQlVpA7jPNXSF9YS2vZ3GMveRu3xFJt5tM3c8XhwwjDYm4sBXatc2EZ7XUhZi5QFHfZWYm6bLHQtmqQXc9bd3QTeavGT0MpJzS7LhqnFlmCdTjOt3+eUY7NRzz2DalaEgZ2rp5vp8cjN+M06jO+jFeJALAytiNIXs+CdwjLCfdhLMqJwf4xd5Hg9y+3cMSTMCT6zvosQ6Ax9LZ4G1W12G3o+vgwfI6mRMMbjTmG42PzyDRbj/Scyi3GWMvRIxYD97RMnSvCcvecBkTS3SmAWoStK6NrxOGF7KqiZmnu5BO2pm4NuxmkVd0PkmvZ3hCdyCTApdlGSFKWD9SQEIauRlokZfV1ASgUyjZxUkeNtnrwDFuH/YQlMlMrIVrkw+mPRu8bwhC7/oS4LC5q+36+Y0nol2SpfrpnNjioizPIR9ZqYWgILRgmDwUVmssB7iSI0lkPFcjnEGHQMCvRTaVET3pVwdMrQIoOVl2xGi9gVXytdM53gOTYTlIjLDMSyEcNHwPTW+M2da6hwA5GOpRtYwOaA88y4YcnzMEpmnbtuglAbOqPtO6AY9VwZM1MxdpaQfCuBSDqrqMO8qh3jn/0gAmU8JHnMsEkcQKg7zxUHwBKKSlu8kQFxbsWrBnmg3Fx9cPiF39d39Ne5+r07kRJ6w0icL4s8V2nwcqQahNrZesqxh8W6NBjgDnU7zLKKDljKr1a2sGJyoYFmJoN1KQkNC9I6hEOu9Beyd92MJ310BJGESYSqvg3eDEk+69H3MxHi0Jv/malgcVdO0Oas+zJ1cpNcPCnHxgyTP7pFFJkt5hET1ZjORrl9aPmL8a2gc8lpUvjCLfCZmCvZVtqEEYvv+7e1lZTiymErsswLFUEYI6YETiLbZGXyq4ekgmadFrasNIgmSZJanksE1YfvX4TqDoFmEUG4B5p0dMfVsQruO2fJeY0YHabFKcJBBWG6zFpYDh8IC0UKB7IYk5EEjp5K2drgFsrLRQkPbMNpMaBB3RFgyMYJxlDFA8+Z4T+mFxWYidlJ9Tzc7aaoWgFRsEBr5Mb5VXQHCHtQTMrNEQgc2wVWkgEGzJ1B3kcq7JavWqBGTwNKCUvnesQBgMuCT2En0G2/Y6QbcaW9e4nfq1IwUPQj074Z7vfP+rRwPGxUfv//53vnRjxCFcEvE6kygb7K+r6Y7L05/mh5kMGZlC6m4SGUZGXKQC0yJ6mogW+zJCARohPP9QcOu73rhmo/RvsxJZKfCddx/Y+fAC/3ls7f/ydm4kBpM4QOB/z9J/x6DD/e9rOyPrEtnanGomAGxcapl6EKm2iqrFMmb4PCqSN2Tolja0UZ6HoxbMqpVQkbxVTbcJ3eWZAYI52XbCyPKk2qHuRJBak9KajzrTfmap8EsusVZoPDUUIhvyVSTOWMvq0iEBD2V51M2accJwq757QkZEShuDobPPF3emhLzKWM2cky2olUouF15KoRhdFBndSl31I6iJjCgsH7SaJgzKVoOEdRSNTsBC6TkkJKROL8V1Q+kGr1SeTHmC15xZBjlU0lKNXNvcGghZLRYhTibESSvndbnTzq0dbZxhTIC8IlzbtNWUacIrgANH0QhcU7vHo0EB9QVV6e5rKWY0jcAtPQkuEJAxEjQMXBtTRuZtdUPwkATV6O6FVG9cjcBtSHE6BMbUGNe5TOOMCMvFif+IKh5zXY0/qxwpJRVWszErAp0zo7tv+ezyz+hiugYhqNGpm8iyQ4xjMwRj4GgA04yprRlUklROwA04BpthBMRIeYXazPhMwZG+U6cLKYuQny3WwrhTIHcalrnwkIUjNcDLOkJy/WQ4dZq5/mFsb4JYFDOICtnfaMwaGsg1VaKR3SNOkpVT8qxDnmXIsw/Z6q2W9rouKQlAXskOuY/L/BOS66jcZmY/Ba80EM1Zzdxk2cjMBhGQQRgrnONPM67Wmg6j49AH3FDX8Pr/waD7WN3y5FYO0iSi50V4/yHNEbSX/GLqew0D863F0EgGeDmEmCVBnmU5Ku4sk2BlmuezIlrjs2J2rTMqCcL2ETCPEVmCQH1a26FApPSneEjB8bpEhFi1CAnrF2UR1qZdH78Wwi14K+zWCxNpTz6PNusR7mhfpizLhkWU9hrQNi+8Dh0LN20MVbbQ69GVaQs7dio3AJ/RU7tUlxiKGBGizvWX0RSVmcsWa4ELy8L9Ihr1iFtRbk9Jyat1/by8VE9GPBhRW9YsV6BlxjpG3RQ6jObKfKb+jhldbWFtHdK9fCdh9ln3a8LSTpcoto4iy/iwRjGd/o1eCyPW8T7z3uU6DdFxTvnfsn6PGPvNVkgRA2Pn+mFDiFDOH8yImxFzy8dL4BsFKoZSOKW+6Fo6egZGJmYWVjZ2Dk6+IAhJw1BAlepd16rjO+K/nTp6aTLUCyJS8NbKN9IJRA46ZL8DzrvAiwcDo21461itddIpnvba55xJshSRUdrhikt2aqvZRu1965oO7rnK5bob8nX0lgI37dLJJrsVcyvS2ffe6SqsU1REzAG9fKePbj169eszYI5B88w130ILHLTHFKMsMmSMt456b4WVJppsmqmmEztBYoKFxjtO6puvvlP54KPDzEws5snUaMQ42da7466Z7nnokdPOfA+g0xuMJrPFarM7nGwOl8cXCEViiVQmVyhVao2+gWGi0ImNTRIyHWRlGJjKsbBxcPFU4BMQEkGJYSSkZOQqKSipqGlo6egZGJmYWVjZ2Dk4ubiz7bFYEtR3SmPt72tp7oo2Tet/w5z2T2z7eP4K7uxffnu/2XJJoic75X5k56fun9+dDdyZCFcBU5Xhu6y6XJnX2R6Jt84Yij7G3LH9+ZTGr+eK2jUhXWQgke7iC2lxJwRMvr81ScDEjcTW0ppcJhvC0G2wg0XGmyKjEcI1SmEqnppgF5/xNAS7oCuFcjq6DATirCb2aM7xdMPMfgtpj65O/uIx2pcaMpmTKeGLePi0x2VeQ3X68nrU7M/yAIfiog8LSPbuOdj+5TAxHje5DA1ihNCVjA49S3jwmWRyQW+bmd+ncTxDrfTkvU3X2vY7HvgmeEVrEz/51At7vAcEHEJTbxvENwMRwO2N7C+2Pc9nVIMopHmzsyUaDi3WEqGv9G0RZqEmYoi/e2qNPfrEBOCOdPe1SIhcg8Ad+rtqoMNj0CDoNE32d6ewvk93cnkdEZpixyd+l3nLRfgzAA==) format(\"woff2\");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}.sk5-root{position:relative;display:inline-flex;}.sk5-triggers{display:inline-flex;align-items:center;gap:2px;}.sk5-trigger{display:inline-flex;align-items:center;padding:4px 8px;border-radius:10px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-family:\"Space Grotesk\",var(--dsw-font-family,ui-sans-serif,system-ui,sans-serif);font-size:12.5px;cursor:pointer;max-width:210px;}.sk5-trigger:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}.sk5-trigger:disabled{opacity:.55;cursor:not-allowed;}.sk5-triggerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sk5-triggerEffort{color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));font-weight:600;margin-left:-6px;line-height:var(--sk5-effort-line-height,inherit);}.sk5-drop{font-family:\"Space Grotesk\",var(--dsw-font-family,ui-sans-serif,system-ui,sans-serif);position:absolute;bottom:calc(100% + 6px);right:0;border-radius:14px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);box-shadow:0 10px 32px rgb(0 0 0 / .35);z-index:1200;color:var(--dsw-alias-label-primary);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}.sk5-model{width:256px;}.sk5-modelsTitle{font-size:14px;font-weight:700;color:var(--dsw-alias-label-secondary);padding:12px 14px 6px;text-align:left;}.sk5-list{overflow-y:auto;padding:2px 6px 10px;max-height:min(420px,60vh);}.sk5-group{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-tertiary);padding:8px 10px 3px;text-align:left;}.sk5-row{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;padding:6px 10px;border-radius:12px;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;}.sk5-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}.sk5-row:disabled{opacity:.6;cursor:wait;}.sk5-rowDesc{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sk5-check{font-size:12px;color:var(--dsw-alias-brand-primary);}.sk5-status{padding:14px;font-size:12.5px;opacity:.65;text-align:center;}.sk5-err{padding:8px 4px 0;font-size:11.5px;color:var(--dsw-alias-state-error-primary);text-align:left;}.sk5-effort{width:225px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:10px 12px 12px;}.sk5-titleRow{display:flex;align-items:center;gap:8px;margin-bottom:8px;}.sk5-effortLabel{font-size:13px;font-weight:600;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}.sk5-help{position:relative;margin-left:auto;display:inline-flex;}/* The ring is an SVG stroke, not a CSS border or gradient: a vector stroke is anti-aliased by the rasterizer at every size, while a sub-pixel gradient ring at this diameter quantises into visible steps. The ring inherits currentColor, so the existing hover colour change lights it up. */.sk5-helpBtn{position:relative!important;width:16px!important;height:16px!important;min-width:0!important;min-height:0!important;box-sizing:border-box!important;padding:0!important;border:none!important;box-shadow:none!important;outline:none!important;border-radius:50%!important;clip-path:circle(50%);background:transparent!important;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:help;flex:none!important;appearance:none;}.sk5-helpRing{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;}.sk5-helpQ{position:relative;}.sk5-helpBtn:hover{color:var(--dsw-alias-label-primary);}.sk5-helpTip{font-family:\"Space Grotesk\",var(--dsw-font-family,ui-sans-serif,system-ui,sans-serif);position:absolute;top:calc(100% + 6px);right:0;width:206px;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;box-shadow:0 8px 24px rgb(0 0 0 / .35);z-index:20;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .12s ease,visibility .12s ease;}.sk5-helpBtn:hover ~ .sk5-helpTip{opacity:1;visibility:visible;}.sk5-helpTip:hover{opacity:1;visibility:visible;}.sk5-helpTip::before{content:\"\";position:absolute;top:-8px;left:0;right:0;height:8px;}.sk5-helpTitle{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:3px;text-align:left;}.sk5-helpText{font-size:11.5px;line-height:1.55;color:var(--dsw-alias-label-secondary);text-align:left;}.sk5-effortValue{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);line-height:var(--sk5-effort-line-height,inherit);}.sk5-effortValueMax{color:var(--sk5-c-dialog,var(--dsw-static-deepseek-400));}html[data-sk5-follow-seat] .sk5-effortSeatMax{color:var(--sk5-c-dialog,var(--dsw-static-deepseek-400));}@keyframes sk5-nameBlur{from{filter:blur(5px);opacity:.3}to{filter:blur(0);opacity:1}}.sk5-labelsRow{display:flex;justify-content:space-between;margin-bottom:6px;}.sk5-endLabel{font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));}.sk5-track{position:relative;height:23px;border-radius:9px!important;background:color-mix(in srgb,var(--dsw-alias-label-primary) 15%,transparent);cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;}.sk5-fill{position:absolute;top:0;bottom:0;left:0;border-radius:9px 0 0 9px!important;transition:width .16s ease,opacity .16s ease;pointer-events:none;}.sk5-fillEnd{border-radius:9px!important;}.sk5-dotHit{position:absolute;top:0;bottom:0;width:16px;transform:translateX(-50%);display:flex;align-items:flex-start;justify-content:center;cursor:pointer;z-index:2;}/* The dot is drawn as an SVG circle rather than a CSS background: at 4px on a 150% display that is a 6-device-pixel disc, and a vector circle is coverage-antialiased far more evenly than a border-radius fill at this size. The span keeps the 50% box radius so the hover glow stays circular. *//* The level marks and the handle are pinned to the theme static white instead of the alias label token: they must stay white in both appearances, so they never follow the light-mode near-black value. Only the top level keeps its brand blue. */.sk5-dot{width:4px!important;height:4px!important;min-width:0!important;min-height:0!important;flex:none!important;border-radius:50%!important;background:transparent!important;color:var(--dsw-static-neutral-bluish-00);opacity:.9;pointer-events:none;transition:opacity .12s ease;}.sk5-dotShape{display:block;width:100%;height:100%;overflow:visible;}/* Hover lights a soft halo with drop-shadow, not box-shadow: drop-shadow follows the painted alpha (our SVG circle), while box-shadow follows the element box — and the host overrides this span's border-radius, so a box-shadow halo came out as a blurred square with diamond corners. The resting state carries no filter at all: any filter, even a zero-blur one, moves the element onto its own rasterization layer and changes how this 6-device-pixel circle is antialiased. */.sk5-dotHit:hover .sk5-dot{opacity:1;}.sk5-dotShape{transition:filter .14s ease;filter:none;}.sk5-dotHit:hover .sk5-dotShape{filter:drop-shadow(0 0 2.5px currentColor);}.sk5-dotMax{color:var(--sk5-c-dot,var(--dsw-static-deepseek-400));}.sk5-handle{position:absolute;top:0;bottom:0;width:20px;border-radius:9px!important;background:var(--dsw-static-neutral-bluish-00);transform:translateX(-50%);box-shadow:0 0 0 transparent;transition:left .16s ease,transform .16s ease,box-shadow .5s ease,background-color .5s ease;z-index:3;cursor:grab;}.sk5-handleMax{background:var(--sk5-c-slider,color-mix(in srgb, var(--dsw-static-deepseek-450) 25%, var(--dsw-static-neutral-bluish-00)));box-shadow:0 0 10px color-mix(in srgb, var(--sk5-c-glow, var(--dsw-static-deepseek-400)) 90%, transparent);}.sk5-handleMoving{transform:translateX(-50%) scale(1.14);}.sk5-matrix{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;border-radius:9px!important;pointer-events:none;z-index:1;box-sizing:border-box;display:grid;gap:1px;justify-content:start;align-content:start;}.sk5-cell{width:100%;height:100%;opacity:0;animation:sk5-appear .6s ease forwards;}@keyframes sk5-appear{from{opacity:.1}to{opacity:1}}/* Parked noise band: the leftmost columns keep shimmering after the sweep ends. */@keyframes sk5-hold{0%{opacity:.1}8%{opacity:1}24%{opacity:var(--sk5-hold-min,.18)}38%{opacity:1}55%{opacity:var(--sk5-hold-mid,.62)}72%{opacity:1}88%{opacity:var(--sk5-hold-min,.18)}100%{opacity:1}}.sk5-sq{width:100%;height:100%;border-radius:1px;animation:sk5-flash 1.45s infinite ease-in-out;}/* One flash cycle: hold blue 250ms, jump to light, hold light 480ms, fade back over 720ms. */@keyframes sk5-flash{0%,29.41%{background:var(--sk5-c-grid,var(--dsw-static-deepseek-500))}29.42%,57.65%{background:var(--flash-light,var(--sk5-c-blink,var(--dsw-static-deepseek-400)))}100%{background:var(--sk5-c-grid,var(--dsw-static-deepseek-500))}}/* ===================== Colour switcher (bundle detail page) ===================== */\n/* The section lives in the plugin manager's settings page, so it borrows the host's theme\n   tokens instead of shipping a dark-only palette: the same markup then reads correctly in\n   both appearances. */\n.sk5c{--sk5c-fg:var(--dsw-alias-label-primary);--sk5c-muted:var(--dsw-alias-label-secondary);--sk5c-tertiary:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));--sk5c-card:var(--dsw-alias-bg-layer-1);--sk5c-inset:var(--dsw-alias-bg-layer-2);--sk5c-border:var(--dsw-alias-border-l2);--sk5c-input:var(--dsw-alias-border-l1);--sk5c-primary:var(--dsw-alias-brand-primary);color:var(--sk5c-fg);font-size:13px;line-height:1.5}\n.sk5c *{box-sizing:border-box}\n.sk5c-header{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px}\n.sk5c-badge-icon{display:inline-flex;align-items:center;justify-content:center;flex:none;width:30px;height:30px;border:1px solid var(--sk5c-border);border-radius:8px;color:var(--sk5c-primary)}\n.sk5c-title{margin:0;font-size:14px;font-weight:600}\n.sk5c-subtitle{margin:2px 0 0;font-size:12px;color:var(--sk5c-muted)}\n.sk5c-panel{display:grid;grid-template-columns:minmax(0,1fr);border:1px solid var(--sk5c-border);border-radius:14px;background:var(--sk5c-card);overflow:hidden}\n.sk5c-col{display:flex;flex-direction:column;min-width:0}\n.sk5c-section{padding:16px;min-width:0}\n.sk5c-col .sk5c-section + .sk5c-section{border-top:1px solid var(--sk5c-border)}\n.sk5c-head{display:flex;align-items:center;gap:6px;margin-bottom:10px;color:var(--sk5c-muted)}\n.sk5c-head h4{margin:0;font-size:13px;font-weight:600;color:var(--sk5c-fg)}\n.sk5c-hint{margin-left:auto;font-size:11.5px;color:var(--sk5c-tertiary)}\n.sk5c-modes{display:grid;gap:8px}\n.sk5c-mode{position:relative;display:flex;align-items:flex-start;gap:8px;padding:9px 10px;border:1px solid transparent;border-radius:9px;background:var(--sk5c-inset);cursor:pointer;transition:border-color .18s ease,box-shadow .18s ease}\n.sk5c-mode.is-on{border-color:var(--sk5c-primary);box-shadow:0 0 0 1px var(--sk5c-primary)}\n.sk5c-mode input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}\n/* Drawn as SVG circles so the host's radius reset cannot square them off. */\n.sk5c-dot{display:block;flex:none;margin-top:2px}\n.sk5c-mode-title{display:block;font-size:12.5px;font-weight:500}\n.sk5c-mode-desc{display:block;margin-top:1px;font-size:11.5px;color:var(--sk5c-muted)}\n.sk5c-list{list-style:none;margin:0 -8px;padding:0}\n.sk5c-list li + li{border-top:1px solid var(--sk5c-border)}\n.sk5c-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:9px 8px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer;transition:background-color .16s ease,border-color .16s ease}\n.sk5c-row:hover:not(:disabled){background:var(--sk5c-inset)}\n.sk5c-row:disabled{cursor:default}\n.sk5c-row.is-selected{border-color:var(--sk5c-primary);background:var(--sk5c-inset)}\n.sk5c-row:focus-visible{outline:2px solid var(--sk5c-primary);outline-offset:2px}\n.sk5c-row-text{min-width:0}\n.sk5c-row-name{display:flex;align-items:center;gap:6px;font-size:12.5px}\n.sk5c-auto{display:none;padding:0 6px;border:1px solid var(--sk5c-border);border-radius:6px;font-size:10.5px;line-height:1.6;color:var(--sk5c-muted)}\n.sk5c-row.is-auto .sk5c-auto{display:inline-block}\n.sk5c-hex{display:block;margin-top:2px;font-family:ui-monospace,\"Cascadia Code\",Consolas,monospace;font-size:11.5px;letter-spacing:.03em;color:var(--sk5c-muted)}\n.sk5c-chip{flex:none;width:26px;height:26px;border-radius:7px;border:1px solid var(--sk5c-border)}\n.sk5c-master{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;margin-bottom:12px;border:1px solid var(--sk5c-primary);border-radius:9px;background:var(--sk5c-inset)}\n.sk5c-target{margin:0 0 12px;font-size:12px;color:var(--sk5c-muted)}\n.sk5c-target strong{font-weight:500;color:var(--sk5c-fg)}\n/* The palette follows the host appearance like the rest of the panel: the\n   design's shapes and spacing are kept, but every surface colour comes from the\n   theme tokens so light and dark both read correctly. */\n.sk5c-panel > .sk5c-palette{border-top:1px solid var(--sk5c-border)}\n.sk5c-presets{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-bottom:12px}\n.sk5c-preset{min-height:26px;aspect-ratio:1/1;padding:0;border:1px solid var(--sk5c-border);border-radius:7px;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}\n.sk5c-preset:hover{transform:translateY(-2px)}\n.sk5c-preset.is-active{border-color:var(--sk5c-primary);box-shadow:0 0 0 1px var(--sk5c-primary)}\n.sk5c-preset:focus-visible{outline:2px solid var(--sk5c-primary);outline-offset:2px}\n/* Picker geometry and states are ported verbatim from the supplied design:\n   the hue bar is a 16px bar with an 8px radius and a 1px border (not a pill),\n   and the thumbs are solid circles filled with the colour being edited, not\n   hollow rings. Focus/active states keep the thin border and draw no ring. */\n.sk5c-picker{margin-top:16px;padding-top:16px;border-top:1px solid var(--sk5c-border)}\n.sk5c-hue{position:relative;width:100%;height:16px;border:1px solid var(--sk5c-border);border-radius:999px;background:linear-gradient(90deg,#ff0000 0%,#ffff00 16.66%,#00ff00 33.33%,#00ffff 50%,#0000ff 66.66%,#ff00ff 83.33%,#ff0000 100%);background-origin:border-box;background-clip:border-box;cursor:pointer;touch-action:none;transition:border-color .16s ease}\n.sk5c-hue:hover{border-color:var(--sk5c-input)}\n.sk5c-hue:focus-visible,.sk5c-sv:focus-visible,.sk5c-hue:active,.sk5c-sv:active{outline:none;border-color:var(--sk5c-border)}\n.sk5c-hue-thumb{position:absolute;top:50%;left:0;transform:translate(-50%,-50%);pointer-events:none;overflow:visible}\n.sk5c-sv{position:relative;width:100%;aspect-ratio:1/1;border:1px solid var(--sk5c-border);border-radius:8px;background-color:hsl(0,100%,50%);background-image:linear-gradient(to top,#000000,rgb(0 0 0 / 0)),linear-gradient(to right,#ffffff,rgb(255 255 255 / 0));background-origin:border-box;background-clip:border-box;cursor:crosshair;touch-action:none;transition:border-color .16s ease}\n.sk5c-sv:hover{border-color:var(--sk5c-input)}\n.sk5c-sv-thumb{position:absolute;top:0;left:100%;transform:translate(-50%,-50%);pointer-events:none;overflow:visible}\n.sk5c-picker-block + .sk5c-picker-block{margin-top:14px}\n.sk5c-label{display:block;margin-bottom:5px;font-size:12.5px;color:var(--sk5c-muted)}\n.sk5c-code{margin-top:14px}\n.sk5c-code-row{display:flex;gap:8px}\n.sk5c-input{flex:1;min-width:0;height:32px;padding:0 9px;border:1px solid var(--sk5c-input);border-radius:8px;background:var(--sk5c-inset);color:var(--sk5c-fg);font-family:ui-monospace,\"Cascadia Code\",Consolas,monospace;font-size:12px;letter-spacing:.04em}\n.sk5c-input:focus{outline:none;border-color:var(--sk5c-primary)}\n.sk5c-input.is-error{border-color:var(--dsw-alias-state-error-primary)}\n/* Primary-button pair from the host: the brand accent itself is the inverted\n   colour (near-black in light, near-white in dark), so pairing it with a fixed\n   #fff label made the button disappear in dark mode. Fill and label come from\n   the host's primary-button tokens, which always contrast. */\n.sk5c-apply{flex:none;height:32px;padding:0 14px;border:0;border-radius:8px;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,#fff);font-size:12.5px;cursor:pointer}\n.sk5c-apply:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary)))}\n.sk5c-apply:disabled{opacity:.55;cursor:not-allowed}\n.sk5c-switch-row{display:flex;align-items:center;gap:12px;margin-top:14px}\n.sk5c-switch-text{flex:1;min-width:0;font-size:12px;line-height:1.45;color:var(--sk5c-muted)}\n.sk5c-switch{position:relative;flex:none;width:36px;height:20px;padding:0;border:0;border-radius:999px!important;background:var(--sk5c-input);cursor:pointer;transition:background-color .16s ease}\n.sk5c-switch.is-on{background:var(--dsw-alias-button-primary-fill,var(--sk5c-primary))}\n.sk5c-switch:focus-visible{outline:2px solid var(--sk5c-primary);outline-offset:2px}\n.sk5c-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%!important;background:var(--dsw-alias-switch-thumb,var(--dsw-static-neutral-bluish-00));box-shadow:0 1px 2px rgb(0 0 0 / .25);transition:transform .16s ease}\n.sk5c-switch.is-on .sk5c-switch-knob{transform:translateX(16px)}\n.sk5c-actions{display:flex;gap:8px;margin-top:12px}\n.sk5c-reset{height:32px;padding:0 12px;border:1px solid var(--sk5c-input);border-radius:8px!important;background:transparent;color:var(--sk5c-fg);font-size:12.5px;cursor:pointer}\n.sk5c-reset:hover:not(:disabled){background:var(--sk5c-inset)}\n.sk5c-reset:disabled{opacity:.55;cursor:not-allowed}\n.sk5c-note{margin:8px 0 0;font-size:11.5px;color:var(--sk5c-tertiary)}\n.sk5c-note.is-error{color:var(--dsw-alias-state-error-primary)}\n/* The host's global reset rewrites border-radius on plain elements (the same\n   reason the composer seat pins its dot radii), which turned these circles\n   into rounded squares. Re-assert the design's geometry. */\n.sk5c-panel{border-radius:14px!important}\n.sk5c-row{border-radius:8px!important}\n.sk5c-mode,.sk5c-master{border-radius:9px!important}\n.sk5c-chip,.sk5c-preset{border-radius:7px!important}\n.sk5c-hue{border-radius:999px!important}\n.sk5c-sv{border-radius:8px!important}\n.sk5c-input,.sk5c-apply{border-radius:8px!important}\n@media (min-width:900px){.sk5c-panel{grid-template-columns:minmax(0,1fr) 340px}.sk5c-panel > .sk5c-palette{border-top:0;border-left:1px solid var(--sk5c-border)}}";
		/**
		* Keep the existing Latin-label line box on each platform. A fixed numeric
		* line-height would also stop fallback-font jumps, but resize the working UI
		* on platforms whose native font metrics differ. Measure our own font only;
		* computed CSS height excludes ancestor transforms and display scaling.
		*/
		function measureEffortLineHeight(element) {
			const previous = element.style.getPropertyValue("--sk5-effort-line-height");
			element.style.removeProperty("--sk5-effort-line-height");
			const font = window.getComputedStyle(element);
			const inheritedLineHeight = font.lineHeight;
			const nativeFont = [
				"fontSize",
				"fontFamily",
				"fontWeight",
				"fontStyle",
				"fontStretch",
				"fontVariationSettings",
				"fontFeatureSettings",
				"fontSizeAdjust",
				"fontOpticalSizing"
			].map((key) => [key, font[key]]);
			if (previous !== "") element.style.setProperty("--sk5-effort-line-height", previous);
			if (Number.parseFloat(inheritedLineHeight) > 0) return inheritedLineHeight;
			const sample = document.createElement("span");
			sample.textContent = "Max";
			sample.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;display:block;white-space:nowrap;line-height:normal;margin:0;padding:0;border:0;width:auto;height:auto;min-height:0;max-height:none;";
			for (const [key, value] of nativeFont) sample.style[key] = value;
			sample.style.lineHeight = "normal";
			element.appendChild(sample);
			try {
				const height = window.getComputedStyle(sample).height;
				return Number.parseFloat(height) > 0 ? height : null;
			} finally {
				sample.remove();
			}
		}
		/** Per-model (provider\u0000model) effort memory, shared across the whole page. */
		const effortMemory = /* @__PURE__ */ new Map();
		/**
		* Snapshot handed to `useSyncExternalStore` when a session resolved no
		* directory. Module-level on purpose: `useSyncExternalStore` compares snapshots
		* by identity, so a literal rebuilt on every render would report a change on
		* every render and re-render forever.
		*/
		const NO_DIRECTORY_STATE = {
			current: null,
			groups: [],
			status: "idle",
			error: null
		};
		/** Two-level mask curve: right side opaque, left transparent, transition over 5%→75%. */
		function fadeAt(fx) {
			if (fx <= .05) return 0;
			if (fx >= .75) return 1;
			const t = (fx - .05) / .7;
			return t * t * (3 - 2 * t);
		}
		/**
		* Settings namespace of this bundle's Host entry. `@deepseek-ai/dsh-settings`
		* keys a namespace by the Loader entry's declared id, which is the row id in
		* `cordis.patch.yml`; a Loader that nests the profile patch under its `include`
		* group may present the id with that parent prefix instead, so both spellings
		* are watched and whichever the Host serves is used.
		*/
		const SETTINGS_NS = "ui-skin-switcher";
		const SETTINGS_NS_NESTED = "include:ui-skin-switcher";
		/** `plugins.bundle.config` is keyed by the bundle's package name. */
		const BUNDLE_KEY = "@domitor-syh/dsh-ui-skin-switcher";
		/**
		* Publish the stored palette and contribute the colour switcher to this
		* bundle's own page.
		*
		* Both are gated on the settings namespace actually being served: a Host
		* without the `configForms` service, or without this entry's `Config` schema,
		* registers nothing, and the composer keeps its shipped colours. The
		* registration rides `whileServed`, so a deployment that stops serving the
		* namespace also takes the section away instead of leaving a dead control.
		* @param ctx - client root context.
		*/
		function bindColorSettings(ctx) {
			if (typeof ctx.inject !== "function") return;
			ctx.inject(["configForms"], (sub) => {
				const forms = sub.configForms;
				if (forms === void 0 || forms === null || typeof forms.whileServed !== "function") return;
				sub.effect(() => forms.whileServed([SETTINGS_NS, SETTINGS_NS_NESTED], (served) => {
					const namespace = served.has(SETTINGS_NS) ? SETTINGS_NS : SETTINGS_NS_NESTED;
					const form = forms.get(namespace);
					const publish = () => {
						const value = form.getSnapshot().value;
						setPalette(readPaletteConfig(value), readFollowSeat(value));
					};
					publish();
					const unsubscribe = form.subscribe(publish);
					const registration = sub.slots.inject("plugins.bundle.config", () => sub.slots.register({
						name: "plugins.bundle.config",
						key: BUNDLE_KEY,
						locale: NS,
						inject: () => ({ t: sub.locale.bind(NS) })
					}, (props) => props.view === "summary" ? null : react.createElement(ColorSection, {
						form,
						t: sub.locale.bind(NS)
					})));
					return () => {
						if (typeof unsubscribe === "function") unsubscribe();
						if (typeof registration === "function") registration();
						else if (registration !== void 0 && typeof registration.dispose === "function") registration.dispose();
						setPalette(null, false);
					};
				}), "ui-skin-switcher: colour settings");
			});
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
			*
			* `select` answers with an outcome envelope — `{ ok: true }` or
			* `{ ok: false, error: { code, message } }` — and only rejects for a
			* transport-level throw, so a refused selection has to be unwrapped rather
			* than caught.
			*/
			const directories = ctx.modelDirectories;
			/** Unknown sessions make `directoryFor` throw; that must not break the seat. */
			const directoryOf = (sessionId) => {
				try {
					return directories.directoryFor(sessionId);
				} catch {
					return null;
				}
			};
			const runtimeSessions = ctx.sessions;
			ctx.effect(() => injectCss(CSS));
			ctx.effect(() => ctx.locale.register(NS, DICTS), "ui-skin-switcher: dictionaries");
			bindColorSettings(ctx);
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
				const [busyKind, setBusy] = react.useState(null);
				const busy = busyKind !== null;
				const [error, setError] = react.useState(null);
				const [hoverIdx, setHoverIdx] = react.useState(null);
				const [grid, setGrid] = react.useState(null);
				const rootRef = react.useRef(null);
				const effortTriggerRef = react.useRef(null);
				const effortValueRef = react.useRef(null);
				const trackRef = react.useRef(null);
				const [moving, setMoving] = react.useState(false);
				const dragIdxRef = react.useRef(null);
				const busyRef = react.useRef(false);
				const pendingRef = react.useRef(null);
				const [settledIdx, setSettledIdx] = react.useState(null);
				/** Live palette from the plugin's own settings; null keeps the shipped colours. */
				const paletteColors = usePaletteColors();
				/** This session's shared directory — the official selector's own data source. */
				const directory = react.useMemo(() => directoryOf(sessionId), [sessionId]);
				const state = react.useSyncExternalStore(react.useCallback((listener) => directory === null ? () => {} : directory.store.subscribe(listener), [directory]), react.useCallback(() => directory === null ? NO_DIRECTORY_STATE : directory.store.getSnapshot(), [directory]));
				/** Composer trigger row owns this width; the slider handle spans half of it. */
				const HANDLE_W = 20;
				const load = () => {
					if (directory !== null) directory.load().catch(() => {});
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
					if (directory === null) return;
					pendingRef.current = sel;
					if (busyRef.current) return;
					busyRef.current = true;
					setBusy(keepOpen ? "effort" : "model");
					setError(null);
					/**
					* The call itself can throw instead of answering — `select` refuses a
					* session that may not use Agent-bound model RPCs before it goes async —
					* and a refused selection RESOLVES with the Remote failure inside the
					* envelope instead of rejecting. Both paths land on the seat's own error.
					*/
					let pending;
					try {
						pending = directory.select({
							provider: sel.provider,
							model: sel.model,
							...sel.reasoningEffort === void 0 ? {} : { reasoningEffort: sel.reasoningEffort }
						});
					} catch (e) {
						busyRef.current = false;
						setBusy(null);
						setError(msg(e));
						pendingRef.current = null;
						return;
					}
					pending.then((result) => {
						busyRef.current = false;
						setBusy(null);
						if (result !== void 0 && result !== null && result.ok === false) {
							const failure = result.error;
							setHoverIdx(null);
							setError(failure === void 0 || failure === null ? "selection failed" : failure.code + ": " + failure.message);
							pendingRef.current = null;
							return;
						}
						if (!keepOpen) setMenu(null);
						effortMemory.set(sel.provider + "\0" + sel.model, sel.reasoningEffort);
						const next = pendingRef.current;
						if (next !== null && next !== sel) {
							pendingRef.current = null;
							apply(next, true);
						}
					}, (e) => {
						busyRef.current = false;
						setBusy(null);
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
				const hasEffort = reasoning !== void 0 && choices.length > 0;
				react.useLayoutEffect(() => {
					let active = true;
					const elements = [effortTriggerRef.current, effortValueRef.current].filter((element) => element !== null);
					const stabilize = () => {
						if (!active) return;
						const heights = elements.map((element) => measureEffortLineHeight(element));
						elements.forEach((element, index) => {
							const height = heights[index];
							if (height !== null) element.style.setProperty("--sk5-effort-line-height", height);
						});
					};
					stabilize();
					const fonts = document.fonts;
					fonts?.ready.then(stabilize);
					fonts?.addEventListener("loadingdone", stabilize);
					return () => {
						active = false;
						fonts?.removeEventListener("loadingdone", stabilize);
						for (const element of elements) element.style.removeProperty("--sk5-effort-line-height");
					};
				}, [
					menu,
					hasEffort,
					displayLabel,
					current?.provider,
					current?.model
				]);
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
					/**
					* The two cell colours come from the palette: the resting cells are the
					* grid slot pulled slightly toward its luminance (a printed dot reads
					* calmer than the flat fill), and the flash peak is the blink slot as
					* picked. At the shipped palette this reproduces the previous
					* hard-coded pair exactly.
					*/
					const rgbOf = (hex, fallback) => {
						const parsed = parseHex(hex);
						return parsed === null ? fallback : [
							parsed.r,
							parsed.g,
							parsed.b
						];
					};
					const livePalette = paletteColors ?? DEFAULT_PALETTE;
					const deep = desat(rgbOf(livePalette.gridNormal, [
						65,
						118,
						230
					]), .15);
					const lightPeak = rgbOf(livePalette.gridBlink, [
						132,
						170,
						244
					]);
					/** Overall right-to-left sweep duration of the reveal. */
					const revealMs = 1800;
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
					const noiseLeadCols = 6;
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
						const nu = Math.max(0, Math.min(1, u + stage / (grid.c - 1) + stagger / revealMs));
						const appearDelay = (revealMs * nu / 1e3).toFixed(3) + "s";
						const appearMs = nu * revealMs;
						const bandCols = Math.max(noiseLeadCols, Math.round(grid.c / 3));
						const bandPos = c < bandCols ? c / Math.max(1, bandCols - 1) : 1;
						const holdChance = Math.max(0, Math.min(1, 2.5 * Math.pow(1 - bandPos, 1.5))) * (1 - .5 * Math.pow(Math.max(0, .4 - bandPos) / .4, 1.5));
						const hold = c < bandCols && cellUnit(r, c, 14) < holdChance;
						out.push({
							key: r + "-" + c,
							flashLight: "rgb(" + lc[0] + "," + lc[1] + "," + lc[2] + ")",
							flashDeep: "rgb(" + deep.join(",") + ")",
							animationDelay: flashDelay,
							flashDuration,
							appearDelay,
							hold,
							holdMin: (.06 + .12 * bandPos).toFixed(3),
							holdMid: (.35 + .27 * bandPos).toFixed(3),
							holdDuration: (1.6 + cellUnit(r, c, 9) * 1.8).toFixed(2) + "s",
							holdDelay: (appearMs / 1e3).toFixed(3) + "s",
							fade: fadeAt(fx)
						});
					}
					return out;
				}, [
					inMax,
					grid,
					paletteColors
				]);
				react.useEffect(() => {
					const id = setTimeout(() => setSettledIdx(safePosIdx), 160);
					return () => clearTimeout(id);
				}, [safePosIdx]);
				if (runtimeSessions.subagentAddress(sessionId) !== void 0) return null;
				if (directory === null) return null;
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
					disabled: locked || busyKind === "model",
					title: triggerTitle,
					"aria-haspopup": "menu",
					"aria-expanded": menu === "model",
					onClick: () => setMenu((m) => m === "model" ? null : "model")
				}, react.createElement("span", { className: "sk5-triggerName" }, modelLabel)), reasoning !== void 0 && choices.length > 0 ? react.createElement("button", {
					ref: effortTriggerRef,
					type: "button",
					className: "sk5-trigger sk5-triggerEffort",
					disabled: locked || busy || current === null,
					title: tr("effort.title"),
					"aria-haspopup": "menu",
					"aria-expanded": menu === "effort",
					onClick: () => setMenu((m) => m === "effort" ? null : "effort")
				}, react.createElement("span", {
					key: displayLabel,
					className: "sk5-effortSeat" + (choices.length > 1 && inMax ? " sk5-effortSeatMax" : ""),
					style: { animation: "sk5-nameBlur .28s ease" }
				}, displayLabel)) : null), menu === "model" ? react.createElement("div", {
					className: "sk5-drop sk5-model",
					role: "menu",
					"aria-label": tr("trigger.selectModel")
				}, react.createElement("div", { className: "sk5-modelsTitle" }, tr("menu.models")), react.createElement("div", { className: "sk5-list" }, !loaded && shownError === null ? react.createElement("div", { className: "sk5-status" }, tr("status.loading")) : null, shownError !== null ? react.createElement("div", { className: "sk5-err" }, shownError) : null, loaded && groups.length === 0 ? react.createElement("div", { className: "sk5-status" }, tr("status.noModels")) : null, loaded ? groups.map((g) => react.createElement("div", { key: g.id }, react.createElement("div", { className: "sk5-group" }, g.name), g.models.map((m) => {
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
					ref: effortValueRef,
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
				}), matrixVisible && grid !== null ? (() => {
					const gridStyle = {
						gridTemplateColumns: "repeat(" + grid.c + "," + grid.sq + "px)",
						gridTemplateRows: "repeat(" + grid.r + "," + grid.sq + "px)",
						gap: grid.gap + "px",
						padding: grid.padTop + "px " + grid.padRight + "px " + grid.padBottom + "px " + grid.padLeft + "px",
						justifyContent: "start",
						alignContent: "start"
					};
					return react.createElement("div", {
						className: "sk5-matrix",
						style: gridStyle
					}, matrixCells.map((sq) => react.createElement("div", {
						key: sq.key,
						className: "sk5-cell" + (sq.hold ? " sk5-cellHold" : ""),
						style: sq.hold ? {
							animationName: "sk5-appear, sk5-hold",
							animationDuration: ".6s, " + sq.holdDuration,
							animationDelay: sq.appearDelay + ", " + sq.holdDelay,
							animationIterationCount: "1, infinite",
							animationFillMode: "forwards, none",
							animationTimingFunction: "ease, ease-in-out",
							"--sk5-hold-min": sq.holdMin,
							"--sk5-hold-mid": sq.holdMid
						} : { animationDelay: sq.appearDelay }
					}, react.createElement("div", {
						className: "sk5-sq",
						style: {
							background: "var(--sk5-c-grid,var(--dsw-static-deepseek-500))",
							opacity: sq.fade,
							animationDelay: sq.animationDelay,
							animationDuration: sq.flashDuration,
							borderRadius: grid.radius + "px",
							"--flash-light": sq.flashLight,
							"--flash-deep": sq.flashDeep
						}
					}))));
				})() : null, !inMax ? choices.map((c, i) => react.createElement("span", {
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
