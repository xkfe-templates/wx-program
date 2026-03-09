import fse from 'fs-extra'
import path from 'node:path'

/**
 * 复制模板到目标目录，排除 node_modules 和 package.json
 */
export async function copyTemplate(src: string, dest: string): Promise<void> {
  await fse.copy(src, dest, {
    filter: (filePath: string) => {
      const basename = path.basename(filePath)
      return basename !== 'node_modules' && basename !== 'package.json'
    }
  })
}

/**
 * 复制组件文件到目标目录，排除 meta.json 和 README.md
 */
export async function copyComponent(src: string, dest: string): Promise<void> {
  await fse.copy(src, dest, {
    filter: (filePath: string) => {
      const basename = path.basename(filePath)
      return basename !== 'meta.json' && basename !== 'README.md'
    }
  })
}
