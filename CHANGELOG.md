# 更新日志 / Changelog

本插件遵循[语义化版本](https://semver.org/lang/zh-CN/)。点开对应版本的 Release 或本文件的版本标题，即可查看该版本改了什么。

This project follows [Semantic Versioning](https://semver.org/). Pick a version below to see what changed.

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