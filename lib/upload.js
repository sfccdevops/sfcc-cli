const path = require('path')
const pRetry = require('p-retry')

const logger = require('../lib/logger')()
const notify = require('../lib/notify')()
const write = require('./write')
const mkdirp = require('./mkdirp')

module.exports = async ({file, spinner, selected, client, instance, options}) => {
  const src = path.relative(process.cwd(), file)
  const uploading = new Set()

  const useLog = options.log
  const errorsOnly = options.errorsOnly

  if (!uploading.has(src)) {
    const dir = path.dirname(file).replace(path.normalize(selected.d), '')
    const dest = path.join('/', 'Cartridges', selected.v, dir)
    const text = `Watching ${client} ${instance} [Ctrl-C to Cancel]`

    uploading.add(src)

    if (!errorsOnly) {
      notify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-uploading.png'),
        subtitle: 'UPLOADING ...',
        message: `${path.basename(src)} => ${dest}`
      })
    }

    let logMessage = `Uploading ${file.replace(selected.d, '.')} ...`

    if (useLog) {
      logger.log(logMessage)
    } else {
      spinner.stopAndPersist({text: logMessage})
      spinner.text = text
      spinner.start()
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
      const tryToWrite = () => write(src, dest, request)

      await pRetry(tryToMkdir, {retries: 5})
      await pRetry(tryToWrite, {retries: 5})

      if (!errorsOnly) {
        notify({
          title: `${client} ${instance}`,
          icon: path.join(__dirname, '../icons/', 'sfcc-success.png'),
          subtitle: 'UPLOAD COMPLETE',
          message: `${path.basename(src)} => ${dest}`
        })
      }

      logMessage = `${path.basename(src)} pushed to ${client} ${instance}`

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
      if (useLog) {
        logger.log('✖ ' + err.message)
      } else {
        spinner.text = err.message
        spinner.fail()
      }

      notify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-error.png'),
        subtitle: 'UPLOAD FAILED',
        message: err.message,
        sound: true,
        wait: true
      })
    }
  }
}
