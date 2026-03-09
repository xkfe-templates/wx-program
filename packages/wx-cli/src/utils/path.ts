import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

/**
 * 获取 wx-template 模板包的目录路径
 */
export function getTemplatePath(): string {
  try {
    const pkgPath = require.resolve('@xkfe/wx-template/package.json')
    return path.dirname(pkgPath)
  } catch {
    // 回退：monorepo 开发环境下的相对路径
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    return path.resolve(__dirname, '../../wx-template')
  }
}

/**
 * 获取 wx-components 组件包的目录路径
 */
export function getComponentsPath(): string {
  try {
    const pkgPath = require.resolve('@xkfe/wx-components/package.json')
    return path.dirname(pkgPath)
  } catch {
    // 回退：monorepo 开发环境下的相对路径
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    return path.resolve(__dirname, '../../wx-components')
  }
}
