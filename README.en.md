# @domitor-syh/dsh-ui-skin-switcher

[中文](./README.md) | English

A **Claude Desktop-style switcher** plugin for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) Web GUI: a floating "seat" next to the input box for picking a model and dialing reasoning effort — dropdown for models, slider for effort.

## What it is

`dsh-ui-skin-switcher` registers the `conversation.input.model` slot and renders a model + reasoning-effort switcher seat next to the composer input.

It rides the exact same channel the first-party selector uses: it reads the provider-grouped model directory through `session.models` and submits through `session.selectModel`, so a switch made here is what `/model` shows next and takes effect on the current session.

The style pays homage to Claude Desktop's switcher — slider feel, rounded track, hover highlight.

## Features

| Feature | Detail |
| --- | --- |
| Model switching | Dropdown grouped by provider, one-click switch |
| Effort slider | Off/Max two-level slider for models that declare `reasoningEfforts` |
| Max dot matrix | Right-to-left dot-matrix sweep on the track at max effort (Claude Desktop-style) |
| Per-model memory | Remembers the last effort per model, kept across switches |
| Theme adaptive | All colors bound to DSH theme tokens; readable in light/dark themes and transparent skins |

## Screenshots

**Overall** — the seat next to the input box:

![Overall](docs/screenshots/01-overall.png)

**Model switcher** — provider-grouped dropdown:

![Model switcher](docs/screenshots/02-model-switcher.png)

**Effort switcher (normal)** — Off/Max slider:

![Effort switcher normal](docs/screenshots/03-effort-normal.png)

**Effort switcher (max)** — max level triggers the dot-matrix sweep:

![Effort switcher max](docs/screenshots/04-effort-max.png)

## Install

With the DSH CLI installed:

```sh
dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher
```

Or from this repository (source install — pnpm runs the `prepare` build; approve it once via `allowBuilds` when prompted):

```sh
dsh plugin --profile web add github:domitor-syh/dsh-ui-skin-switcher
```

Running dsh from a source checkout? Use `pnpm dsh plugin --profile web add ...` inside the checkout.

Restart `dsh web` — the seat appears next to the input box. Verify with `dsh --profile web --dump-config`; remove with `dsh plugin --profile web remove @domitor-syh/dsh-ui-skin-switcher`.

## Usage

1. **Pick a model** — click the seat and choose from the provider-grouped menu.
2. **Dial effort** — for models declaring `reasoningEfforts`, an Off/Max slider appears above the list; drag or tap the track.
3. **Feedback** — Max triggers the dot-matrix sweep; dragging off has a 0.5s glow fade.

## License

[MIT](./LICENSE)