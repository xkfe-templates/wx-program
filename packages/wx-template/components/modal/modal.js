// components/modal/modal.js
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '提示'
    },
    content: {
      type: String,
      value: ''
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmText: {
      type: String,
      value: '确定'
    }
  },

  methods: {
    onMaskTap() {
      this.triggerEvent('cancel')
    },

    onCancel() {
      this.triggerEvent('cancel')
    },

    onConfirm() {
      this.triggerEvent('confirm')
    },

    // 阻止冒泡
    noop() {}
  }
})
