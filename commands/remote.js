const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const express = require('express')
const fs = require('fs')
const https = require('https')
const ipc = require('node-ipc')
const path = require('path')

const config = require('../lib/config')()

const port = 8443

module.exports = async options => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let selected = null
  let remote

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
    const jsFile = path.resolve(__dirname, '../remote/sfcc-cli-remote.js')

    // Start Message Bus
    ipc.config.id = 'remote'
    ipc.config.retry = 1500
    ipc.config.silent = true
    ipc.serve(() => {
      ipc.server.on('message', message => {
        console.log('MESSAGE', message)
        remote.emit('message', message)
      })
      ipc.server.on('watch', data => {
        console.log('WATCH', data)
        remote.emit('watch', data)
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

    // https://localhost:8443/sfcc-cli-remote.js
    app.get('/sfcc-cli-remote.js', (req, res) => {
      res.set('Content-Type', 'application/javascript')
      res.send(fs.readFileSync(jsFile))
    })

    // Handle connections from remote script
    io.on('connection', socket => {
      remote = socket
      // Check if Live Reload flag was enabled
      if (options.liveReload) {
        remote.emit('message', 'Live Reload Enabled')
      }

      socket.on('message', message => {
        console.log('MESSAGE', message)
      })

      socket.on('get-config', () => {
        io.emit('set-config', config.getAll())
      })
    })

    server.listen(port, function() {
      console.log(`\n${chalk.bold('IMPORTANT')}: Make sure your sandbox has the following script tag:`)
      console.log('<script src="https://localhost:8443/sfcc-cli-remote.js" id="sfcc-cli-remote"></script>\n')

      // ora(
      //   `${chalk.bold('REMOTE')} ${chalk.cyan.bold(client)} ${chalk.magenta.bold(instance)} [Ctrl-C to Cancel]\n`
      // ).start()
    })
  }
}
