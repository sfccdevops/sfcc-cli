const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const chokidar = require('chokidar')
const ora = require('ora')
const path = require('path')
const {exec} = require('child_process')

const logger = require('../lib/logger')()
const notify = require('../lib/notify')()
const config = require('../lib/config')()
const upload = require('../lib/upload')

module.exports = options => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let selected = null
  let errorMessage
  let logMessage

  const useLog = options.log
  const errorsOnly = options.errorsOnly

  // Get Client & Instance, or check for Default
  if (client && instance) {
    selected = config.get(client, instance)
  } else {
    const defaultConfig = config.get(client, instance, true)

    if (defaultConfig) {
      client = defaultConfig.client
      instance = defaultConfig.instance
      selected = defaultConfig.config
    }
  }

  if (selected) {
    let spinner
    const watcher = chokidar.watch(selected.d, {
      ignored: [/[/\\]\./, '**/node_modules/**'],
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: true
    })

    const buildCheck = file => {
      if (Object.keys(selected.b).length > 0) {
        const checkPath = path.dirname(file).replace(path.normalize(selected.d), '')
        Object.keys(selected.b).map(build => {
          const builder = selected.b[build]
          if (
            builder.enabled &&
            new RegExp(builder.watch.join('|')).test(checkPath) &&
            typeof builder.cmd.exec !== 'undefined' &&
            builder.cmd.exec.length > 0
          ) {
            const cmd = builder.cmd.exec
            const building = build.split('_')
            console.log(
              `\n${chalk.bgGreen.white.bold(' BUILDING ')} ${chalk.cyan.bold(
                building[1]
              )} for cartridge ${chalk.magenta.bold(building[0])} ...\n\n`
            )

            exec(cmd, (err, data, stderr) => {
              if (err || stderr) {
                console.log(chalk.red.bold(`✖ Build Error: ${err} {stderr}`))
              }
            })
          }
        })
      }
    }

    // Watch for File Changes
    watcher.on('change', file => {
      upload({file, spinner, selected, client, instance, options})
      buildCheck(file)
    })
    watcher.on('add', file => {
      upload({file, spinner, selected, client, instance, options})
      buildCheck(file)
    })

    // @TODO: Watch for Removing Files
    watcher.on('unlink', file => {
      console.log(`${chalk.red('✗ REMOVING')} ${file.replace(selected.d, '.')}`)
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
        spinner = ora(`${chalk.bold(logMessage)} [Ctrl-C to Cancel]\n`).start()
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
