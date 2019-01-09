const chalk = require('chalk')
const compact = require('lodash/compact')
const map = require('lodash/map')
const ora = require('ora')
const truncate = require('lodash/truncate')

const read = require('./read')

module.exports = async (selected, groups, options) => {
  const including = options.include && options.include.length > 0 ? ` '${options.include.join(', ')}'` : ''
  const excluding = options.exclude && options.exclude.length > 0 ? ` '${options.exclude.join(', ')}'` : ''
  const filters = options.filter && options.filter.length > 0 ? ` containing '${options.filter}'` : ''

  const text = `Searching${including}${excluding} Logs${filters} [Ctrl-C to Cancel]`
  const spinner = ora(text)
  const output = fn => {
    spinner.stop()
    fn()
    spinner.start()
  }

  const promiseGroups = map(groups, (files, name) => {
    return map(files, async file => {
      const displayname = file.displayname
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
  })

  for (const promises of promiseGroups) {
    const results = await Promise.all(promises)

    for (const {response, name} of compact(results)) {
      const lines = response.split('\n').slice(-options.lines)

      for (let line of lines) {
        if (line) {
          if (!options.noTimestamp) {
            line = line.replace(/\[(.+)\sGMT\]/g, (exp, match) => {
              const date = new Date(Date.parse(match + 'Z'))
              return chalk.magenta(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`)
            })
          }
          // if there's a filter and it doesn't pass .,., the ignore line
          if (options.filter && !new RegExp(options.filter, 'ig').test(line)) {
            continue
          }
          // highlight the matching parts of the line
          if (options.filter) {
            line = line.replace(new RegExp(options.filter, 'ig'), exp => {
              return chalk.white.bgGreen.bold(exp)
            })
          }

          if (options.truncate > 0) {
            line = truncate(line.trim(), {
              length: options.truncate,
              omission: '…'
            })
          }

          output(() => console.log(`${chalk.cyan.bold(name)} ${line}`))
        }
      }
    }
  }

  // spinner.stop();
  spinner.text = `Search ${including}${excluding} Logs${filters} Complete`
  spinner.succeed()
  process.exit()
}
