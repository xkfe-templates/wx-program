import { Command } from 'commander'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fse from 'fs-extra'
import { initCommand } from './commands/init.js'
import { addCommand } from './commands/add.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = fse.readJsonSync(path.resolve(__dirname, '../package.json'))

const program = new Command()

program
  .name('wx-cli')
  .description('微信小程序 CLI 工具 - 模板初始化与组件管理')
  .version(pkg.version)

program
  .command('init')
  .description('初始化一个新的小程序项目')
  .argument('[project-name]', '项目名称')
  .action(initCommand)

program
  .command('add')
  .description('添加组件到当前小程序项目')
  .argument('[components...]', '要添加的组件名称')
  .action(addCommand)

program.parse()
