# @xkfe/wx-template

微信小程序基础项目模板

[![npm version](https://img.shields.io/npm/v/@xkfe/wx-template.svg)](https://www.npmjs.com/package/@xkfe/wx-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 功能特性

- 📱 **标准结构** - 微信小程序官方推荐的项目结构
- 🎯 **开箱即用** - 包含常用页面和组件示例
- 📋 **完整配置** - 预置 project.config.json 等配置文件
- 🎨 **样式规范** - 提供 CSS 变量和公共样式

## 项目结构

```
.
├── app.js                 # 小程序逻辑
├── app.json               # 小程序公共配置
├── app.wxss               # 小程序公共样式
├── project.config.json    # 项目配置文件
├── project.private.config.json  # 私有项目配置
├── sitemap.json           # 站点地图配置
├── assets/                # 静态资源目录
│   └── images/           # 图片资源
├── components/           # 公共组件目录
├── pages/                # 页面目录
├── styles/              # 公共样式
│   ├── common.wxss     # 通用样式
│   └── variable.wxss   # CSS 变量定义
└── utils/               # 工具函数
    └── util.js         # 常用工具函数
```

## 安装

### 通过 CLI 初始化（推荐）

```bash
npx @xkfe/wx-cli init my-project
```

CLI 会自动：
- 复制模板文件到目标目录
- 更新 `project.config.json` 中的项目名
- 询问是否添加组件

### 手动安装

```bash
npm install @xkfe/wx-template
```

模板文件位于 `node_modules/@xkfe/wx-template/` 目录下，将所需文件复制到你的项目目录。

## 依赖说明

本模板不依赖任何运行时 npm 包，所有功能使用微信小程序原生 API 实现。

## 许可证

MIT

## 相关链接

- [GitHub 仓库](https://github.com/xkfe-templates/wx-program)
- [问题反馈](https://github.com/xkfe-templates/wx-program/issues)
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
