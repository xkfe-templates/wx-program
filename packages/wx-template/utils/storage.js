/**
 * 微信小程序 Storage 封装模块
 * @description 基于 wx.setStorageSync / wx.getStorageSync 的存储封装，支持过期时间
 *
 * ## 主要功能
 *  - set / get / remove / clear / has（同步版本）
 *  - setAsync / getAsync / removeAsync / clearAsync / hasAsync（异步版本）
 *  - 支持为每个存储项设置过期时间（毫秒）
 */

// ==================== 内部工具 ====================

const EXPIRE_KEY = '__expire__'

/**
 * 将值包装为带过期信息的存储结构
 * @param {*} value 原始值
 * @param {number} [expire] 过期时长（毫秒），不传或 0 表示永不过期
 * @returns {{ value: *, [__expire__]: number }}
 */
function wrap(value, expire) {
  const data = { value }
  if (expire && expire > 0) {
    data[EXPIRE_KEY] = Date.now() + expire
  }
  return data
}

/**
 * 从存储结构中解包值，若已过期则返回 null
 * @param {*} raw 从存储读取的原始数据
 * @returns {*} 解包后的值，或 null（不存在/已过期）
 */
function unwrap(raw) {
  if (raw === null || raw === undefined) return null
  // 兼容未经本模块写入的原始值
  if (typeof raw !== 'object' || !('value' in raw)) return raw
  if (raw[EXPIRE_KEY] && Date.now() > raw[EXPIRE_KEY]) {
    return null
  }
  return raw.value
}

// ==================== 同步 API ====================

/**
 * 设置存储项（同步）
 * @param {string} key 键名
 * @param {*} value 值
 * @param {number} [expire] 过期时长（毫秒），不传表示永不过期
 */
function set(key, value, expire) {
  wx.setStorageSync(key, wrap(value, expire))
}

/**
 * 获取存储项（同步），若不存在或已过期返回 null
 * @param {string} key 键名
 * @param {*} [defaultValue=null] 不存在时的默认值
 * @returns {*}
 */
function get(key, defaultValue = null) {
  try {
    const raw = wx.getStorageSync(key)
    const value = unwrap(raw)
    if (value === null || value === undefined) {
      return defaultValue
    }
    return value
  } catch (e) {
    return defaultValue
  }
}

/**
 * 删除存储项（同步）
 * @param {string} key 键名
 */
function remove(key) {
  wx.removeStorageSync(key)
}

/**
 * 清空所有存储（同步）
 */
function clear() {
  wx.clearStorageSync()
}

/**
 * 检查键是否存在且未过期（同步）
 * @param {string} key 键名
 * @returns {boolean}
 */
function has(key) {
  try {
    const raw = wx.getStorageSync(key)
    return unwrap(raw) !== null
  } catch (e) {
    return false
  }
}

/**
 * 获取存储信息（同步）
 * @returns {{ keys: string[], currentSize: number, limitSize: number }}
 */
function info() {
  return wx.getStorageInfoSync()
}

// ==================== 异步 API ====================

/**
 * 设置存储项（异步）
 * @param {string} key 键名
 * @param {*} value 值
 * @param {number} [expire] 过期时长（毫秒）
 * @returns {Promise<void>}
 */
function setAsync(key, value, expire) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key,
      data: wrap(value, expire),
      success: () => resolve(),
      fail: (err) => reject(err),
    })
  })
}

/**
 * 获取存储项（异步），若不存在或已过期返回 null
 * @param {string} key 键名
 * @param {*} [defaultValue=null] 不存在时的默认值
 * @returns {Promise<*>}
 */
function getAsync(key, defaultValue = null) {
  return new Promise((resolve) => {
    wx.getStorage({
      key,
      success: (res) => {
        const value = unwrap(res.data)
        resolve(value !== null && value !== undefined ? value : defaultValue)
      },
      fail: () => resolve(defaultValue),
    })
  })
}

/**
 * 删除存储项（异步）
 * @param {string} key 键名
 * @returns {Promise<void>}
 */
function removeAsync(key) {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key,
      success: () => resolve(),
      fail: (err) => reject(err),
    })
  })
}

/**
 * 清空所有存储（异步）
 * @returns {Promise<void>}
 */
function clearAsync() {
  return new Promise((resolve, reject) => {
    wx.clearStorage({
      success: () => resolve(),
      fail: (err) => reject(err),
    })
  })
}

/**
 * 检查键是否存在且未过期（异步）
 * @param {string} key 键名
 * @returns {Promise<boolean>}
 */
function hasAsync(key) {
  return getAsync(key).then((value) => value !== null)
}

/**
 * 获取存储信息（异步）
 * @returns {Promise<{ keys: string[], currentSize: number, limitSize: number }>}
 */
function infoAsync() {
  return new Promise((resolve, reject) => {
    wx.getStorageInfo({
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    })
  })
}

// ==================== 导出 ====================

const storage = {
  // 同步
  set,
  get,
  remove,
  clear,
  has,
  info,
  // 异步
  setAsync,
  getAsync,
  removeAsync,
  clearAsync,
  hasAsync,
  infoAsync,
}

export { set, get, remove, clear, has, info, setAsync, getAsync, removeAsync, clearAsync, hasAsync, infoAsync }
export default storage
