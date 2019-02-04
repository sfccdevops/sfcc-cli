const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const express = require('express')
const fs = require('fs')
const https = require('https')
const ipc = require('node-ipc')
const ora = require('ora')
const path = require('path')

const config = require('../lib/config')()

const port = 8443

module.exports = async () => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let selected = null
  let remote
  let spinner

  const output = fn => {
    spinner.stop()
    fn()
    spinner.start()
  }

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
    const sslKey = path.resolve(__dirname, '../remote/ssl/sfcc-cli-ca.pvk')
    const sslCrt = path.resolve(__dirname, '../remote/ssl/sfcc-cli-ca.cer')

    // Start Message Bus
    ipc.config.id = 'remote'
    ipc.config.retry = 1500
    ipc.config.silent = true
    ipc.serve(() => {
      ipc.server.on('message', data => {
        if (remote && typeof remote.emit !== 'undefined') {
          remote.emit('message', data)
        } else {
          output(() => console.log(chalk.red.bold(`✖ Failed Remote Message`, data)))
        }
      })
      ipc.server.on('watch', data => {
        if (remote && typeof remote.emit !== 'undefined') {
          remote.emit('watch', data)
        } else {
          output(() => console.log(chalk.red.bold(`✖ Failed Remote Watch`, data)))
        }
      })
      ipc.server.on('log', data => {
        if (remote && typeof remote.emit !== 'undefined') {
          remote.emit('log', data)
        } else {
          output(() => console.log(chalk.red.bold(`✖ Failed Remote Log`, data)))
        }
      })
    })

    ipc.server.start()

    // Check that SSL files exist
    if (!fs.existsSync(sslKey)) {
      console.log(chalk.red.bold(`✖ Missing ${sslKey}`))
      console.log('See ./docs/cmd-remote.md for setup instructions.')
      process.exit()
    }

    if (!fs.existsSync(sslCrt)) {
      console.log(chalk.red.bold(`✖ Missing ${sslCrt}`))
      console.log('See ./docs/cmd-remote.md for setup instructions.')
      process.exit()
    }

    // Start Socket Server
    const app = express()
    const server = https.createServer(
      {
        key: fs.readFileSync(sslKey),
        cert: fs.readFileSync(sslCrt)
      },
      app
    )

    const io = require('socket.io')(server)

    // Handle connections from remote script
    io.on('connection', socket => {
      remote = socket

      socket.on('message', message => {
        console.log('MESSAGE', message)
      })

      socket.on('get-config', () => {
        io.emit('set-config', config.getAll())
      })
    })

    server.listen(port, function() {
      // Intentional Blank Space
      console.log('')
      spinner = ora(
        `${chalk.bold('REMOTE')} ${chalk.cyan.bold(client)} ${chalk.magenta.bold(instance)} [Ctrl-C to Cancel]\n`
      ).start()
    })
  }
}
