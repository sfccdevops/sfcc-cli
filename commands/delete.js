const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const confirm = require('prompt-confirm')

const config = require('../lib/config')()

module.exports = async () => {
  const client = argv['_'][1] || null
  const instance = argv['_'][2] || null
  const currentConfig = config.get()

  let newConfig = {}

  if (currentConfig) {
    let found = false
    newConfig = Object.assign({}, newConfig, currentConfig)

    if (client && instance) {
      if (
        Object.prototype.isPrototypeOf.call(newConfig, client) &&
        Object.prototype.isPrototypeOf.call(newConfig[client], instance)
      ) {
        found = true
        delete newConfig[client][instance]
      } else {
        console.log(chalk.red.bold(`\n✖ Config does not contain client '${client}' with instance '${instance}'.\n`))
      }
    } else if (client) {
      if (Object.prototype.isPrototypeOf.call(newConfig, client)) {
        found = true
        delete newConfig[client]
      } else {
        console.log(chalk.red.bold(`\n✖ Config does not contain client '${client}'.\n`))
      }
    }

    if (found) {
      console.log('')
      const prompt = new confirm('Confirm Delete?')
      prompt.ask(function (confirmed) {
        if (confirmed) {
          config.set(newConfig, true)
        }
      })
    }
  }
}
