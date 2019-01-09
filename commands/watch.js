const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const chokidar = require('chokidar')
const ora = require('ora')
const path = require('path')

const logger = require('../lib/logger')()
const notify = require('../lib/notify')()
const config = require('../lib/config')()
const upload = require('../lib/upload')

module.exports = options => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let watching = null
  let errorMessage
  let logMessage

  const useLog = options.log
  const errorsOnly = options.errorsOnly

  if (client && instance) {
    watching = config.get(client, instance)
  } else {
    const defaultConfig = config.get(client, instance, true)

    if (defaultConfig) {
      client = defaultConfig.client
      instance = defaultConfig.instance
      watching = defaultConfig.config
    }
  }

  if (watching) {
    let spinner
    const watcher = chokidar.watch('dir', {
      ignored: [/[/\\]\./, '**/node_modules/**'],
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: true,
      atomic: true
    })

    // Add Instance Directory to Watch List
    watcher.add(watching.d)

    // Watch for File Changes
    watcher.on('change', file => {
      upload({file, spinner, watching, client, instance, options})
    })
    watcher.on('add', file => {
      upload({file, spinner, watching, client, instance, options})
    })

    // @TODO: Watch for Removing Files
    watcher.on('unlink', file => {
      console.log('UNLINK', file)
    })

    // Watch for Errors
    watcher.on('error', error => {
      notify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-error.png'),
        subtitle: 'WATCH FAILED',
        message: error,
        sound: true,
        wait: true
      })

      errorMessage = `✖ Watch Error for '${client}' '${instance}': ${error}.`
      if (useLog) {
        logger.log(errorMessage)
      } else {
        console.log(chalk.red.bold(`\n${errorMessage}`))
      }
    })

    watcher.on('ready', () => {
      if (!errorsOnly) {
        notify({
          title: `${client} ${instance}`,
          icon: path.join(__dirname, '../icons/', 'sfcc-cli.png'),
          subtitle: 'STARTING WATCHER',
          message: 'Waiting for Changes ...'
        })
      }

      logMessage = `Watching ${client} ${instance}`
      if (useLog) {
        logger.log(logMessage, true)
      } else {
        spinner = ora(`${logMessage} [Ctrl-C to Cancel]`).start()
      }
    })
  } else if (client && instance) {
    errorMessage = `✖ Config does not contain client '${client}' with instance '${instance}'.`
    if (useLog) {
      logger.log(errorMessage)
    } else {
      console.log(chalk.red.bold(`\n${errorMessage}`))
      console.log('Use ' + chalk.cyan('sfcc setup') + ' to get started.\n')
    }
  }
}
