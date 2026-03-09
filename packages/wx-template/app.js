// app.js
App({
  onLaunch() {
    // 小程序初始化
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  globalData: {
    userInfo: null
  }
})
