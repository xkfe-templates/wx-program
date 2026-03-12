// 全局方法封装，提供全局 $ 方法

/**
 * 显示提示框
 * @param {string} title 提示内容
 * @param {'success' | 'error' | 'loading' | 'none'} [icon='none'] 图标类型
 * @param {number} [duration=2000] 显示时长（毫秒）
 * @returns {Promise<void>}
 */
export const $showToast = (title, icon = 'none', duration = 2000) => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      title,
      icon,
      duration,
      success: resolve,
      fail: reject,
    })
  })
}

/**
 * 显示模态对话框
 * @param {Object} options 配置选项
 * @param {string} [options.title='提示'] 提示的标题
 * @param {string} [options.content=''] 提示的内容
 * @param {boolean} [options.showCancel=true] 是否显示取消按钮
 * @param {string} [options.confirmText='确定'] 确认按钮的文字
 * @param {string} [options.cancelText='取消'] 取消按钮的文字
 * @example this.$showModal({ title: '提示', content: '这是一个模态弹窗' })
 * @returns {Promise<boolean>} 返回 true 表示点击了确定，false 表示点击了取消
 */
export const $showModal = (options = {}) => {
  const { title = '提示', content = '', showCancel = true, confirmText = '确定', cancelText = '取消' } = options
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      showCancel,
      confirmText,
      cancelText,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 登录
 * @returns {Promise<any>}
 */
export const $login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 全局方法 Behavior
 * @type {WechatMiniprogram.Behavior.Constructor}
 */
const globalMethods = Behavior({
  methods: {
    $showToast,
    $showModal,
    $login
  }
})

export default globalMethods