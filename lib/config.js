const chalk = require('chalk')
const fs = require('fs')
const homedir = require('os').homedir()
const path = require('path')

module.exports = () => {
  const configFile = path.join(homedir, '.sfcc-cli')
  let config = {}
  let requireParams = false

  if (fs.existsSync(configFile)) {
    const currentConfig = fs.readFileSync(configFile, 'utf8')
    if (currentConfig) {
      config = Object.assign({}, config, JSON.parse(currentConfig))
    }
  }

  const get = (client, instance, hasSingle) => {
    if (client && instance) {
      if (
        Object.prototype.isPrototypeOf.call(config, client) &&
        Object.prototype.isPrototypeOf.call(config[client], instance)
      ) {
        return config[client][instance]
      }
    } else if (client) {
      if (Object.prototype.isPrototypeOf.call(config, client)) {
        return config[client]
      }
    }

    if (hasSingle && Object.keys(config).length === 1 && config.constructor === Object) {
      var singleClient = Object.keys(config)[0]

      if (Object.keys(config[singleClient]).length === 1 && config[singleClient].constructor === Object) {
        var singleInstance = Object.keys(config[singleClient])[0]
        return {
          client: singleClient,
          instance: singleInstance,
          config: config[singleClient][singleInstance],
        }
      } else if (Object.keys(config[singleClient]).length > 1 && config[singleClient].constructor === Object) {
        requireParams = true
      }
    } else if (hasSingle && Object.keys(config).length > 1 && config.constructor === Object) {
      requireParams = true
    }

    if (requireParams) {
      console.log(chalk.red.bold(`\n✖ Multiple clients / instance detected.`))
      console.log('Use ' + chalk.cyan('sfcc <command> <client> <instance>') + ' to specify which client instance.')
      console.log('Use ' + chalk.cyan('sfcc list') + ' to view complete list.\n')
      return null
    }

    return config
  }

  const getAll = () => {
    return config
  }

  const set = (config, isUpdate) => {
    fs.writeFileSync(configFile, JSON.stringify(config), 'utf8')

    if (isUpdate) {
      console.log(chalk.green(`\n【ツ】Updated: ${configFile} \n`))
    } else {
      console.log(chalk.green(`\n【ツ】Created: ${configFile} \n`))
    }
  }

  return {
    get,
    getAll,
    set,
  }
}
