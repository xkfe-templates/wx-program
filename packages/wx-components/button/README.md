# Button 按钮

## 概述

Button 按钮组件，支持自定义大小、颜色、类型等，兼容小程序原生按钮的开放能力。

## 引入

### 页面局部引入

在页面 `.json` 配置文件中引入：

```json
{
  "navigationBarTitleText": "按钮",
  "usingComponents": {
    "button": "/components/button/button"
  }
}
```

### 全局引入

在根目录 `app.json` 文件中全局引入：

```json
{
  "usingComponents": {
    "button": "/components/button/button"
  }
}
```

## 代码演示

### 基础使用

通过 `text` 属性设置按钮显示文本，或者直接使用 slot：

```html
<button text="默认按钮"></button>
<button>默认按钮</button>
```

### 按钮类型

通过 `type` 属性设置按钮的类型，不传值则默认为 `primary`：

```html
<button type="primary">主要按钮</button>
<button type="success">成功按钮</button>
<button type="warning">警告按钮</button>
<button type="danger">危险按钮</button>
<button type="purple">紫色按钮</button>
<button type="gray">灰色按钮</button>
<button type="link">链接按钮</button>
```

### 禁用状态

通过 `disabled` 属性设置按钮是否禁用，`disabledBackground` 属性设置禁用状态下背景色，`disabledColor` 属性设置禁用状态下字体颜色：

```html
<button disabled>禁用按钮</button>
<button disabled loading>禁用加载中</button>
<button disabled disabledBackground="#F8F8F8" disabledColor="#CCCCCC">自定义禁用样式</button>
```

### 按钮大小

通过 `btnSize` 属性设置按钮大小，可选值：`medium`、`small`、`mini`，优先级高于 `width` 和 `height` 属性：

```html
<button btnSize="medium">中等按钮</button>
<button btnSize="small">小型按钮</button>
<button btnSize="mini">迷你按钮</button>
```

### 按钮形状

通过 `radius` 属性设置按钮圆角大小，从而控制按钮形状：

```html
<button radius="0">方形按钮</button>
<button radius="96rpx">圆形按钮</button>
```

### 自定义颜色

通过 `background` 属性设置按钮背景色，`color` 属性设置按钮文字颜色，`borderColor` 属性设置按钮边框颜色：

```html
<button background="#fff" color="#465CFF" borderColor="#465CFF">朴素按钮</button>
<button background="#FF6B6B" color="#fff">自定义背景色</button>
```

### 镂空按钮

通过 `plain` 属性设置镂空按钮样式：

```html
<button type="primary" plain>镂空按钮</button>
<button type="danger" plain>危险镂空</button>
```

## Slots

| 插槽名称 | 说明 |
|---------|------|
| default | 标签内显示内容，与 text 属性互斥 |

## Props

| 属性名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| type | String | 按钮类型：`primary`、`success`、`warning`、`danger`、`link`、`purple`、`gray` | primary |
| background | String | 按钮背景色，传入时 type 失效 | - |
| text | String | 按钮显示文本 | - |
| color | String | 按钮字体颜色 | #fff |
| disabledBackground | String | 禁用状态下背景色 | - |
| disabledColor | String | 禁用状态下字体颜色 | - |
| borderWidth | String | 按钮边框宽度 | 1px |
| borderColor | String | 按钮边框颜色 | - |
| btnSize | String | 按钮大小：`medium`、`small`、`mini`，优先级高于 width/height | - |
| width | String | 按钮宽度 | 100% |
| height | String | 按钮高度 | - |
| size | Number/String | 字体大小，单位 rpx | - |
| bold | Boolean | 字体是否加粗 | false |
| margin | String | margin 值 | 0 |
| radius | String | 圆角大小 | - |
| plain | Boolean | 是否镂空 | false |
| disabled | Boolean | 是否禁用 | false |
| loading | Boolean | 是否显示加载图标 | false |
| formType | String | 参考小程序官方按钮 formType 属性 | - |
| openType | String | 参考小程序官方按钮 openType 属性 | - |
| appParameter | String | 打开 APP 时传递的参数，open-type=launchApp 时有效 | - |
| hoverStopPropagation | Boolean | 是否阻止祖先节点出现点击态 | false |
| lang | String | 返回用户信息的语言：zh_CN、zh_TW、en | en |
| sessionFrom | String | 会话来源，open-type="contact"时有效 | - |
| sendMessageTitle | String | 会话内消息卡片标题，open-type="contact"时有效 | - |
| sendMessagePath | String | 会话内消息卡片点击跳转路径，open-type="contact"时有效 | - |
| sendMessageImg | String | 会话内消息卡片图片，open-type="contact"时有效 | - |
| showMessageCard | Boolean | 是否显示会话内消息卡片，open-type="contact"时有效 | false |
| phoneNumberNoQuotaToast | Boolean | 手机号验证额度用尽时是否提示，open-type="getPhoneNumber"时有效 | true |
| index | Number/String | 自定义参数，点击事件回调中返回 | 0 |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:click | 按钮点击事件 | event.detail = { index } |
| bind:getuserinfo | 获取用户信息回调 | 用户信息 |
| bind:contact | 打开客服会话回调 | 会话信息 |
| bind:getphonenumber | 获取用户手机号回调 | 手机号信息 |
| bind:error | 开放能力错误回调 | 错误信息 |
| bind:opensetting | 打开授权设置页回调 | 授权设置信息 |
| bind:chooseavatar | 获取用户头像回调 | 头像信息 |
| bind:launchapp | 打开 App 成功回调 | - |
| bind:agreeprivacyauthorization | 用户同意隐私协议回调 | event |
| bind:getrealtimephonenumber | 手机号实时验证回调 | event |

## 使用建议

1. 若组件宽度为 100% 时，注意设置外层容器的宽度，避免 flex 布局下宽度被挤压
2. 使用 `btnSize` 可快速设置常用尺寸，优先级高于 `width` 和 `height`
3. 设置 `disabled` 后，按钮点击事件不会触发
4. 使用开放能力（如获取手机号、用户信息等）时，需配置对应的 `openType` 属性

## 版本信息

- 当前版本：1.0.0
- 分类：基础组件（basic）
