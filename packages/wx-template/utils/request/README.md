# Request 模块

基于微信小程序 `wx.request` 封装的 Promise 化 HTTP 请求模块，提供拦截器、自动重试、重复请求取消、全局 Loading、统一消息提示等企业级功能。

## 文件结构

```
utils/request/
  index.js      # 主入口，HttpRequest 类及默认实例
  cancel.js     # 重复请求取消管理
  cache.js      # 请求缓存管理
  message.js    # HTTP 状态码 → 中文消息映射
utils/loading.js  # 全局 Loading 管理（引用计数）
```

## 引入方式

```js
// 使用默认实例（推荐）
import http from '@/utils/request/index'

// 需要创建自定义实例时
import { HttpRequest } from '@/utils/request/index'
const customHttp = new HttpRequest({ timeout: 30000 })
```

## 默认配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `baseURL` | `string` | `''` | 基础请求地址，非 `http` 开头的 URL 会自动拼接 |
| `timeout` | `number` | `15000` | 请求超时时间（毫秒） |
| `header` | `object` | `{ 'content-type': 'application/json' }` | 默认请求头 |
| `dataType` | `string` | `'json'` | 响应数据类型 |
| `responseType` | `string` | `'text'` | 响应编码 |
| `showLoading` | `boolean` | `false` | 是否显示全局 Loading |
| `loadingText` | `string` | `'加载中...'` | Loading 提示文字 |
| `showSuccessToast` | `boolean` | `false` | 是否显示成功提示 |
| `successText` | `string` | `''` | 成功提示文字，为空时使用接口返回的 `message` |
| `showErrorToast` | `boolean` | `true` | 是否显示错误提示 |
| `retryCount` | `number` | `0` | 失败重试次数，`0` 表示不重试 |
| `retryDelay` | `number` | `1000` | 重试间隔（毫秒） |
| `minRequestTime` | `number` | `0` | 最小请求时间（毫秒），防止 Loading 闪烁 |
| `cancel` | `boolean` | `false` | 是否取消重复请求 |
| `cache` | `boolean` | `false` | 是否启用缓存 |
| `cacheTime` | `number` | `300000` | 缓存时长（毫秒），默认 5 分钟 |

可在实例化时覆盖默认配置：

```js
const http = new HttpRequest({
  baseURL: 'https://api.example.com',
  timeout: 20000,
  showLoading: true,
})
```

也可在运行时修改：

```js
http.defaults.baseURL = 'https://api.example.com'
```

## 请求方法

所有方法均返回 `Promise`，resolve 值为接口返回的业务数据（即 `response.data`）。

### GET

```js
// http.get(url, data?, config?)
const users = await http.get('/users', { page: 1, size: 10 })
```

### POST

```js
// http.post(url, data?, config?)
const result = await http.post('/users', { name: '张三', age: 25 })
```

### PUT

```js
// http.put(url, data?, config?)
await http.put('/users/1', { name: '李四' })
```

### DELETE

```js
// http.delete(url, data?, config?)
await http.delete('/users/1')
```

### upload

封装 `wx.uploadFile`，自动附加 Token，支持进度回调。

```js
// http.upload(url, options)
const res = await http.upload('/upload', {
  filePath: tempFilePath,
  name: 'file',
  formData: { type: 'avatar' },
  header: {},
  onProgress(res) {
    console.log('上传进度', res.progress)
  },
})
```

### 通用请求

```js
// http.request(config)
const data = await http.request({
  url: '/users',
  method: 'POST',
  data: { name: '张三' },
  showLoading: true,
})
```

## 拦截器

API 设计与 axios 类似，支持注册多个拦截器，按注册顺序依次执行。

### 请求拦截器

模块内置了一个请求拦截器，自动从 `wx.getStorageSync('token')` 读取 Token 并附加到 `Authorization` 请求头。

注册自定义请求拦截器：

```js
const id = http.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    config.header['X-Custom-Header'] = 'value'
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 移除拦截器
http.interceptors.request.eject(id)
```

### 响应拦截器

```js
http.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    // response 是 wx.request 的原始响应对象，包含 statusCode、data、header 等
    return response
  },
  (error) => {
    // 对响应错误做些什么
    return Promise.reject(error)
  }
)
```

## 错误处理

### 错误对象结构

所有请求失败都会 reject 一个统一结构的错误对象：

```js
{
  statusCode: 404,       // HTTP 状态码，网络错误时为 -1
  message: '请求的资源不存在', // 错误描述
  data: null             // 服务端返回的数据（如有）
}
```

### 请求取消的错误

当请求被主动取消时，错误对象包含 `isCancel: true` 标记：

```js
{
  errMsg: '请求已取消',
  isCancel: true
}
```

### 错误处理示例

```js
try {
  const data = await http.get('/users')
} catch (error) {
  if (error.isCancel) {
    // 请求被取消，通常无需处理
    return
  }
  console.error(`请求失败 [${error.statusCode}]: ${error.message}`)
}
```

### 统一消息提示

- 错误提示默认开启（`showErrorToast: true`），自动根据状态码显示中文提示
- 成功提示默认关闭（`showSuccessToast: false`），按需开启
- 网络异常和超时有独立的提示文案
- 被取消的请求不会触发错误提示

## 特殊功能

### 401 自动登出

收到 `401` 状态码时自动执行登出逻辑：

1. 清除本地 `token` 和 `userInfo`
2. 显示"登录已过期"提示
3. 延迟 1.5 秒后跳转到首页

使用 **防抖机制**（1 秒），多个并发请求同时返回 401 时只会触发一次登出。

### 重复请求取消

开启 `cancel: true` 后，模块根据 `method + url + data` 自动生成请求唯一标识。当发起相同标识的新请求时，前一个未完成的请求会被自动取消。

```js
// 典型场景：搜索输入框
http.get('/search', { q: 'abc' }, { cancel: true })
http.get('/search', { q: 'abcd' }, { cancel: true }) // 自动取消上一个请求
```

取消所有进行中的请求：

```js
http.cancelAll()
```

### 请求重试

请求失败（网络错误、超时等）时自动重试，通过 `retryCount` 和 `retryDelay` 控制：

```js
await http.get('/unstable-api', {}, {
  retryCount: 3,    // 最多重试 3 次
  retryDelay: 2000, // 每次间隔 2 秒
})
```

> 注意：仅 `fail` 回调（网络层失败）触发重试，HTTP 状态码错误（如 500）不会重试。

### 全局 Loading

基于引用计数实现，并发请求时 Loading 不会提前消失：

```js
// 单次请求开启
await http.post('/submit', formData, { showLoading: true, loadingText: '提交中...' })

// 并发场景：三个请求同时发起，Loading 在全部完成后才隐藏
await Promise.all([
  http.get('/a', {}, { showLoading: true }),
  http.get('/b', {}, { showLoading: true }),
  http.get('/c', {}, { showLoading: true }),
])
```

### 最小请求时间

防止请求响应过快导致 Loading 一闪而过：

```js
await http.get('/data', {}, {
  showLoading: true,
  minRequestTime: 500, // Loading 至少显示 500ms
})
```

### 请求缓存

开启 `cache: true` 后，请求的响应数据会被缓存到内存中。后续相同 method + URL + 参数的请求会直接返回缓存数据，不发起网络请求。缓存默认 5 分钟过期，可通过 `cacheTime` 调整。

> 缓存键基于 `method + url + data` 生成，不同方法或参数的请求互不影响。

```js
// 基础用法：缓存 5 分钟（默认）
const config = await http.get('/api/config', {}, { cache: true })

// 自定义缓存时长：缓存 30 秒
const dict = await http.get('/api/dict', { type: 'status' }, {
  cache: true,
  cacheTime: 30 * 1000,
})

// 手动清除指定缓存
http.removeCache('/api/config')
http.removeCache('/api/dict', { type: 'status' }) // 带参数的缓存需要传入相同参数

// 清空所有缓存
http.clearCache()
```

适用场景：
- 字典/枚举等不常变动的数据
- 配置信息、地区列表等基础数据
- 短时间内频繁请求的接口（如分页数据回退）

## 实际使用场景

### 定义 API 模块

```js
// api/user.js
import http from '@/utils/request/index'

/** 获取用户列表 */
export const getUserList = (params) => {
  return http.get('/api/users', params)
}

/** 创建用户 */
export const createUser = (data) => {
  return http.post('/api/users', data, {
    showLoading: true,
    showSuccessToast: true,
    successText: '创建成功',
  })
}

/** 删除用户 */
export const deleteUser = (id) => {
  return http.delete(`/api/users/${id}`, {}, {
    showLoading: true,
    showSuccessToast: true,
  })
}

/** 搜索用户（自动取消重复请求） */
export const searchUser = (keyword) => {
  return http.get('/api/users/search', { keyword }, { cancel: true })
}

/** 获取字典数据（启用缓存） */
export const getDict = (type) => {
  return http.get('/api/dict', { type }, { cache: true })
}
```

### 页面中调用

```js
// pages/user/user.js
import { getUserList, createUser } from '../../api/user'

Page({
  data: {
    userList: [],
  },

  async onLoad() {
    try {
      const res = await getUserList({ page: 1, size: 20 })
      this.setData({ userList: res.list })
    } catch (error) {
      console.error('获取用户列表失败', error)
    }
  },

  async handleCreate() {
    try {
      await createUser({ name: '新用户' })
      // showSuccessToast 已自动显示成功提示
      this.onLoad() // 刷新列表
    } catch (error) {
      // showErrorToast 已自动显示错误提示
    }
  },
})
```

### 创建独立实例

适用于需要不同基础配置的场景（如对接多个后端服务）：

```js
import { HttpRequest } from '@/utils/request/index'

const paymentHttp = new HttpRequest({
  baseURL: 'https://pay.example.com',
  timeout: 30000,
  showLoading: true,
})

export const createOrder = (data) => {
  return paymentHttp.post('/api/orders', data)
}
```
