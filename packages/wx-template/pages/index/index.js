import http from '@/utils/request/index'
import { sleep } from '@/utils/util'

// pages/index/index.js
Page({
  data: {
    motto: '欢迎使用小程序模板'
  },

  onLoad() {
    // 页面加载
  },
  async handleRequest() {
    try {
      await this.$showToast('请求开始')
      await sleep(1000)
      http.get('https://api.github.com/repos/alibaba/mini-program-official-demo/issues').then(res => {
        console.log(res)
      })
    } catch (error) {
      console.error('error')
    }
  }
})
