import pc from 'picocolors'

export const logger = {
  success(msg: string) {
    console.log(pc.green(`✔ ${msg}`))
  },
  error(msg: string) {
    console.log(pc.red(`✘ ${msg}`))
  },
  info(msg: string) {
    console.log(pc.blue(`ℹ ${msg}`))
  },
  warn(msg: string) {
    console.log(pc.yellow(`⚠ ${msg}`))
  },
  log(msg: string) {
    console.log(msg)
  }
}
