# @domitor-syh/dsh-ui-skin-switcher

Model and reasoning-effort switcher plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH).

Registers a named `conversation.input.model` seat that reads the session's
provider-grouped directory through `session.models` and submits through
`session.selectModel` (the same session-scoped RPC the first-party model
selector uses), so a switch made here is what `/model` shows next and takes
effect on the current session.

Above the ordinary model list it renders a two-level (Off/Max) reasoning-effort
slider for models that declare `reasoningEfforts`, remembering each model's
last effort so switching model and back keeps the effort.

## Install

With the DSH CLI installed:

```sh
dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher
```

Or from this repository (source install — pnpm will run the `prepare` build;
approve it once via `allowBuilds` when prompted):

```sh
dsh plugin --profile web add github:domitor-syh/dsh-ui-skin-switcher
```

Running dsh from a source checkout? Prefix with `pnpm` and run inside the
checkout: `pnpm dsh plugin --profile web add ...`.

## Usage

Open the composer and pick a model from the switcher seat next to the input
box. Models that declare `reasoningEfforts` get a slider underneath: slide to
Max for the animated dot-matrix indicator, or anywhere in between for a fixed
effort level. The choice is remembered per model.

## License

[MIT](./LICENSE)
