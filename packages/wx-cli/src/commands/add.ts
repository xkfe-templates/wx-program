import path from 'node:path'
import fse from 'fs-extra'
import { logger } from '../utils/logger.js'
import { selectAndInstallComponents } from '../utils/components.js'

export async function addCommand(componentNames?: string[]): Promise<void> {
  const cwd = process.cwd()

  // 1. 验证是否在小程序项目中
  const appJsonPath = path.join(cwd, 'app.json')
  if (!fse.existsSync(appJsonPath)) {
    logger.error('当前目录不是小程序项目（未找到 app.json），请在小程序项目根目录下执行此命令')
    process.exit(1)
  }

  // 2. 执行组件选择与安装
  const installed = await selectAndInstallComponents({
    projectDir: cwd,
    componentNames
  })

  // 3. 输出结果
  if (installed.length > 0) {
    logger.log('')
    logger.success(`共安装 ${installed.length} 个组件: ${installed.join(', ')}`)
  }
}
