const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const chokidar = require('chokidar')
const ipc = require('node-ipc')
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

    // Connect to Remote Message Bus
    let remote = null

    ipc.config.id = 'upload'
    ipc.config.retry = 1500
    ipc.config.silent = true

    ipc.connectTo('remote', () => {
      ipc.of.remote.on('connect', () => {
        remote = ipc.of.remote
      })
      ipc.of.remote.on('disconnect', () => {
        remote = null
      })
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

    const callback = data => {
      if (remote && typeof remote.emit !== 'undefined') {
        remote.emit('watch', data)
      }
    }

    // Watch for File Changes
    watcher.on('change', file => {
      upload({file, spinner, selected, client, instance, options, callback})
      buildCheck(file)
    })

    watcher.on('add', file => {
      upload({file, spinner, selected, client, instance, options, callback})
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

      if (remote && typeof remote.emit !== 'undefined') {
        remote.emit('watch', {
          type: 'error',
          client: client,
          instance: instance,
          message: error,
          timestamp: new Date().toString()
        })
      }

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

      setTimeout(() => {
        if (remote && typeof remote.emit !== 'undefined') {
          remote.emit('watch', {
            type: 'watch',
            client: client,
            instance: instance,
            message: 'Starting Watcher',
            timestamp: new Date().toString()
          })
        }
      }, 100)

      if (useLog) {
        logger.log(`Watching ${client} ${instance}`, true)
      } else {
        spinner = ora(
          `${chalk.bold('WATCHING')} ${chalk.cyan.bold(client)} ${chalk.magenta.bold(instance)} [Ctrl-C to Cancel]\n`
        ).start()
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
