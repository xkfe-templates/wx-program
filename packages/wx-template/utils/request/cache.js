/**
 * 请求缓存管理模块
 * @description 基于内存的 GET 请求缓存，支持过期时间控制和手动清除
 */

/** 缓存存储 Map<cacheKey, { data: any, expireAt: number }> */
const cacheStore = new Map()

/**
 * 生成缓存键
 * @param {Object} config 请求配置
 * @param {string} config.method HTTP 方法
 * @param {string} config.url 请求地址（已拼接 baseURL 的完整地址）
 * @param {Object} [config.data] 请求参数/请求体
 * @returns {string} 缓存键
 */
export const generateCacheKey = (config) => {
  const { method = 'GET', url = '', data } = config
  const dataStr = data ? JSON.stringify(data) : ''
  return `CACHE:${method.toUpperCase()}:${url}:${dataStr}`
}

/**
 * 获取缓存数据
 * @param {string} key 缓存键
 * @returns {any|null} 缓存数据，不存在或已过期返回 null
 */
export const getCache = (key) => {
  if (!cacheStore.has(key)) return null

  const entry = cacheStore.get(key)
  if (Date.now() > entry.expireAt) {
    cacheStore.delete(key)
    return null
  }

  return entry.data
}

/**
 * 设置缓存数据
 * @param {string} key 缓存键
 * @param {any} data 要缓存的数据
 * @param {number} cacheTime 缓存时长（毫秒）
 */
export const setCache = (key, data, cacheTime) => {
  cacheStore.set(key, {
    data,
    expireAt: Date.now() + cacheTime,
  })
}

/**
 * 清除指定缓存
 * @param {string} key 缓存键
 */
export const removeCache = (key) => {
  cacheStore.delete(key)
}

/**
 * 清空所有缓存
 */
export const clearCache = () => {
  cacheStore.clear()
}
