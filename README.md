<h1 align="center">dsh-ui-skin-switcher · DeepSeek Harness（DSH）模型与思考强度切换器</h1>

<p align="center">
  <img src="docs/README-Banner.jpeg" alt="dsh-ui-skin-switcher" width="100%">
</p>

<p align="center">中文 | <a href="README.en.md">English</a></p>

一个为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web 端打造的、**Claude Desktop 同款风格的切换器**插件：把模型选择与思考强度（推理力度）切换做成输入框旁的一枚悬浮「座位」，下拉选模型、滑动调强度，一键到位。

<div align="center">

[是什么](#是什么) · [功能特性](#功能特性) · [界面预览](#界面预览) · [快速上手](#快速上手) · [使用方法](#使用方法) · [为什么没有思考强度？](#为什么接入模型之后没有思考强度) · [常见问题](#常见问题) · [许可证](#许可证)

</div>

## 是什么

`dsh-ui-skin-switcher` 是 DeepSeek Harness 的 Web 端插件，注册 `conversation.input.model` 插件槽，在输入框旁渲染一枚模型 + 思考强度的切换器「座位」。

它与官方第一方模型选择器走**同一条通道**：通过 `session.models` 读取按 provider 分组的模型目录，通过 `session.selectModel` 提交选择——在这里切换后的结果，就是 `/model` 面板里看到的结果，并立即作用于当前会话。

样式致敬 Claude Desktop 的切换器：滑动手感、圆角轨道、悬停高亮，都是熟悉的味道。

## 功能特性

| 能力 | 说明 |
| --- | --- |
| 模型切换 | 点击模型入口将展开按厂商依次排列的模型列表，选定模型后立即生效，对应的思考强度也会同步变更。 |
| 思考强度滑块 | 思考强度滑块支持点击与拖动双操作方式，设有多个强度节点；不同模型适配的强度档位存在差异，调节后立即生效。 |
| 最高强度点阵动画 | 达到最高思考强度时，轨道内浮现从右向左扫过的点阵动画，且滑块伴随着发光 |
| 逐模型记忆 | 记住每个模型最后一次选择的思考强度，切走再切回，强度不丢 |
| 主题自适应 | 全部颜色绑定 DSH 主题变量，深浅主题、透明背景皮肤下都清晰可读 |

## 界面预览

**整体外观**——输入框旁的模型 + 思考强度切换按钮：

![整体外观](docs/screenshots/01-overall.png)

**模型切换器**——按不同厂商分组的模型列表：

![模型切换器](docs/screenshots/02-model-switcher.png)

**普通思考强度**——切换器样式：

![普通思考强度切换器](docs/screenshots/03-effort-normal.png)

**最高思考强度**——切换器样式(触发点阵动画)：

![最高思考强度切换器](docs/screenshots/04-effort-max.png)

## 快速上手

### 系统要求

- 已安装 DeepSeek Harness，`dsh web` 可正常启动。
- npm 安装无额外要求；从源码运行需要 Node.js >= 22 与 pnpm。

### 安装（npm，推荐）

```sh
dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher
```

然后重启 `dsh web`，输入框旁即出现切换器按钮。

从源码运行 DSH？在仓库根目录，用「启动命令 + `dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher`」即可，例如：

```sh
# 平时启动
pnpm dsh web
# 添加插件
pnpm dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher
```

### 验证与卸载

装好重启 `dsh web`，输入框旁出现切换器按钮即刻生效；也可以用 `dsh --profile web --dump-config` 确认插件配置层已挂载。

卸载(如从源码启动，请用同安装的方式去卸载)：`dsh plugin --profile web remove @domitor-syh/dsh-ui-skin-switcher`，然后重启 `dsh web`。

## 使用方法

1. **切模型**：点击输入框旁的按钮，在列表里选一个模型；列表按厂商分组，当前模型带勾选标记。
2. **调强度**：对声明了 `reasoningEfforts` 的模型，模型右侧会出现思考强度按钮，点击之后——拖动滑块或在轨道上点按即可切换档位。

### 为什么接入模型之后没有思考强度？

这是因为当前模型没有声明思考强度（`reasoningEfforts`）或识图能力。为了确保声明的准确，我们没有为所有模型设定统一的思考强度档位——请自行前往该模型所属厂商的官方文档查阅，并修改底层配置文件补上声明；或者直接把厂商的深度思考文档（或文档链接）发给大模型，让它替你直接修改。

> 生效方式：你修改的是 DSH 主目录（`~/.dsh`）下的 `settings.yaml`，**不是本插件的文件**；DSH 会监听该文件并**热加载，立即生效，无需重启**，下次启动依然有效。

为什么要由你自己适配？是为了确保声明的准确——**声明准确 > 声明齐全**。思考强度是每档一个厂商私有线级值，填错会让请求静默失效，所以我们不代填统一档位。

## 常见问题

<details>
<summary><strong>为什么我的模型没有出现思考强度滑块？</strong></summary>

滑块只为声明了 `reasoningEfforts` 的模型显示。模型目录里没有该声明说明这台模型不支持（或未配置）推理力度切换，此时只显示模型列表。

</details>

<details>
<summary><strong>切换主题后切换器颜色不对？</strong></summary>

插件颜色全部绑定 DSH 主题变量（`--dsw-alias-*`），随深浅主题自动翻转。若你用了把背景设成透明的皮肤，浮层会自动启用毛玻璃（backdrop-filter）保住可读性。

</details>

## 许可证

[MIT](./LICENSE)