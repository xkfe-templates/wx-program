# 组件元信息规范文档

## 概述

每个组件必须包含一个 `meta.json` 文件，用于描述组件的基本信息、依赖关系和配置要求。CLI 工具通过读取此文件来完成组件的发现、展示和安装。

## meta.json Schema

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 组件标识符，与目录名一致，如 `"custom-navbar"` |
| `displayName` | string | 是 | 中文显示名，如 `"自定义导航栏"` |
| `description` | string | 是 | 组件功能描述 |
| `version` | string | 是 | 语义化版本号，如 `"1.0.0"` |
| `category` | string | 是 | 组件分类，可选值见下方 |
| `dependencies` | string[] | 是 | 依赖的其他组件 name 数组，无依赖时为 `[]` |
| `miniprogram.minVersion` | string | 否 | 最低基础库版本要求，如 `"2.6.0"` |
| `config.usingComponents` | object | 是 | 需要注入到 app.json 或页面 json 的组件引用声明 |

### category 可选值

| 值 | 说明 |
|----|------|
| `basic` | 基础类组件 |
| `form` | 表单类组件 |
| `data` | 数据类组件 |
| `navigation` | 导航类组件 |
| `layout` | 布局类组件 |
| `feedback` | 反馈类组件（弹窗、提示等） |

## 示例

```json
{
  "name": "button",
  "displayName": "按钮",
  "description": "Button 按钮，支持自定义大小、颜色等",
  "version": "1.0.0",
  "category": "basic",
  "dependencies": [],
  "miniprogram": {
    "minVersion": ""
  },
  "config": {
    "usingComponents": {
      "button": "/components/button/button"
    }
  }
}
```

## 组件目录结构

每个组件独立存放在以组件 `name` 命名的目录中：

```
{component-name}/
├── meta.json                    # 元信息（必须）
├── README.md                    # 组件文档（必须）
├── {component-name}.js          # 组件逻辑
├── {component-name}.json        # 组件配置
├── {component-name}.wxml        # 组件模板
└── {component-name}.wxss        # 组件样式
```
