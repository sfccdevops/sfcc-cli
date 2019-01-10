const chalk = require('chalk')
const compact = require('lodash/compact')
const map = require('lodash/map')
const ora = require('ora')
const truncate = require('lodash/truncate')

const read = require('./read')

module.exports = async (selected, logs, groups, options) => {
  const including = options.include && options.include.length > 0 ? ` '${options.include.join(', ')}'` : ''
  const excluding = options.exclude && options.exclude.length > 0 ? ` '${options.exclude.join(', ')}'` : ''
  const filters = options.filter && options.filter.length > 0 ? ` containing '${options.filter}'` : ''

  const text = `Streaming${including}${excluding} Logs${filters} [Ctrl-C to Cancel]`
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

          output(() => console.log(`${chalk.cyan.bold(name)} ${line}`))
        }
      }
    }

    setTimeout(tail, options.polling * 1000)
  }

  tail()
}
