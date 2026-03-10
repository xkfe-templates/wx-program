# @xkfe/wx-cli

微信小程序 CLI 工具 - 模板初始化与组件管理

[![npm version](https://img.shields.io/npm/v/@xkfe/wx-cli.svg)](https://www.npmjs.com/package/@xkfe/wx-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 功能特性

- 🚀 **项目初始化** - 快速创建微信小程序项目
- 📦 **组件管理** - 交互式搜索、安装和更新组件
- 🎨 **现代化交互** - 使用 @clack/prompts 提供友好的命令行界面
- ⚡ **轻量快速** - 基于 Node.js 18+，启动迅速

## 安装

### 全局安装（推荐）

```bash
npm install -g @xkfe/wx-cli
# 或
pnpm add -g @xkfe/wx-cli

### 使用 npx（无需安装）

```bash
npx @xkfe/wx-cli init my-project
```

## 使用方法

### 初始化项目

```bash
# 交互式创建
wx-cli init

# 指定项目名称
wx-cli init my-miniprogram
```

**执行后会：**
- 提示输入项目名称
- 检查目录是否存在
- 复制模板文件
- 自动更新 project.config.json 中的项目名
- 询问是否立即添加组件

### 添加组件

```bash
# 在项目根目录执行
wx-cli add

# 直接指定组件名
wx-cli add button
```

## 查看帮助

```bash
wx-cli --help
```

## 命令详解

```bash
wx-cli init [project-name]
# 初始化一个新的微信小程序项目。参数：
project-name (可选) - 项目名称，不传则交互式输入
```