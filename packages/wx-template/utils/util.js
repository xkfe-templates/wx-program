// utils/util.js
/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {String} format 格式化字符串，如 'YYYY-MM-DD HH:mm:ss'
 * @returns {String} 格式化后的时间字符串
 */
export const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }

  return format
    .replace('YYYY', year)
    .replace('MM', formatNumber(month))
    .replace('DD', formatNumber(day))
    .replace('HH', formatNumber(hour))
    .replace('mm', formatNumber(minute))
    .replace('ss', formatNumber(second))
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {Number} wait 等待时间（毫秒）
 * @param {Boolean} immediate 是否立即执行（首次调用立即触发，冷却期内不再触发）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait = 300, immediate = false) => {
  let timeout
  return function (...args) {
    const context = this
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {Number} wait 等待时间（毫秒）
 * @param {Boolean} immediate 是否立即执行（true：首次立即触发；false：延迟后触发）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, wait = 300, immediate = true) => {
  let timeout
  return function (...args) {
    const context = this
    if (!timeout) {
      if (immediate) {
        func.apply(context, args)
        timeout = setTimeout(() => {
          timeout = null
        }, wait)
      } else {
        timeout = setTimeout(() => {
          timeout = null
          func.apply(context, args)
        }, wait)
      }
    }
  }
}

/**
   * @desc 等待多少毫秒再执行 ，异步阻塞
   * @param {String} ms 毫秒
   **/
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))