/**
 * HTTP 状态码对应的消息文本
 * @description 用于统一管理 HTTP 响应状态码的中文提示信息
 */
const statusMessage = {
  200: '请求成功',
  201: '创建成功',
  204: '删除成功',
  301: '资源已被永久移动',
  302: '资源已被临时移动',
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有权限访问该资源',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '资源冲突',
  413: '请求体过大',
  414: '请求 URI 过长',
  422: '请求参数验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
}

/**
 * 根据状态码获取对应的提示消息
 * @param {number} status HTTP 状态码
 * @returns {string} 对应的提示消息
 */
export const getStatusMessage = (status) => {
  return statusMessage[status] || `未知错误(${status})`
}

export default statusMessage
