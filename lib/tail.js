const chalk = require('chalk')
const compact = require('lodash/compact')
const ipc = require('node-ipc')
const map = require('lodash/map')
const ora = require('ora')
const truncate = require('lodash/truncate')

const read = require('./read')

module.exports = async (selected, client, instance, logs, groups, options) => {
  const including = options.include && options.include.length > 0 ? ` '${options.include.join(', ')}'` : ''
  const excluding = options.exclude && options.exclude.length > 0 ? ` excluding '${options.exclude.join(', ')}'` : ''
  const filters = options.filter && options.filter.length > 0 ? ` containing '${options.filter}'` : ''
  const text = chalk.bold(`Streaming${including} Logs${excluding}${filters}`).concat(' [Ctrl-C to Cancel]\n')
  const spinner = ora(text)
  const output = fn => {
    spinner.stop()
    fn()
    spinner.start()
  }

  // Connect to Remote Message Bus
  let remote = null

  ipc.config.id = 'log'
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

  const sendLog = data => {
    if (remote && typeof remote.emit !== 'undefined') {
      remote.emit('log', data)
    } else {
      output(() => console.log('REMOTE NOT CONNECTED'))
    }
  }

  const tail = async () => {
    const promises = map(groups, async (files, name) => {
      const displayname = files[0].displayname
      try {
        const response = await read(`Logs/${displayname}`, {
          baseURL: `https://${selected.h}/on/demandware.servlet/webdav/Sites/`,
          auth: {
            username: selected.u,
            password: selected.p
          }
        })
        return {
          response,
          name
        }
      } catch (err) {
        sendLog({
          type: 'error',
          client: client,
          instance: instance,
          message: err.toString(),
          timestamp: new Date().toString()
        })
        output(() => console.log(err))
      }
    })

    const results = await Promise.all(promises)

    for (const {response, name} of compact(results)) {
      const lines = response.split('\n').slice(-options.lines)

      for (let line of lines) {
        if (line && !logs[name].includes(line)) {
          logs[name].push(line)

          if (options.filter && !new RegExp(options.filter).test(line)) {
            continue
          }

          let messageClass = 'log'

          if (name.includes('error')) {
            messageClass = 'error'
          } else if (name.includes('warn')) {
            messageClass = 'warn'
          } else if (name.includes('info')) {
            messageClass = 'info'
          }

          let message = `<strong class="${messageClass}">${name}</strong> ${line}`
          let parseDate = line.match(/\[(.+)\sGMT\]/)
          let timestamp = new Date()

          if (parseDate && parseDate.length > 1) {
            timestamp = new Date(Date.parse(parseDate[1] + 'Z'))
          }

          if (options.truncate > 0) {
            line = truncate(line.trim(), {
              length: options.truncate,
              omission: '…'
            })
          }

          if (options.filter) {
            line = line.replace(new RegExp(options.filter, 'g'), exp => {
              return chalk.white.bgGreen.bold(exp)
            })
          }

          line = line.replace(/\[(.+)\sGMT\]/g, (exp, match) => {
            const date = new Date(Date.parse(match + 'Z'))
            return chalk.magenta(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`)
          })

          sendLog({
            type: 'log',
            client: client,
            instance: instance,
            message: message,
            timestamp: timestamp.toString()
          })

          output(() => console.log(`${chalk.cyan.bold(name)} ${line}`))
        }
      }
    }

    setTimeout(tail, options.polling * 1000)
  }

  tail()
}
