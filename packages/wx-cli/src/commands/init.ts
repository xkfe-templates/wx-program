import path from 'node:path'
import fse from 'fs-extra'
import * as p from '@clack/prompts'
import { logger } from '../utils/logger.js'
import { getTemplatePath } from '../utils/path.js'
import { copyTemplate } from '../utils/copy.js'
import { selectAndInstallComponents } from '../utils/components.js'

export async function initCommand(projectName?: string): Promise<void> {
  // 1. 获取项目名
  if (!projectName) {
    const result = await p.text({
      message: '请输入项目名称:',
      placeholder: 'my-miniprogram',
      validate: (val: string | undefined) => {
        if (!val || !val.trim()) return '项目名称不能为空'
        return undefined
      }
    })
    if (p.isCancel(result)) {
      logger.info('已取消操作')
      process.exit(0)
    }
    projectName = result as string
  }

  const targetDir = path.resolve(process.cwd(), projectName!)

  // 2. 检查目标目录
  if (fse.existsSync(targetDir)) {
    const files = fse.readdirSync(targetDir)
    if (files.length > 0) {
      const overwrite = await p.confirm({
        message: `目录 ${projectName} 已存在且非空，是否覆盖？`,
        initialValue: false
      })
      if (p.isCancel(overwrite) || !overwrite) {
        logger.info('已取消操作')
        process.exit(0)
      }
      await fse.emptyDir(targetDir)
    }
  }

  // 3. 定位模板路径
  const templatePath = getTemplatePath()
  if (!fse.existsSync(templatePath)) {
    logger.error('找不到模板文件，请确认 @xkfe/wx-template 包已正确安装')
    process.exit(1)
  }

  // 4. 复制模板
  logger.info(`正在创建项目 ${projectName}...`)
  await copyTemplate(templatePath, targetDir)

  // 5. 个性化处理 - 替换 project.config.json 中的项目名
  const projectConfigPath = path.join(targetDir, 'project.config.json')
  if (fse.existsSync(projectConfigPath)) {
    const config = await fse.readJson(projectConfigPath)
    config.projectname = projectName
    await fse.writeJson(projectConfigPath, config, { spaces: 2 })
  }

  // 6. 输出成功信息
  logger.success(`项目 ${projectName} 创建成功！`)

  // 7. 询问是否现在添加组件
  logger.log('')
  const addNow = await p.confirm({
    message: '是否现在为项目添加组件？',
    initialValue: true
  })

  if (p.isCancel(addNow)) {
    logger.info('已取消操作')
    process.exit(0)
  }

  if (addNow) {
    const installed = await selectAndInstallComponents({
      projectDir: targetDir,
      allowSkip: true
    })

    if (installed.length > 0) {
      logger.log('')
      logger.success(`共安装 ${installed.length} 个组件: ${installed.join(', ')}`)
    }
  }

  // 8. 输出最终引导信息
  logger.log('')
  logger.log(`  cd ${projectName}`)
  logger.log('  使用微信开发者工具打开此目录即可开始开发')
  logger.log('')
  logger.info('后续可使用 wx-cli add 命令继续添加组件')
}
