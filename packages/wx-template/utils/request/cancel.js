/**
 * 重复请求取消管理模块
 * @description 基于请求特征自动生成唯一标识，管理进行中的请求，支持取消重复请求
 */

/** 存储进行中的请求 Map<requestKey, RequestTask> */
const pendingRequests = new Map()

/**
 * 根据请求配置生成唯一标识符
 * @param {Object} config 请求配置
 * @param {string} config.method HTTP 方法
 * @param {string} config.url 请求地址
 * @param {Object} [config.data] 请求参数/请求体
 * @returns {string} 请求唯一标识
 */
export const generateRequestKey = (config) => {
  const { method = 'GET', url = '', data } = config
  const dataStr = data ? JSON.stringify(data) : ''
  return `${method.toUpperCase()}:${url}:${dataStr}`
}

/**
 * 取消并移除已存在的重复请求
 * @param {string} requestKey 请求标识
 */
export const cancelPending = (requestKey) => {
  if (requestKey && pendingRequests.has(requestKey)) {
    const task = pendingRequests.get(requestKey)
    task.abort()
    pendingRequests.delete(requestKey)
  }
}

/**
 * 记录进行中的请求
 * @param {string} requestKey 请求标识
 * @param {Object} task wx.request 返回的 RequestTask
 */
export const addPending = (requestKey, task) => {
  if (requestKey) {
    pendingRequests.set(requestKey, task)
  }
}

/**
 * 移除已完成的请求记录（不执行 abort）
 * @param {string} requestKey 请求标识
 */
export const removePending = (requestKey) => {
  if (requestKey) {
    pendingRequests.delete(requestKey)
  }
}

/**
 * 取消所有进行中的请求
 */
export const cancelAllPending = () => {
  pendingRequests.forEach((task) => {
    task.abort()
  })
  pendingRequests.clear()
}
