const {exec} = require('child_process')
const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const chokidar = require('chokidar')
const fs = require('fs')
const ora = require('ora')
const path = require('path')

const config = require('../lib/config')()
const logger = require('../lib/logger')()
const notify = require('../lib/notify')()
const upload = require('../lib/upload')

module.exports = (options) => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let selected = null
  let errorMessage

  const useLog = options.log
  const errorsOnly = options.errorsOnly
  const compileOnly = options.compileOnly

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
    const text = `${chalk.bold('WATCHING')} ${chalk.cyan.bold(client)} ${chalk.magenta.bold(
      instance
    )} [Ctrl-C to Cancel]\n`
    const spinner = ora(text)
    const output = (fn) => {
      spinner.stop()
      fn()
      spinner.start()
    }

    // intentional empty
    console.log('')
    spinner.start()

    const watcher = chokidar.watch(selected.d, {
      ignored: [/[/\\]\./, '**/node_modules/**', '**/bundle-analyzer.*'],
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: true,
    })

    /**
     * Add support for SFRA
     * @param  {string} ext File Extension
     * @param  {string} dir Directory
     */
    const compile = (ext, dir) => {
      const jsCompile = `cd ${dir}; ./node_modules/.bin/sgmf-scripts --compile js`
      const cssCompile = `cd ${dir}; ./node_modules/.bin/sgmf-scripts --compile css`

      // Don't Compile if Native Compiler Missing
      if (!fs.existsSync(path.join(dir, 'node_modules', '.bin', 'sgmf-scripts'))) {
        return
      }

      if (ext === 'js') {
        output(() =>
          console.log(
            `${chalk.bgGreen.white.bold(' SFRA ')} ${chalk.cyan.bold('Compiling')} ${chalk.magenta.bold(
              'JavaScript'
            )} ...\n`
          )
        )

        if (!errorsOnly) {
          notify({
            title: `${client} ${instance}`,
            icon: path.join(__dirname, '../icons/', 'sfcc-cli.png'),
            subtitle: 'COMPILING JAVASCRIPT ...',
            message: `${path.basename(dir)}`,
          })
        }

        exec(jsCompile, (err, data, stderr) => {
          if (err || stderr) {
            output(() => console.log(chalk.red.bold(`✖ Build Error: ${err} ${stderr}`)))

            notify({
              title: `${client} ${instance}`,
              icon: path.join(__dirname, '../icons/', 'sfcc-error.png'),
              subtitle: 'COMPILING JAVASCRIPT FAILED',
              message: `${err} ${stderr}`,
              sound: true,
              wait: true,
            })
          } else {
            output(() => console.log(`${chalk.green.bold('COMPLETE')}\n`))
            output(() => console.log(data))
            output(() => console.log('\n'))

            if (!errorsOnly) {
              notify({
                title: `${client} ${instance}`,
                icon: path.join(__dirname, '../icons/', 'sfcc-success.png'),
                subtitle: 'COMPILE COMPLETE',
                message: `${path.basename(dir)}`,
              })
            }
          }
        })
      } else if (ext === 'css' || ext === 'scss') {
        output(() =>
          console.log(
            `${chalk.bgGreen.white.bold(' SFRA ')} ${chalk.cyan.bold('Compiling')} ${chalk.magenta.bold('CSS')} ...\n`
          )
        )

        if (!errorsOnly) {
          notify({
            title: `${client} ${instance}`,
            icon: path.join(__dirname, '../icons/', 'sfcc-cli.png'),
            subtitle: 'COMPILING CSS ...',
            message: `${path.basename(dir)}`,
          })
        }

        exec(cssCompile, (err, data, stderr) => {
          if (err || stderr) {
            output(() => console.log(chalk.red.bold(`✖ SFRA Compile Error: ${err} ${stderr}`)))

            notify({
              title: `${client} ${instance}`,
              icon: path.join(__dirname, '../icons/', 'sfcc-error.png'),
              subtitle: 'COMPILING CSS FAILED',
              message: `${err} ${stderr}`,
              sound: true,
              wait: true,
            })
          } else {
            output(() => console.log(`${chalk.green.bold('COMPLETE')}\n`))
            output(() => console.log(data))
            output(() => console.log('\n'))

            if (!errorsOnly) {
              notify({
                title: `${client} ${instance}`,
                icon: path.join(__dirname, '../icons/', 'sfcc-success.png'),
                subtitle: 'COMPILE COMPLETE',
                message: `${path.basename(dir)}`,
              })
            }
          }
        })
      }
    }

    const buildCheck = (file) => {
      if (Object.keys(selected.b).length > 0) {
        const checkPath = path.dirname(file).replace(path.normalize(selected.d), '')
        Object.keys(selected.b).map((build) => {
          const builder = selected.b[build]
          if (
            builder.enabled &&
            new RegExp(builder.watch.join('|')).test(checkPath) &&
            typeof builder.cmd.exec !== 'undefined' &&
            builder.cmd.exec.length > 0
          ) {
            const cmd = builder.cmd.exec
            const building = build.split('_')

            output(() =>
              console.log(
                `\n${chalk.bgGreen.white.bold(' BUILDING ')} ${chalk.cyan.bold(
                  building[1]
                )} for cartridge ${chalk.magenta.bold(building[0])} ...\n\n`
              )
            )
            exec(cmd, (err, data, stderr) => {
              if (err || stderr) {
                output(() => console.log(chalk.red.bold(`✖ Build Error: ${err} ${stderr}`)))
              }
            })
          }
        })
      } else {
        const filePath = path.dirname(file)
        const ext = file.split('.').pop()
        const dirs = filePath.split('/')
        const length = path.normalize(selected.d).split('/').length

        // Ignore file changes that are likely results from builds
        const ignoredPath = ['/css/', '/static/']

        // Check current directory for WebPack
        if (fs.existsSync(path.join(filePath, 'webpack.config.js')) && !new RegExp(ignoredPath.join('|')).test(file)) {
          compile(ext, filePath)
        } else {
          // Work our way backwards to look for WebPack until we get to project root
          for (var i = dirs.length; i >= length; i--) {
            dirs.pop()
            let curPath = dirs.join('/')

            if (
              fs.existsSync(path.join(curPath, 'webpack.config.js')) &&
              !new RegExp(ignoredPath.join('|')).test(file)
            ) {
              compile(ext, curPath)
              break
            }
          }
        }
      }
    }

    // Custom Callback ( not currently in use, might extend this in the future )
    const callback = () => {}

    // Watch for File Changes
    watcher.on('change', (file) => {
      if (!compileOnly) {
        upload({file, spinner, selected, client, instance, options, callback})
      }

      buildCheck(file)
    })

    watcher.on('add', (file) => {
      if (!compileOnly) {
        upload({file, spinner, selected, client, instance, options, callback})
      }

      buildCheck(file)
    })

    // @TODO: Watch for Removing Files
    watcher.on('unlink', (file) => {
      if (!compileOnly) {
        output(() => console.log(`${chalk.red('✖ REMOVING')} ${file.replace(selected.d, '.')}`))
      }
    })

    // Watch for Errors
    watcher.on('error', (error) => {
      notify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-error.png'),
        subtitle: 'WATCH FAILED',
        message: error,
        sound: true,
        wait: true,
      })

      errorMessage = `✖ Watch Error for '${client}' '${instance}': ${error}.`
      if (useLog) {
        logger.log(errorMessage)
      } else {
        output(() => console.log(chalk.red.bold(`\n${errorMessage}`)))
      }
    })

    watcher.on('ready', () => {
      if (!errorsOnly) {
        notify({
          title: `${client} ${instance}`,
          icon: path.join(__dirname, '../icons/', 'sfcc-cli.png'),
          subtitle: 'STARTING WATCHER',
          message: 'Waiting for Changes ...',
        })
      }

      if (useLog) {
        logger.log(`Watching ${client} ${instance}`, true)
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
