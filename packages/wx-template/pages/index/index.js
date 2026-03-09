// pages/index/index.js
Page({
  data: {
    motto: '欢迎使用小程序模板',
    showModal: false
  },

  onLoad() {
    // 页面加载
  },
  showModal() {
    this.setData({
      showModal: true
    })
  },
})
