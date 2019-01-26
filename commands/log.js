const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const forEach = require('lodash/forEach')
const groupBy = require('lodash/groupBy')
const keys = require('lodash/keys')
const pickBy = require('lodash/pickBy')
const sortBy = require('lodash/sortBy')

const config = require('../lib/config')()
const find = require('../lib/find')
const search = require('../lib/search')
const tail = require('../lib/tail')

module.exports = async options => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let selected = null

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
    let files = await find('Logs', {
      baseURL: `https://${selected.h}/on/demandware.servlet/webdav/Sites/`,
      auth: {
        username: selected.u,
        password: selected.p
      }
    })

    files = files.filter(({displayname}) => displayname.includes('.log'))

    // Group Logs
    let groups = groupBy(files, ({displayname}) => displayname.split('-blade')[0])

    // pick out logs we want to include
    if (options.include.length > 0) {
      if (options.include.length === 1 && options.include[0].includes(',')) {
        options.include = options.include[0].split(',')
      }
      groups = pickBy(
        groups,
        (group, name) =>
          options.include.filter(level => {
            return new RegExp(level).test(name)
          }).length > 0
      )
    }

    // pick out logs we want to exclude
    if (options.exclude.length > 0) {
      if (options.exclude.length === 1 && options.exclude[0].includes(',')) {
        options.exclude = options.exclude[0].split(',')
      }
      groups = pickBy(
        groups,
        (group, name) =>
          options.exclude.filter(level => {
            return new RegExp(level).test(name)
          }).length === 0
      )
    }

    // get list of log types
    if (options.list) {
      console.log(chalk.green.bold('\nLog Types:\n'))

      forEach(keys(groups).sort(), group => {
        console.log('· ' + group)
      })

      console.log('')

      process.exit()
    }

    // setup logs
    const logs = []
    forEach(groups, (files, name) => {
      logs[name] = []
    })

    // sort groups by last modified
    forEach(groups, (files, name) => {
      var sorted = sortBy(files, file => new Date(file.getlastmodified)).reverse()
      groups[name] = options.latest ? [sorted[0]] : sorted
    })

    try {
      // Start log output
      options.search
        ? search(selected, client, instance, groups, options)
        : tail(selected, client, instance, logs, groups, options)
    } catch (err) {
      console.log(err)
    }
  }
}
