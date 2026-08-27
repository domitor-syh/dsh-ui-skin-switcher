# dsh-ui-skin-switcher · DeepSeek Harness（DSH）模型与思考强度切换器

中文 | [English](README.en.md)

一个为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web 端打造的、**Claude Desktop 同款风格的切换器**插件：把模型选择与思考强度（推理力度）切换做成输入框旁的一枚悬浮「座位」，下拉选模型、滑动调强度，一键到位。

<div align="center">

[是什么](#是什么) · [功能特性](#功能特性) · [界面预览](#界面预览) · [快速上手](#快速上手) · [使用方法](#使用方法) · [常见问题](#常见问题) · [许可证](#许可证)

</div>

## 是什么

`dsh-ui-skin-switcher` 是 DeepSeek Harness 的 Web 端插件，注册 `conversation.input.model` 插件槽，在输入框旁渲染一枚模型 + 思考强度的切换器「座位」。

它与官方第一方模型选择器走**同一条通道**：通过 `session.models` 读取按 provider 分组的模型目录，通过 `session.selectModel` 提交选择——在这里切换后的结果，就是 `/model` 面板里看到的结果，并立即作用于当前会话。

样式致敬 Claude Desktop 的切换器：滑动手感、圆角轨道、悬停高亮，都是熟悉的味道。

## 功能特性

| 能力 | 说明 |
| --- | --- |
| 模型切换 | 悬浮座位拉开下拉菜单，按 provider 分组浏览全部模型，一键切换 |
| 思考强度滑块 | 对声明了 `reasoningEfforts` 的模型，在模型列表上方给出 Off/Max 两档强度滑块 |
| Max 点阵动画 | 滑到最高思考强度时，轨道内浮现从右向左扫过的点阵动画（Claude Desktop 同款视觉） |
| 逐模型记忆 | 记住每个模型最后一次选择的思考强度，切走再切回，强度不丢 |
| 主题自适应 | 全部颜色绑定 DSH 主题变量，深浅主题、透明背景皮肤下都清晰可读 |

## 界面预览

**整体外观**——输入框旁的模型 + 思考强度切换座位：

![整体外观](docs/screenshots/01-overall.png)

**模型切换器**——按 provider 分组的下拉菜单：

![模型切换器](docs/screenshots/02-model-switcher.png)

**普通思考强度切换器**——Off/Max 两档滑块：

![普通思考强度切换器](docs/screenshots/03-effort-normal.png)

**最高思考强度切换器**——滑到 Max 触发点阵扫过动画：

![最高思考强度切换器](docs/screenshots/04-effort-max.png)

## 快速上手

### 系统要求

- 已安装 DeepSeek Harness，`dsh web` 可正常启动。
- npm 安装无额外要求；从仓库安装需要 Node.js >= 22 与 pnpm。

### 安装（npm，推荐）

```sh
dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher
```

然后重启 `dsh web`，输入框旁即出现切换器座位。

### 从仓库安装（GitHub 源码）

```sh
dsh plugin --profile web add github:domitor-syh/dsh-ui-skin-switcher
```

> GitHub 安装拉取的是源码，会运行本仓库的 `prepare` 脚本现场构建。首次安装时 pnpm 会出于安全拦截构建脚本，按提示把打印出来的键加入该 profile 的 `pnpm-workspace.yaml` 的 `allowBuilds` 白名单后，重新执行即可。

从源码 checkout 运行 DSH？在仓库根目录改用 `pnpm dsh plugin --profile web add ...`。

### 验证与卸载

装好重启 `dsh web`，输入框旁出现切换器座位即为生效；也可以用 `dsh --profile web --dump-config` 确认插件配置层已挂载。

卸载：`dsh plugin --profile web remove @domitor-syh/dsh-ui-skin-switcher`，然后重启 `dsh web`。

## 使用方法

1. **切模型**：点击输入框旁的座位，在下拉菜单里选一个模型；菜单按 provider 分组，当前模型带勾选标记。
2. **调强度**：对声明了 `reasoningEfforts` 的模型，菜单上方出现 Off/Max 滑块——拖动滑块或在轨道上点按即可切换档位。
3. **看反馈**：滑到 Max 时轨道内亮起从右向左扫过的点阵动画，拖动过程中滑块带 0.5 秒光晕渐隐，手感顺滑。

## 常见问题

<details>
<summary><strong>为什么我的模型没有出现思考强度滑块？</strong></summary>

滑块只为声明了 `reasoningEfforts` 的模型显示。模型目录里没有该声明说明这台模型不支持（或未配置）推理力度切换，此时只显示模型列表。

</details>

<details>
<summary><strong>切换主题后切换器颜色不对？</strong></summary>

插件颜色全部绑定 DSH 主题变量（`--dsw-alias-*`），随深浅主题自动翻转。若你用了把背景设成透明的皮肤，浮层会自动启用毛玻璃（backdrop-filter）保住可读性。

</details>

<details>
<summary><strong>为什么滑到 Max 又拖回来，光晕是渐隐的？</strong></summary>

这是刻意做的 0.5 秒过渡：脱离最高档时蓝光在 0.5 秒内平滑收敛，而不是突兀消失。

</details>

## 许可证

[MIT](./LICENSE)