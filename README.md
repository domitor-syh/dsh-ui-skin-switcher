<h1 align="center">dsh-ui-skin-switcher · DeepSeek Harness（DSH）模型与思考强度切换器</h1>

<p align="center">
  <img src="docs/README-Banner.jpeg" alt="dsh-ui-skin-switcher" width="100%">
</p>

<p align="center">中文 | <a href="README.en.md">English</a></p>

<p align="center">
  <a href="https://awesome-dsh-plugin.com"><img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin"></a>
  <a href="https://awesome-dsh-plugin.com"><img src="https://img.shields.io/endpoint?url=https://awesome-dsh-plugin.com/count.json" alt="listed plugins"></a>
  <a href="https://www.npmjs.com/package/@domitor-syh/dsh-ui-skin-switcher"><img src="https://img.shields.io/npm/v/@domitor-syh/dsh-ui-skin-switcher" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@domitor-syh/dsh-ui-skin-switcher"><img src="https://img.shields.io/npm/dt/@domitor-syh/dsh-ui-skin-switcher" alt="downloads"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"></a>
  <a href="https://github.com/domitor-syh/dsh-ui-skin-switcher/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/domitor-syh/dsh-ui-skin-switcher/ci.yml?branch=main" alt="CI"></a>
</p>

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web 端打造的 **Claude Desktop 同款风格切换器**：换模型、调思考强度，都不用离开输入框。

<div align="center">

[是什么](#是什么) · [功能特性](#功能特性) · [视频预览](#视频预览) · [安装](#安装) · [使用方法](#使用方法) · [为什么没有思考强度？](#为什么接入模型之后没有思考强度) · [常见问题](#常见问题) · [许可证](#许可证)

</div>

## 是什么

一枚悬在输入框旁的**模型与思考强度切换器**：点开下拉挑模型，拖动滑块调推理力度，选定即刻作用于当前会话。

模型按厂商分组排列，当前使用的那一个带勾选标记；强度档位跟随模型自己的能力，切走再切回，上次的选择还记得。

样式致敬 Claude Desktop 的切换器：滑动手感、圆角轨道、悬停高亮。

## 功能特性

| 能力 | 说明 |
| --- | --- |
| 模型切换 | 点击模型入口将展开按厂商依次排列的模型列表，选定模型后立即生效，对应的思考强度也会同步变更。 |
| 思考强度滑块 | 思考强度滑块支持点击与拖动双操作方式，设有多个强度节点；不同模型适配的强度档位存在差异，调节后立即生效。 |
| 最高强度点阵动画 | 达到最高思考强度时，轨道内浮现从右向左扫过的点阵动画，且滑块伴随着发光 |
| 逐模型记忆 | 记住每个模型最后一次选择的思考强度，切走再切回，强度不丢 |
| 主题自适应 | 全部颜色绑定 DSH 主题变量，深浅主题、透明背景皮肤下都清晰可读 |

## 视频预览

<p align="center">
  <video src="https://github.com/user-attachments/assets/3e60e874-4d08-44b3-be00-5e5ab213187c" controls muted loop playsinline width="100%"></video>
</p>

> 如页面内视频无法播放，请点击**下方链接**，在新标签页中直接观看，无需登录 GitHub。

**▶︎ [点击观看完整演示视频](https://cdn.jsdelivr.net/gh/domitor-syh/dsh-ui-skin-switcher@main/docs/dsh-ui-skin-switcher-demo.mp4)** —— 模型切换、思考强度滑块、最高档点阵动画的完整演示。

## 安装

**Web 端**（`dsh web`）：

```sh
dsh plugin --profile web add @domitor-syh/dsh-ui-skin-switcher
```

**桌面端**（官方渠道）——在桌面应用的插件安装处粘贴以下包名，即可安装或更新：

```sh
@domitor-syh/dsh-ui-skin-switcher
```

安装后：Web 端重启 `dsh web` 并刷新页面；桌面端重启桌面应用。从 DSH 源码运行 Web 安装命令时，在命令前加 `pnpm`。

当前适配目标为 **DSH 0.2.1-rc.2**，声明的兼容范围为 `>=0.1.5-alpha.1`。该范围基于 `0.1.5-alpha.1`、`0.2.0-rc.2` 与 `0.2.1-rc.2` 的核心接口源码核对；其他构建仍需确认兼容性，未来版本也未全部实测。

## 使用方法

1. **切模型**：点击输入框旁的按钮，在列表里选一个模型；列表按厂商分组，当前模型带勾选标记。
2. **调强度**：对提供了思考强度信息的模型，模型右侧会出现思考强度按钮，点击之后——拖动滑块或在轨道上点按即可切换档位。

### 为什么接入模型之后没有思考强度？

这是因为当前模型不支持或尚未配置思考强度（`reasoningEfforts`）。**DSH 0.2.1-rc.1 及更高版本**可在**设置 → 模型**中配置各模型的推理等级；旧版本需自行修改配置文件。为确保模型响应正确，请参照对应厂商的模型配置文档填写支持的档位和值，也可将文档或链接交给大模型协助配置。

> 生效方式：你修改的是 DSH 主目录（`~/.dsh`）下的 `settings.yaml`，**不是本插件的文件**；DSH 会监听该文件并**热加载，立即生效，无需重启**，有效配置会同步到模型列表和强度选项，下次启动依然有效。

为什么要依据厂商文档配置？是为了确保声明的准确——**声明准确 > 声明齐全**。不同厂商、不同模型支持的档位和值可能不同，填写错误可能导致请求失败或配置不生效，因此我们不代填统一档位。

## 常见问题

<details>
<summary><strong>为什么我的模型没有出现思考强度滑块？</strong></summary>

滑块只为提供了推理等级信息的模型显示，未支持或未配置时只显示模型切换按钮。**DSH 0.2.1-rc.1 及更高版本**可在**设置 → 模型**中配置各模型的推理等级；旧版本需自行修改配置文件。为确保模型响应正确，请参照对应厂商的模型配置文档填写支持的档位和值。

</details>

<details>
<summary><strong>切换主题后切换器颜色不对？</strong></summary>

插件颜色全部绑定 DSH 主题变量（`--dsw-alias-*`），随深浅主题自动翻转。若你用了把背景设成透明的皮肤，浮层会自动启用毛玻璃（backdrop-filter）保住可读性。

</details>

## 许可证

[MIT](./LICENSE)