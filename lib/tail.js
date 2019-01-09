const chalk = require('chalk')
const compact = require('lodash/compact')
const map = require('lodash/map')
const ora = require('ora')
const truncate = require('lodash/truncate')

const read = require('./read')

module.exports = async (selected, logs, groups, options) => {
  const text = 'Streaming'
  const spinner = ora(text)
  const output = fn => {
    spinner.stop()
    fn()
    spinner.start()
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
          if (options.length > 0) {
            line = truncate(line.trim(), {
              length: options.length,
              omission: ''
            })
          }
          if (!options.noTimestamp) {
            line = line.replace(/\[(.+)\sGMT\]/g, (exp, match) => {
              const date = new Date(Date.parse(match + 'Z'))
              return chalk.magenta(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`)
            })
          }
          if (options.filter) {
            line = line.replace(new RegExp(options.filter, 'g'), exp => {
              return chalk.yellow(exp)
            })
          }
          output(() => console.log(`${chalk.white(name)} ${line}`, 'blue'))
        }
      }
    }
  }

  setTimeout(tail, options.interval * 1000)
}
