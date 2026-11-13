# 更新日志 / Changelog

本插件遵循[语义化版本](https://semver.org/lang/zh-CN/)。点开对应版本的 Release 或本文件的版本标题，即可查看该版本改了什么。

This project follows [Semantic Versioning](https://semver.org/). Pick a version below to see what changed.

## [0.3.1] — 2026-11-13

**中文**

- 插件列表与设置页的显示名称、简介随 DSH 界面语言切换（`locale/zh.json`、`locale/en.json` 的 `meta.title` / `meta.description`）。
- 详情页的说明文档随界面语言切换：中文读 `README.md`，英文读 `README.en.md`（`meta.detail`）。
- 插件设置区新增「跟随DSH系统界面语言」开关（默认关闭）：关闭时弹窗（模型、Effort、Faster、Smarter、思考强度等）一律英文；开启时仅当 DSH 界面为中文才显示中文，其它语言一律英文。详情页本身始终跟随 DSH 语言，不受此开关影响。
- 弹窗内的「Effort」标题与「Faster / Smarter」两端文案随语言切换（中文为「思考强度」「更快 / 更聪明」），英文标题保持 “Effort”。
- 修复开关已保存、刷新后弹窗仍为英文：聊天页启动时直接读取设置镜像，语言识别在 locale 服务不可用时回退到 `<html lang>`。
- 详情页的两个开关改用宿主同款样式：36×20 胶囊 + 16px 圆形滑块，浅色开启为深底浅钮，深色相反。
- 补充第三方字体声明：界面内嵌的 Space Grotesk 以 SIL OFL 1.1 分发，完整许可见 `LICENSES/SpaceGrotesk-OFL.txt`。

**English**

- The plugin list and Settings now show a display name and description in the DSH interface language (`meta.title` / `meta.description` in `locale/zh.json` and `locale/en.json`).
- The bundle detail document follows the interface language: Chinese reads `README.md`, English reads `README.en.md` (`meta.detail`).
- Added the "Follow the DSH interface language" switch in the plugin settings (off by default): while off the popover (model, Effort, Faster, Smarter, reasoning-effort help) stays English; while on it shows Chinese only for a Chinese DSH interface and English for every other language. The bundle page itself always follows the DSH language and is unaffected.
- The popover title "Effort" and the "Faster / Smarter" slider ends follow the language too (Chinese: 思考强度, 更快 / 更聪明); the English title stays "Effort".
- Fixed the switch being saved while the popover stayed English after a reload: the chat now reads the stored preference from the settings mirror at startup, and language detection falls back to `<html lang>` when the locale service is unavailable.
- Both switches on the detail page now use the host switch: a 36×20 pill with a 16px thumb, dark fill with a light thumb when on in light mode, reversed in dark mode.
- Added a third-party font notice: the embedded Space Grotesk is distributed under the SIL OFL 1.1; the full licence is in `LICENSES/SpaceGrotesk-OFL.txt`.

## [0.3.0] — 2026-11-12

**中文**

- 新增「颜色切换器」（插件详情页）：可调主色并自动派生其余五项（弹层档位值、档位圆点、滑块把手、滑块外发光、点阵底色、点阵闪烁），派生在 OKLab 感知空间完成；主色保持 `#679EFE` 时与旧版配色逐位一致。
- 支持「逐项自定义配色」：六项可分别取色，留空项继续跟随主色；调整即时预览，点「应用」后写入插件配置，重启后保留。
- 新增「重置颜色」按钮与「最高思考强度文字跟随档位值颜色」开关。
- 取色器：色相条 + 饱和度/明度区 + 色码输入（#RGB / #RRGGBB / #RRGGBBAA）；滑块改用 SVG 圆；「应用」使用宿主主按钮令牌；配色区块跟随系统明暗主题。
- 最高思考强度点阵动画：从右向左扫过，前沿带噪声；噪声在轨道左侧 1/3 停住并持续闪烁，密度从左到右渐稀，明暗深度随密度递减。
- 修复浅色模式下滑块手柄多出的投影；修复色相滑块拖到最右端会回弹。
- 适配目标为 DSH `0.2.2-rc.1`，兼容范围 `>=0.1.5-alpha.1`。

**English**

- Added the colour switcher on the plugin detail page: one main colour derives the other five slots (effort value, effort dot, slider handle, slider glow, dot-matrix base, matrix flash) in OKLab space; keeping `#679EFE` reproduces the previous palette byte for byte.
- "Customise each slot" lets all six colours be picked independently; cleared slots keep following the main colour. Edits preview live and are written to the plugin configuration when applied, so they survive a restart.
- Added "Reset colours" and the "Top-effort text follows the effort-value colour" switch.
- Picker: hue bar, saturation/brightness field and a hex field (#RGB / #RRGGBB / #RRGGBBAA); thumbs are SVG circles; Apply uses the host primary-button tokens; the colour section follows the host light/dark appearance.
- Max-effort dot-matrix animation: a right-to-left sweep with a noisy front; the noise stops on the left third of the track and keeps flickering, thinning out towards the junction with a matching dim-depth ramp.
- Fixed the extra slider-handle shadow in light mode and the hue thumb snapping back at the far right.
- Adapts to DSH `0.2.2-rc.1`; supported range `>=0.1.5-alpha.1`.

## [0.2.6] — 2026-10-26

**中文**

- 新增本更新日志，并在发布包中一同分发。
- 模型座位与思考强度座位改用与弹层一致的字体（Space Grotesk）；该字体只含拉丁字符，中文自动回退到官方座位所用的宿主字体，不会出现缺字。
- 思考强度座位由品牌蓝改为灰色（对齐官方模型座位的强度文案配色），并加粗到 600。
- 模型名与思考强度之间的间距由约 18px 收紧到 12px；按钮高度、圆角与内边距不变，悬停高亮仍各自独立。
- 弹层内 `Effort`、`Faster`、`Smarter` 的文字灰阶调淡一档；档位数值仍是主色。
- 适配目标更新为 DSH `0.2.1-rc.3`；兼容范围保持 `>=0.1.5-alpha.1`。

**English**

- Added this changelog and ship it inside the published package.
- Both seats now use the popup's typeface (Space Grotesk). That face covers Latin only, so Chinese text falls back to the host font the official seat uses — no missing glyphs.
- The effort seat switched from brand blue to the gray used by the official seat's effort caption, and is now weight 600.
- Tightened the gap between model name and effort from about 18px to 12px. Button height, radius and padding are unchanged, and each hover highlight stays independent.
- Popup `Effort`, `Faster` and `Smarter` labels are one step lighter gray; the value itself keeps the primary color.
- Adaptation target is now DSH `0.2.1-rc.3`; the supported range stays `>=0.1.5-alpha.1`.

## [0.2.5] — 2026-10-18

**中文**

- 修复思考强度档位文字在不同字体间切换（例如 `Max` 与中文「默认」）时的上下偏移：改为按当前平台字体实测的行高固定文字行高，按钮与弹层不再随着字号回退而升降。
- 调整思考强度时只让强度按钮进入忙碌状态，模型入口不再跟着变暗；模型列表项在请求完成前仍不可选，避免两个切换请求互相覆盖。

**English**

- Fixed vertical shifting when effort labels switch between Latin and fallback fonts (for example `Max` versus the Chinese default). Each label now pins the line box measured from the current platform's own font, so neither the trigger nor the popup moves.
- An effort change now only puts the effort trigger in its busy state; the model trigger no longer dims. Model rows stay disabled until the request settles, so two selections cannot overwrite each other.

## [0.2.4] — 2026-10-18

**中文**

- 修复与 DSH 0.2.1 官方模型选择器重复声明 `conversation.input.model.label` 子插槽导致的加载失败；同时改回显示模型目录提供的原名，不再声明官方已占用的子插槽。
- 修复模型列表加载完成后，切换模型失败的错误提示被隐藏的问题。
- 兼容范围恢复为 `>=0.1.5-alpha.1`，同时兼容旧版 `select()` 返回 `void`／抛错与新版的结果信封；已用 `0.1.5-alpha.1`、`0.2.0-rc.2`、`0.2.1-rc.2`、`0.2.1-rc.3` 的真实插槽实现验证注册与卸载。
- 移除已废弃的 invariant 机制；桌面端改为通过插件界面安装与更新。

**English**

- Fixed a load failure caused by declaring the same `conversation.input.model.label` child slot that the official DSH 0.2.1 selector already owns. The switcher now shows the catalog's original model name and leaves that child slot alone.
- Fixed the selection error being hidden once the model list finished loading.
- Restored the `>=0.1.5-alpha.1` compatibility range and handled both the legacy `select()` (returns `void` or throws) and the newer result envelope. Registration and unload were verified against the real slot implementations of `0.1.5-alpha.1`, `0.2.0-rc.2`, `0.2.1-rc.2` and `0.2.1-rc.3`.
- Removed the retired invariant mechanism; Desktop installs and updates through the plugin UI.

## [0.2.3] — 2026-10-02

**中文**

- 适配 DSH `0.2.0-rc.2`，使其能正常加载。

**English**

- Adapted to DSH `0.2.0-rc.2` so the plugin loads again.