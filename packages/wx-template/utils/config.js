/**
 * 小程序环境配置
 *
 * 通过 __wxConfig.envVersion 获取当前运行环境：
 *   - develop:  开发版
 *   - trial:    体验版
 *   - release:  正式版
 */

const ENV_CONFIG = {
  develop: "",
  trial: "",
  release: ""
}

export const envVersion = __wxConfig.envVersion || 'release'
export const baseURL = ENV_CONFIG[envVersion] || ENV_CONFIG.release

