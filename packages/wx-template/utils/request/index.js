/**
 * HTTP 请求封装模块
 * @description 基于 wx.request 的 Promise 网络请求封装
 * 
 * ## 主要功能
 *  - 请求/响应拦截器（自动添加 Token、统一错误处理）
 *  - 401 未授权自动登出（带防抖机制）
 *  - 超时处理、最小请求时间、重复请求取消、请求失败自动重试（可配置）
 *  - 统一的成功/错误消息提示
 *  - 全局 Loading 控制
 */

import { getStatusMessage } from './message'
import { generateRequestKey, cancelPending, addPending, removePending, cancelAllPending } from './cancel'
import { generateCacheKey, getCache, setCache, removeCache, clearCache } from './cache'
import { showLoading, hideLoading } from '../loading'
import { debounce } from '../util'
import { baseURL } from '../config'
import { $showToast } from '../globalMethods'
import storage from '../storage'

// ==================== 默认配置 ====================

/** 默认请求配置 */
const defaults = {
  /** 基础请求地址 */
  baseURL,
  /** 请求超时时间（毫秒） */
  timeout: 15000, // 默认 15 秒超时
  /** 请求头 */
  header: {
    'content-type': 'application/json',
  },
  /** 响应数据类型 */
  dataType: 'json',
  /** 响应编码 */
  responseType: 'text',
  /** 是否显示全局 Loading */
  showLoading: true,
  /** Loading 提示文字 */
  loadingText: '加载中...',
  /** 是否显示成功提示 */
  showSuccessToast: false,
  /** 成功提示文字（为空时使用接口返回的 message） */
  successText: '',
  /** 是否显示错误提示 */
  showErrorToast: true,
  /** 失败重试次数 */
  retryCount: 0,
  /** 重试间隔（毫秒） */
  retryDelay: 1000,
  /** 最小请求时间（毫秒），防止 Loading 闪烁 */
  minRequestTime: 0,
  /** 是否取消重复请求 */
  cancel: false,
  /** 是否启用缓存（仅 GET 请求生效） */
  cache: false,
  /** 缓存时长（毫秒），默认 5 分钟 */
  cacheTime: 5 * 60 * 1000,
}

/**
 * 创建拦截器管理器
 * @returns {{ use: Function, eject: Function, forEach: Function }}
 */
const createInterceptorManager = () => {
  const handlers = []

  return {
    /**
     * 注册拦截器
     * @param {Function} fulfilled 成功回调
     * @param {Function} [rejected] 失败回调
     * @returns {number} 拦截器 ID，用于移除
     */
    use(fulfilled, rejected) {
      handlers.push({ fulfilled, rejected })
      return handlers.length - 1
    },

    /**
     * 移除拦截器
     * @param {number} id 拦截器 ID
     */
    eject(id) {
      if (handlers[id]) {
        handlers[id] = null
      }
    },

    /**
     * 遍历所有已注册的拦截器
     * @param {Function} fn 回调函数
     */
    forEach(fn) {
      handlers.forEach((handler) => {
        if (handler !== null) {
          fn(handler)
        }
      })
    },
  }
}

/** 防抖登出：避免多个 401 响应导致重复执行登出逻辑 */
const handleUnauthorized = debounce(() => {
  // 清除本地存储的登录信息
  storage.remove('token')
  storage.remove('userInfo')

  $showToast('登录已过期，请重新登录')

  // 延迟跳转，确保用户看到提示
  setTimeout(() => {
    wx.reLaunch({ url: '/pages/index/index' })
  }, 1500)
}, 1000)


class HttpRequest {
  constructor(config = {}) {
    /** 合并默认配置 */
    this.defaults = { ...defaults, ...config }

    /** 请求拦截器 */
    this.interceptors = {
      request: createInterceptorManager(),
      response: createInterceptorManager(),
    }

    // 注册内置请求拦截器：自动附加 Token
    this.interceptors.request.use((config) => {
      const token = storage.get('token')
      if (token) {
        config.header = {
          ...config.header,
          Authorization: `Bearer ${token}`,
        }
      }
      return config
    })

    // 注册内置响应拦截器：统一处理响应
    this.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  /**
   * 合并请求配置
   * @param {Object} requestConfig 单次请求配置
   * @returns {Object} 合并后的配置
   */
  _mergeConfig(requestConfig) {
    return {
      ...this.defaults,
      ...requestConfig,
      header: {
        ...this.defaults.header,
        ...(requestConfig.header || {}),
      },
    }
  }

  /**
   * 执行请求拦截器链
   * @param {Object} config 请求配置
   * @returns {Promise<Object>} 处理后的配置
   */
  async _runRequestInterceptors(config) {
    let result = config
    const handlers = []

    this.interceptors.request.forEach((handler) => {
      handlers.push(handler)
    })

    for (const handler of handlers) {
      try {
        result = await handler.fulfilled(result)
      } catch (error) {
        if (handler.rejected) {
          result = await handler.rejected(error)
        } else {
          throw error
        }
      }
    }

    return result
  }

  /**
   * 执行响应拦截器链
   * @param {Object} response 响应数据
   * @returns {Promise<Object>} 处理后的响应
   */
  async _runResponseInterceptors(response) {
    let result = response
    const handlers = []

    this.interceptors.response.forEach((handler) => {
      handlers.push(handler)
    })

    for (const handler of handlers) {
      try {
        result = await handler.fulfilled(result)
      } catch (error) {
        if (handler.rejected) {
          result = await handler.rejected(error)
        } else {
          throw error
        }
      }
    }

    return result
  }

  /**
   * 显示统一消息提示
   * @param {Object} config 请求配置
   * @param {Object} response 响应数据
   * @param {boolean} isSuccess 是否成功
   */
  _showMessage(config, response, isSuccess) {
    if (isSuccess && config.showSuccessToast) {
      const message = config.successText || response.data?.message || '操作成功'
      $showToast(message, 'success', 1500)
    }

    if (!isSuccess && config.showErrorToast) {
      const message = response?.data?.message || getStatusMessage(response?.statusCode) || '请求失败'
      $showToast(message)  
    }
  }

  /**
   * 延迟函数
   * @param {number} ms 延迟毫秒数
   * @returns {Promise<void>}
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 发送请求（含重试逻辑）
   * @param {Object} config 请求配置
   * @param {number} [retryAttempt=0] 当前重试次数
   * @returns {Promise<Object>} 响应数据
   */
  _sendRequest(config, retryAttempt = 0) {
    const requestKey = config.cancel ? generateRequestKey(config) : ''

    return new Promise((resolve, reject) => {
      const task = wx.request({
        url: config.url,
        method: config.method,
        data: config.data,
        header: config.header,
        timeout: config.timeout,
        dataType: config.dataType,
        responseType: config.responseType,
        success: (res) => {
          removePending(requestKey)
          resolve(res)
        },
        fail: (err) => {
          removePending(requestKey)

          // 判断是否为主动取消
          if (err.errMsg?.includes('abort')) {
            reject({ errMsg: '请求已取消', isCancel: true })
            return
          }

          // 重试逻辑
          if (retryAttempt < config.retryCount) {
            this._delay(config.retryDelay).then(() => {
              this._sendRequest(config, retryAttempt + 1).then(resolve).catch(reject)
            })
            return
          }

          reject(err)
        },
      })

      // 记录请求以支持取消
      addPending(requestKey, task)
    })
  }

  /**
   * 核心请求方法
   * @param {Object} requestConfig 请求配置
   * @returns {Promise<any>} 接口返回的业务数据
   */
  async request(requestConfig) {
    // 1. 合并配置
    let config = this._mergeConfig(requestConfig)

    // 2. 拼接完整 URL
    if (config.baseURL && !config.url.startsWith('http')) {
      config.url = config.baseURL + config.url
    }

    // 3. 取消重复请求
    if (config.cancel) {
      cancelPending(generateRequestKey(config))
    }

    // 4. 缓存命中检查
    const useCache = config.cache
    const cacheKey = useCache ? generateCacheKey(config) : ''
    if (useCache) {
      const cachedData = getCache(cacheKey)
      if (cachedData !== null) {
        return cachedData
      }
    }

    // 5. 执行请求拦截器
    config = await this._runRequestInterceptors(config)

    // 6. 显示 Loading
    if (config.showLoading) {
      showLoading(config.loadingText)
    }

    // 7. 记录请求开始时间（用于最小请求时间控制）
    const startTime = Date.now()

    try {
      // 8. 发送请求
      const response = await this._sendRequest(config)

      // 9. 最小请求时间控制
      if (config.minRequestTime > 0) {
        const elapsed = Date.now() - startTime
        if (elapsed < config.minRequestTime) {
          await this._delay(config.minRequestTime - elapsed)
        }
      }

      // 10. 隐藏 Loading
      if (config.showLoading) {
        hideLoading()
      }

      // 11. 处理 HTTP 状态码
      const { statusCode } = response

      if (statusCode === 401) {
        handleUnauthorized()
        return Promise.reject({
          statusCode,
          message: getStatusMessage(401),
          data: response.data,
        })
      }

      if (statusCode >= 200 && statusCode < 300) {
        // 12. 执行响应拦截器
        const result = await this._runResponseInterceptors(response)

        // 13. 写入缓存
        if (useCache) {
          setCache(cacheKey, result.data, config.cacheTime)
        }

        // 14. 显示成功提示
        this._showMessage(config, result, true)

        return result.data
      }

      // 非成功状态码
      this._showMessage(config, response, false)
      return Promise.reject({
        statusCode,
        message: getStatusMessage(statusCode),
        data: response.data,
      })
    } catch (error) {
      // 隐藏 Loading
      if (config.showLoading) {
        hideLoading()
      }

      // 主动取消的请求不显示错误提示
      if (error.isCancel) {
        return Promise.reject(error)
      }

      // 网络错误或超时
      if (config.showErrorToast) {
        const message = error.errMsg?.includes('timeout') ? '请求超时' : '网络异常，请检查网络连接'
        $showToast(message)
      }

      return Promise.reject({
        statusCode: -1,
        message: error.errMsg || '请求失败',
        data: null,
      })
    }
  }

  /**
   * GET 请求
   * @param {string} url 请求地址
   * @param {Object} [data] 查询参数
   * @param {Object} [config] 额外配置
   * @returns {Promise<any>}
   */
  get(url, data = {}, config = {}) {
    return this.request({ ...config, url, data, method: 'GET' })
  }

  /**
   * POST 请求
   * @param {string} url 请求地址
   * @param {Object} [data] 请求体
   * @param {Object} [config] 额外配置
   * @returns {Promise<any>}
   */
  post(url, data = {}, config = {}) {
    return this.request({ ...config, url, data, method: 'POST' })
  }

  /**
   * PUT 请求
   * @param {string} url 请求地址
   * @param {Object} [data] 请求体
   * @param {Object} [config] 额外配置
   * @returns {Promise<any>}
   */
  put(url, data = {}, config = {}) {
    return this.request({ ...config, url, data, method: 'PUT' })
  }

  /**
   * DELETE 请求
   * @param {string} url 请求地址
   * @param {Object} [data] 查询参数
   * @param {Object} [config] 额外配置
   * @returns {Promise<any>}
   */
  delete(url, data = {}, config = {}) {
    return this.request({ ...config, url, data, method: 'DELETE' })
  }

  /**
   * 上传文件
   * @param {string} url 上传地址
   * @param {Object} options 上传配置
   * @param {string} options.filePath 文件路径
   * @param {string} options.name 文件对应的 key
   * @param {Object} [options.formData] 额外的表单数据
   * @param {Object} [options.header] 请求头
   * @param {Function} [options.onProgress] 上传进度回调
   * @returns {Promise<any>}
   */
  upload(url, options = {}) {
    const config = this._mergeConfig({ url })
    const fullURL = config.baseURL && !url.startsWith('http') ? config.baseURL + url : url

    // 附加 Token
    const token = storage.get('token')
    const header = {
      ...config.header,
      ...(options.header || {}),
    }
    if (token) {
      header.Authorization = `Bearer ${token}`
    }
    // 上传时移除 content-type，由微信自动设置 multipart/form-data
    delete header['content-type']

    if (config.showLoading) {
      showLoading(config.loadingText)
    }

    return new Promise((resolve, reject) => {
      const uploadTask = wx.uploadFile({
        url: fullURL,
        filePath: options.filePath,
        name: options.name || 'file',
        formData: options.formData || {},
        header,
        success: (res) => {
          if (config.showLoading) {
            hideLoading()
          }
          // wx.uploadFile 返回的 data 是字符串，需要解析
          if (typeof res.data === 'string') {
            try {
              res.data = JSON.parse(res.data)
            } catch (e) {
              // 保持原始字符串
            }
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject({
              statusCode: res.statusCode,
              message: getStatusMessage(res.statusCode),
              data: res.data,
            })
          }
        },
        fail: (err) => {
          if (config.showLoading) {
            hideLoading()
          }
          reject({
            statusCode: -1,
            message: err.errMsg || '上传失败',
            data: null,
          })
        },
      })

      // 监听上传进度
      if (typeof options.onProgress === 'function') {
        uploadTask.onProgressUpdate(options.onProgress)
      }
    })
  }

  /**
   * 取消所有进行中的请求
   */
  cancelAll() {
    cancelAllPending()
  }

  /**
   * 清除指定 URL 的缓存
   * @param {string} url 请求地址
   * @param {Object} [data] 查询参数
   */
  removeCache(url, data) {
    let fullURL = url
    if (this.defaults.baseURL && !url.startsWith('http')) {
      fullURL = this.defaults.baseURL + url
    }
    removeCache(generateCacheKey({ url: fullURL, data }))
  }

  /**
   * 清空所有请求缓存
   */
  clearCache() {
    clearCache()
  }
}

// ==================== 创建默认实例并导出 ====================

/** 默认 HTTP 实例 */
const http = new HttpRequest()

export { HttpRequest }
export default http
