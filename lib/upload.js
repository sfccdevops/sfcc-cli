const debounce = require('lodash/debounce')
const notifier = require('node-notifier')
const path = require('path')
const pRetry = require('p-retry')

const codeVersion = require('./branch')()
const write = require('./write')
const mkdirp = require('./mkdirp')

module.exports = async ({file, spinner, watching, client, instance}) => {
  const src = path.relative(process.cwd(), file)
  const debouncedNotify = debounce(args => notifier.notify(args), 150)
  const uploading = new Set()

  if (!uploading.has(src)) {
    const dir = path.dirname(file).replace(path.normalize(watching.d), '')
    const dest = path.join('/', 'Cartridges', codeVersion, dir)

    uploading.add(src)

    debouncedNotify({
      title: `${client} ${instance}`,
      icon: path.join(__dirname, '../icons/', 'sfcc-uploading.png'),
      subtitle: 'UPLOADING ...',
      message: `${path.basename(src)} => ${dest}`
    })

    let text = `Watching ${client} ${instance} [Ctrl-C to Cancel]`

    spinner.stopAndPersist({
      text: `Uploading ${file.replace(watching.d, '.')} ...`
    })
    spinner.text = text
    spinner.start()

    try {
      const request = {
        baseURL: `https://${watching.h}/on/demandware.servlet/webdav/Sites/`,
        auth: {
          username: watching.u,
          password: watching.p
        }
      }

      const tryToMkdir = () => mkdirp(dest, request)
      const tryToWrite = () => write(src, dest, request)

      await pRetry(tryToMkdir, {retries: 5})
      await pRetry(tryToWrite, {retries: 5})

      debouncedNotify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-success.png'),
        subtitle: 'UPLOAD COMPLETE',
        message: `${path.basename(src)} => ${dest}`
      })

      spinner.text = `${path.basename(src)} pushed to ${client} ${instance}`
      spinner.succeed()

      setTimeout(() => {
        spinner.text = text
        spinner.start()
      }, 3000)
    } catch (err) {
      spinner.text = err.message
      spinner.fail()

      debouncedNotify({
        title: `${client} ${instance}`,
        icon: path.join(__dirname, '../icons/', 'sfcc-error.png'),
        subtitle: 'UPLOAD FAILED',
        message: err.message
      })
    }
  }
}
