const chalk = require('chalk')

const config = require('../lib/config')()

module.exports = async () => {
  const currentConfig = config.get()

  if (Object.keys(currentConfig).length > 0 && currentConfig.constructor === Object) {
    console.log('')
    for (let client in currentConfig) {
      console.log(chalk.green('  client: ') + chalk.green.bold(client))

      for (let instance in currentConfig[client]) {
        console.log(chalk.cyan('instance: ') + chalk.cyan.bold(instance))
        console.log('    path: ' + chalk.bold(currentConfig[client][instance].d))
        console.log('    host: ' + chalk.bold(currentConfig[client][instance].h))
        console.log('    user: ' + chalk.bold(currentConfig[client][instance].u))
        console.log('    pass: ' + chalk.bold(currentConfig[client][instance].p.replace(/./g, '*')))
      }

      console.log('')
    }
  } else {
    console.log(chalk.red.bold('\n✖ No Clients'))
    console.log('Use ' + chalk.cyan('sfcc setup') + ' to started.\n')
  }
}
