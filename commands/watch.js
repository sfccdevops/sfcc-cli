const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const chokidar = require('chokidar')
const debounce = require('lodash/debounce')
const notifier = require('node-notifier')
const ora = require('ora')
const path = require('path')

const config = require('../lib/config')()
const upload = require('../lib/upload')

module.exports = async () => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let watching = null

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
    const debouncedNotify = debounce(args => notifier.notify(args), 150)
    const watcher = chokidar.watch('dir', {
      ignored: [/[/\\]\./, '**/node_modules/**'],
      ignoreInitial: true,
      persistent: true,
      atomic: true
    })

    let text = `Watching ${client} ${instance} [Ctrl-C to Cancel]`
    let spinner = ora(text).start()

    // Add Instance Directory to Watch List
    watcher.add(watching.d)

    // Watch for File Changes
    watcher.on('change', file => {
      upload({file, spinner, watching, client, instance})
    })
    watcher.on('add', file => {
      upload({file, spinner, watching, client, instance})
    })

    // Watch for Removing Files
    watcher.on('unlink', upload)

    // Watch for Errors
    watcher.on('error', upload)

    debouncedNotify({
      title: `${client} ${instance}`,
      icon: path.join(__dirname, '../icons/', 'sfcc-cli.png'),
      subtitle: 'STARTING WATCHER',
      message: 'Waiting for Changes ...'
    })
  } else if (client && instance) {
    console.log(chalk.red(`\n× Config does not contain client '${client}' with instance '${instance}'.`))
    console.log('Use ' + chalk.cyan('sfcc setup') + ' to get started.\n')
  }
}
