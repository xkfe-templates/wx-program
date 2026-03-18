import path from 'node:path'
import fse from 'fs-extra'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { logger } from './logger.js'
import { getComponentsPath } from './path.js'
import { copyComponent } from './copy.js'
import type { ComponentMeta } from '../types/component.js'

export type { ComponentMeta }

/**
 * 加载所有组件元信息
 * 直接扫描组件目录，读取每个组件的 meta.json
 */
export async function loadComponentsMeta(componentsDir: string): Promise<ComponentMeta[]> {
  const entries = await fse.readdir(componentsDir, { withFileTypes: true })
  const metas: ComponentMeta[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const metaPath = path.join(componentsDir, entry.name, 'meta.json')
    if (await fse.pathExists(metaPath)) {
      const meta: ComponentMeta = await fse.readJson(metaPath)
      metas.push(meta)
    }
  }

  return metas
}

/**
 * 解析依赖：将选中组件的依赖也加入列表
 */
export function resolveDependencies(selected: string[], allMetas: ComponentMeta[]): string[] {
  const metaMap = new Map(allMetas.map((m) => [m.name, m]))
  const resolved = new Set(selected)

  const resolve = (name: string) => {
    const meta = metaMap.get(name)
    if (!meta) return
    for (const dep of meta.dependencies) {
      if (!resolved.has(dep)) {
        resolved.add(dep)
        logger.info(`自动添加依赖组件: ${dep}`)
        resolve(dep)
      }
    }
  }

  for (const name of selected) {
    resolve(name)
  }

  return Array.from(resolved)
}

/**
 * 按 category 分组构建交互式选项（适配 @clack/prompts 的 multiselect）
 */
export function buildOptions(metas: ComponentMeta[]) {
  const categoryLabels: Record<string, string> = {
    basic: '基础',
    form: '表单',
    data: '数据',
    layout: '布局',
    navigation: '导航',
    feedback: '反馈',
  }

  const grouped = new Map<string, ComponentMeta[]>()
  for (const meta of metas) {
    const group = grouped.get(meta.category) || []
    group.push(meta)
    grouped.set(meta.category, group)
  }

  const options: Array<{ value: string; label: string; hint: string }> = []
  for (const [category, items] of grouped) {
    const label = categoryLabels[category] || category
    for (const item of items) {
      options.push({
        value: item.name,
        label: `${label ? `[${label}] ` : ''}${item.displayName} - ${item.description}`,
        hint: `v${item.version} ${item?.miniprogram?.minVersion ? `| 基础库 >= ${item.miniprogram.minVersion}` : ''}`
      })
    }
  }

  return options
}

export interface InstallOptions {
  /** 目标项目根目录 */
  projectDir: string
  /** 预先指定的组件名（跳过交互选择），为空时进入交互模式 */
  componentNames?: string[]
  /** 是否允许跳过（不选任何组件）。init 流程中设为 true 以支持跳过 */
  allowSkip?: boolean
}

/**
 * 完整的组件选择与安装流程，可在 init 和 add 命令中复用
 * @returns 实际安装的组件名列表
 */
export async function selectAndInstallComponents(options: InstallOptions): Promise<string[]> {
  const { projectDir, componentNames, allowSkip = false } = options

  // 1. 加载组件信息
  const componentsDir = getComponentsPath()
  let allMetas: ComponentMeta[]
  try {
    allMetas = await loadComponentsMeta(componentsDir)
  } catch (err) {
    logger.error(`加载组件信息失败: ${(err as Error).message}`)
    process.exit(1)
  }

  if (allMetas.length === 0) {
    logger.warn('没有可用的组件')
    return []
  }

  // 2. 选择组件
  let selected: string[]

  if (componentNames && componentNames.length > 0) {
    // 验证指定的组件名是否存在
    const validNames = new Set(allMetas.map((m) => m.name))
    const invalid = componentNames.filter((n) => !validNames.has(n))
    if (invalid.length > 0) {
      logger.error(`以下组件不存在: ${invalid.join(', ')}`)
      logger.info(`可用组件: ${allMetas.map((m) => m.name).join(', ')}`)
      process.exit(1)
    }
    selected = componentNames
  } else {
    // 交互式选择
    const result = await p.multiselect({
      message: '请选择要安装的组件（空格选中，回车确认）:',
      options: buildOptions(allMetas),
      required: false
    })

    if (p.isCancel(result)) {
      logger.info('已取消操作')
      process.exit(0)
    }

    selected = result as string[]

    if (selected.length === 0) {
      if (allowSkip) {
        logger.info('未选择任何组件，跳过组件安装')
        return []
      }
      logger.info('未选择任何组件')
      return []
    }
  }

  // 3. 解析依赖
  selected = resolveDependencies(selected, allMetas)

  // 4. 检查冲突
  const targetComponentsDir = path.join(projectDir, 'components')
  for (const name of selected) {
    const targetDir = path.join(targetComponentsDir, name)
    if (fse.existsSync(targetDir)) {
      const overwrite = await p.confirm({
        message: `组件 ${name} 已存在，是否覆盖？`,
        initialValue: false
      })
      if (p.isCancel(overwrite) || !overwrite) {
        selected = selected.filter((n) => n !== name)
      }
    }
  }

  if (selected.length === 0) {
    logger.info('没有需要安装的组件')
    return []
  }

  // 5. 复制组件文件
  logger.info('正在安装组件...')
  await fse.ensureDir(targetComponentsDir)

  for (const name of selected) {
    const srcDir = path.join(componentsDir, name)
    const destDir = path.join(targetComponentsDir, name)
    await copyComponent(srcDir, destDir)
    logger.success(`已安装组件: ${name}`)
  }

  // 6. 更新 app.json
  const appJsonPath = path.join(projectDir, 'app.json')
  const metaMap = new Map(allMetas.map((m) => [m.name, m]))
  const usingComponents: Record<string, string> = {}
  for (const name of selected) {
    const meta = metaMap.get(name)
    if (meta) {
      Object.assign(usingComponents, meta.config.usingComponents)
    }
  }

  if (Object.keys(usingComponents).length > 0 && fse.existsSync(appJsonPath)) {
    const updateAppJson = await p.confirm({
      message: '是否将组件注册到 app.json 的全局 usingComponents 中？',
      initialValue: true
    })

    if (p.isCancel(updateAppJson)) {
      logger.info('已取消操作')
      return selected
    }

    if (updateAppJson) {
      const appJson = await fse.readJson(appJsonPath)
      appJson.usingComponents = {
        ...(appJson.usingComponents || {}),
        ...usingComponents
      }
      await fse.writeJson(appJsonPath, appJson, { spaces: 2 })
      logger.success('已更新 app.json')
    } else {
      logger.info('你可以在页面的 json 文件中手动注册组件:')
      logger.log(pc.gray(JSON.stringify({ usingComponents }, null, 2)))
    }
  }

  return selected
}
