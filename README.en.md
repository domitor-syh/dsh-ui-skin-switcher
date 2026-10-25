<h1 align="center">@domitor-syh/dsh-ui-skin-switcher</h1>

<p align="center">
  <img src="docs/README-Banner.jpeg" alt="dsh-ui-skin-switcher" width="100%">
</p>

<p align="center"><a href="./README.md">中文</a> | English</p>

<p align="center">
  <a href="https://awesome-dsh-plugin.com"><img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin"></a>
  <a href="https://awesome-dsh-plugin.com"><img src="https://img.shields.io/endpoint?url=https://awesome-dsh-plugin.com/count.json" alt="listed plugins"></a>
  <a href="https://www.npmjs.com/package/@domitor-syh/dsh-ui-skin-switcher"><img src="https://img.shields.io/npm/v/@domitor-syh/dsh-ui-skin-switcher" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@domitor-syh/dsh-ui-skin-switcher"><img src="https://img.shields.io/npm/dt/@domitor-syh/dsh-ui-skin-switcher" alt="downloads"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"></a>
  <a href="https://github.com/domitor-syh/dsh-ui-skin-switcher/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/domitor-syh/dsh-ui-skin-switcher/ci.yml?branch=main" alt="CI"></a>
</p>

A **Claude Desktop-style switcher** for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) Web GUI: change the model or dial reasoning effort without ever leaving the composer.

## What it is

A **model and reasoning-effort switcher** floating next to the input box: open the dropdown to pick a model, drag the slider to dial reasoning effort — your choice takes effect on the current session right away.

Models are grouped by vendor with a checkmark on the active one, effort levels follow whatever the model itself supports, and each model remembers the level you last picked.

The style pays homage to Claude Desktop's switcher — slider feel, rounded track, hover highlight.

## Features

| Feature | Detail |
| --- | --- |
| Model switching | Clicking the model entry expands the model list ordered by vendor; the selection applies immediately and the matching reasoning effort updates together |
| Effort slider | Supports both click and drag, with multiple effort nodes; supported levels differ per model, and adjustments apply immediately |
| Max-effort dot matrix | Reaching max effort reveals a right-to-left dot-matrix sweep on the track, with the handle glowing |
| Per-model memory | Remembers the last effort per model, kept across switches |
| Theme adaptive | All colors bound to DSH theme tokens; readable in light/dark themes and transparent skins |

## Video preview

<div align="center">

https://github.com/user-attachments/assets/3e60e874-4d08-44b3-be00-5e5ab213187c

</div>

> If the inline video does not play, click the **link below** to watch in a new tab; no GitHub sign-in is required.

**▶︎ [Watch the full demo video](https://cdn.jsdelivr.net/gh/domitor-syh/dsh-ui-skin-switcher@main/docs/dsh-ui-skin-switcher-demo.mp4)** — model switching, the effort slider, and the top-level dot-matrix animation.

## Install

**Web** (`dsh web`):

```sh
dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher
```

**Desktop** (official channel) — paste the following package name into the desktop app's plugin installer to install or update:

```sh
@domitor-syh/dsh-ui-skin-switcher
```

After installing: on Web, restart `dsh web` and refresh the page; on Desktop, restart the app. When running DSH from source, prefix the Web installation command with `pnpm`.

The current adaptation target is **DSH 0.2.1-rc.3**, with a declared compatibility range of `>=0.1.5-alpha.1`. Core API contracts were checked against source for `0.1.5-alpha.1`, `0.2.0-rc.2`, `0.2.1-rc.2`, and `0.2.1-rc.3`; other builds still need confirmation, and future versions have not all been runtime-tested.

## Usage

1. **Pick a model** — click the button and pick from the list; the list is grouped by vendor and the current model shows a checkmark.
2. **Dial effort** — for models providing reasoning-level information, an effort button appears to the right of the model; click it, then drag the slider or tap the track to switch levels.

### Why is there no reasoning-effort switcher after adding a model?

The current model either does not support reasoning effort (`reasoningEfforts`) or has not been configured for it. **DSH 0.2.1-rc.1 and later** let you configure each model's reasoning levels in **Settings → Models**; earlier versions require editing the configuration file. To ensure correct model responses, use the supported levels and values from the model vendor's configuration documentation. You can also give that documentation or its link to an LLM for help configuring them.

> Taking effect: you edit `settings.yaml` under the DSH home (`~/.dsh`) — **not this plugin's files**; DSH watches that file and hot-reloads, so valid changes take effect **immediately with no restart**, update the model list and effort choices, and persist across restarts.

Why follow the vendor's documentation? To keep declarations accurate — **accuracy over coverage**. Supported levels and their values vary by vendor and model. Incorrect values may cause requests to fail or the configuration to have no effect, so we do not fill in a uniform preset.

## License

[MIT](./LICENSE)