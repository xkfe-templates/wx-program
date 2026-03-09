# wx-program

微信小程序开发工具集 - 包含 CLI 脚手架、项目模板和组件库

[![npm version](https://img.shields.io/npm/v/@xkfe/wx-cli.svg)](https://www.npmjs.com/package/@xkfe/wx-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 项目架构

```
wx-program/
├── packages/
│   ├── wx-cli/          # CLI 工具 - 项目初始化和组件管理
│   ├── wx-template/     # 微信小程序基础模板
│   └── wx-components/   # 微信小程序组件库
```

## 功能特性

### @xkfe/wx-cli
- 🚀 **项目初始化** - 快速创建微信小程序项目
- 📦 **组件管理** - 交互式搜索、安装和更新组件
- 🎨 **现代化交互** - 使用 @clack/prompts 提供友好的命令行界面

### @xkfe/wx-template
- 📱 微信小程序标准项目结构
- 🎯 包含常用页面和组件示例
- 📋 完整的项目配置文件

### @xkfe/wx-components
- 🧩 **modal** - 模态框组件
- 📜 **virtual-list** - 虚拟列表组件（高性能长列表渲染）
- 🔍 组件注册表管理，支持动态发现

## 安装使用

### 全局安装 CLI 工具

```bash
npm install -g @xkfe/wx-cli
```

### 创建新项目

```bash
# npx @xkfe/wx-cli init my-project 不安装脚手架直接初始化
wx-cli init my-miniprogram
```

### 添加组件到项目

```bash
cd my-miniprogram
wx-cli add
```

### 查看帮助

```bash
wx-cli --help
```

## 开发指南

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
# 构建所有包
pnpm -r build

# 开发模式（监听变化）
cd packages/wx-cli
pnpm dev
```

### 链接本地 CLI 进行测试

```bash
cd packages/wx-cli
pnpm link --global

# 现在可以在任何地方使用 wx-cli 命令
wx-cli --help
```

## 版本发布流程

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本和发布。

### 发布步骤

1. **添加变更集**
   ```bash
   pnpm changeset
   ```
   选择变更的包和版本类型（patch/minor/major），输入变更描述。

2. **版本提升**
   ```bash
   pnpm changeset version
   ```
   自动更新版本号和依赖关系。

3. **构建 CLI**
   ```bash
   cd packages/wx-cli
   pnpm build
   ```

4. **发布到 npm**
   ```bash
   pnpm changeset publish
   ```
   按依赖顺序自动发布所有包。

### 发布顺序

```
wx-template → wx-components → wx-cli
```

Changesets 会自动处理包之间的依赖关系，确保按正确顺序发布。

## 包说明

| 包名 | 描述 |
|------|------|
| [@xkfe/wx-cli](https://www.npmjs.com/package/@xkfe/wx-cli) | CLI 工具 |
| [@xkfe/wx-template](https://www.npmjs.com/package/@xkfe/wx-template) | 项目模板 |
| [@xkfe/wx-components](https://www.npmjs.com/package/@xkfe/wx-components) | 组件库 |

## 技术栈

- **CLI 框架**: [Commander.js](https://github.com/tj/commander.js/)
- **交互提示**: [@clack/prompts](https://github.com/natemoo-re/clack)
- **颜色输出**: [picocolors](https://github.com/alexeyraspopov/picocolors)
- **构建工具**: [tsup](https://github.com/egoist/tsup)
- **包管理**: [pnpm](https://pnpm.io/) + workspaces
- **版本管理**: [Changesets](https://github.com/changesets/changesets)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
