// app.js
import globalMethods, { $login} from '@/utils/globalMethods.js'


const optionsFn = (options) => {
  options.behaviors = options.behaviors || [];
  options.behaviors.push(globalMethods);
  return options;
}

// globalMethods 挂载在所有页面
const originPage = Page
Page = function (options) {
  return originPage.call(this, optionsFn(options));
}

// globalMethods 挂载在所有组件
const originalComponent = Component
Component = function (options) {
  return originalComponent.call(this, optionsFn(options));
}
App({
  globalData: {
    userInfo: null
  },
  async onLaunch() {
     if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '发现新版本，为了获得更好的体验，建议立即更新',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本更新失败，请稍后再试或删除小程序重新搜索打开',
              showCancel: false
            });
          });
        }
      });
    }
    // 发送 res.code 到后台换取 openId, sessionKey, unionId
    const res = await $login()
    console.log('登录',res)
  },
})
