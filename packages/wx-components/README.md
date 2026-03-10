# @xkfe/wx-components

微信小程序组件仓库 - 提供可复用的微信小程序组件

[![npm version](https://img.shields.io/npm/v/@xkfe/wx-components.svg)](https://www.npmjs.com/package/@xkfe/wx-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 安装

### 通过 CLI 安装（推荐）

```bash
# 在小程序项目根目录执行
npx @xkfe/wx-cli add button
```

### 手动安装

```bash
npm install @xkfe/wx-components
```

## 使用方法

### 1. 复制组件到项目

组件位于 `node_modules/@xkfe/wx-components/` 目录下，将需要的组件复制到项目的 `components/` 目录。

### 2. 注册组件

在 `app.json` 或页面 `.json` 中注册：

```json
{
  "usingComponents": {
    "button": "/components/button/button"
  }
}
```

## 组件规范

每个组件包含以下文件：

```
{component-name}/
├── meta.json          # 组件元信息（必须）
├── README.md          # 组件文档（必须）
├── {name}.js          # 组件逻辑
├── {name}.json        # 组件配置
├── {name}.wxml        # 组件模板
└── {name}.wxss        # 组件样式
```

### meta.json 示例

```json
{
  "name": "button",
  "displayName": "按钮",
  "description": "Button 按钮，支持自定义大小、颜色等",
  "version": "1.0.0",
  "category": "basic",
  "dependencies": [],
  "config": {
    "usingComponents": {
      "button": "/components/button/button"
    }
  }
}
```

**category 分类：**
- `basic` - 基础类组件
- `form` - 表单类组件
- `navigation` - 导航类组件
- `layout` - 布局类组件
- `feedback` - 反馈类组件

## 许可证

MIT

## 相关链接

- [GitHub 仓库](https://github.com/xkfe-templates/wx-program)
- [问题反馈](https://github.com/xkfe-templates/wx-program/issues)
- [组件规范文档](./COMPONENT_SPEC.md)
