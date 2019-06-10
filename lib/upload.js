const chalk = require('chalk')
const path = require('path')
const pRetry = require('p-retry')

const logger = require('../lib/logger')()
const notify = require('../lib/notify')()
const write = require('./write')
const mkdirp = require('./mkdirp')

module.exports = async ({file, spinner, selected, client, instance, options, callback}) => {
  const src = path.relative(process.cwd(), file)
  const uploading = new Set()
  const useLog = options.log
  const errorsOnly = options.errorsOnly

  if (!uploading.has(src)) {
    const dir = path.dirname(file).replace(path.normalize(selected.d), '')
    const dest = path.join('/', 'Cartridges', selected.v, dir)
    const text = chalk.bold(`Watching ${client} ${instance}`).concat(' [Ctrl-C to Cancel]\n')

    uploading.add(src)

    if (!errorsOnly) {
      notify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-uploading.png'),
        subtitle: 'UPLOADING ...',
        message: `${path.basename(src)}`
      })
    }

    let logMessage = `${chalk.cyan('▲ UPLOADING')} ${file.replace(selected.d, '.')}...`

    if (useLog) {
      logger.log(logMessage)
    } else {
      spinner.stop()
      console.log(logMessage)
    }

    try {
      const request = {
        baseURL: `https://${selected.h}/on/demandware.servlet/webdav/Sites/`,
        auth: {
          username: selected.u,
          password: selected.p
        }
      }

      const tryToMkdir = () => mkdirp(dest, request)
      const tryToWrite = () => write(file, dest, request)

      await pRetry(tryToMkdir, {retries: 5})
      await pRetry(tryToWrite, {retries: 5})

      if (!errorsOnly) {
        notify({
          title: `${client} ${instance}`,
          icon: path.join(__dirname, '../icons/', 'sfcc-success.png'),
          subtitle: 'UPLOAD COMPLETE',
          message: `${path.basename(src)}`
        })
      }

      if (typeof callback === 'function') {
        callback({
          type: 'upload',
          client: client,
          instance: instance,
          message: file.replace(selected.d, '.'),
          timestamp: new Date().toString()
        })
      }

      logMessage = `${chalk.green('COMPLETE')} ${file.replace(selected.d, '.')}`

      if (useLog) {
        logger.log(logMessage)
      } else {
        spinner.text = logMessage
        spinner.succeed()

        setTimeout(() => {
          spinner.text = text
          spinner.start()
        }, 3000)
      }
    } catch (err) {
      let errorMessage = `Unable to Upload ${path.basename(src)}`
      if (typeof err.retriesLeft !== 'undefined' && err.retriesLeft === 0) {
        errorMessage = 'Invalid Username or Password.  Run `sfcc setup` or edit ~/.sfcc-cli'
      }

      if (useLog) {
        logger.log('✖ ' + errorMessage)
      } else {
        spinner.text = errorMessage
        spinner.fail()
      }

      notify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-error.png'),
        subtitle: 'UPLOAD FAILED',
        message: errorMessage,
        sound: true,
        wait: true
      })
    }
  }
}
