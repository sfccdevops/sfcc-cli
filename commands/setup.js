const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const fs = require('fs')
const prompt = require('prompt')
const slug = require('slug')

const config = require('../lib/config')()

module.exports = async () => {
  if (argv && typeof argv.a === 'undefined') {
    argv.a = 'sandbox'
  }

  prompt.message = ''
  prompt.error = ''
  prompt.delimiter = ''
  prompt.override = argv

  prompt.start()
  prompt.get(
    [
      {
        description: chalk.cyan('Client Name:'),
        name: 'c',
        pattern: /^[a-zA-Z-_ ]+$/,
        required: true
      },
      {
        description: chalk.cyan('Hostname:'),
        name: 'h',
        pattern: /^[a-z0-9_.-]+$/,
        message: 'Invalid Host Name. ( e.g. dev04-web-mysandbox.demandware.net )',
        required: true,
        conform: function(hostname) {
          if (typeof hostname !== 'string') return false

          var parts = hostname.split('.')
          if (parts.length <= 1) return false

          var tld = parts.pop()
          var tldRegex = /^(?:xn--)?[a-zA-Z0-9]+$/gi

          if (!tldRegex.test(tld)) return false

          var isValid = parts.every(function(host) {
            var hostRegex = /^(?!:\/\/)([a-zA-Z0-9]+|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])$/gi
            return hostRegex.test(host)
          })

          return isValid
        }
      },
      {
        description: chalk.cyan('Instance Alias:'),
        name: 'a',
        pattern: /^[a-z0-9]+$/,
        message: 'Invalid Instance Alias. ( e.g. dev04, sandbox, staging, etc )',
        required: true,
        default: 'sandbox'
      },
      {
        description: chalk.cyan('Directory:'),
        name: 'd',
        required: true,
        message: 'Directory does not exist. ( e.g. /Users/RVW/Projects/mysandbox )',
        conform: function(directory) {
          return fs.existsSync(directory)
        }
      },
      {
        description: chalk.cyan('Username:'),
        name: 'u',
        pattern: /^[a-zA-Z0-9_@.-]+$/,
        message: 'Invalid Username. ( e.g. myusername, my@email.com, etc )',
        required: true
      },
      {
        description: chalk.cyan('Password:'),
        name: 'p',
        required: true,
        hidden: true,
        replace: '*'
      }
    ],
    function(err, result) {
      if (err) {
        if (err.message === 'canceled') {
          console.log(chalk.red('× Setup Cancelled'))
          process.exit(1)
        } else {
          console.log(chalk.red('× ERROR:', err))
        }
      } else {
        const client = slug(result.c, {lower: true, replacement: '-'})
        const alias = slug(result.a, {lower: true, replacement: '-'})
        const currentConfig = config.get()

        let newConfig = {}
        let isUpdate = false

        // Get current config if it is already there
        if (Object.keys(currentConfig).length > 0 && currentConfig.constructor === Object) {
          newConfig = Object.assign({}, newConfig, currentConfig)
          isUpdate = true
        }

        // Check if this is a new client
        if (typeof newConfig[client] === 'undefined') {
          newConfig[client] = {}
        }

        // Create / Overwrite SFCC Instance for Client
        newConfig[client][alias] = {
          h: result.h,
          d: result.d,
          u: result.u,
          p: result.p
        }

        // Write Config File
        config.set(newConfig, isUpdate)
      }
    }
  )
}