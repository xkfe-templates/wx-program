/**
 * 全局 Loading
 * @description 基于引用计数的 Loading 控制，支持并发请求场景下 Loading 状态的正确管理
 */

/** 当前 Loading 请求计数器 */
let loadingCount = 0

/**
 * 显示全局 Loading
 * @param {string} [text='加载中...'] Loading 提示文字
 */
export const showLoading = (text = '加载中...') => {
  if (loadingCount === 0) {
    wx.showLoading({ title: text, mask: true })
  }
  loadingCount++
}

/**
 * 隐藏全局 Loading
 * @description 引用计数归零时才真正隐藏，避免并发请求提前关闭 Loading
 */
export const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    wx.hideLoading()
  }
}
