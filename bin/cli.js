#!/usr/bin/env node

const debug = require('debug')('cli')
const path = require('path')
const yargs = require('yargs')
const chalk = require('chalk')

const argv = yargs
  .usage('Usage: $0 <command> <client> <instance> --switches')
  .command('setup', 'Setup SFCC Development', {
    client: {
      alias: 'c',
      describe: 'Client Name'
    },
    hostname: {
      alias: 'h',
      describe: 'Hostname for Instance'
    },
    version: {
      alias: 'v',
      describe: 'Code Version'
    },
    directory: {
      alias: 'd',
      describe: 'Absolute path to Repository'
    },
    username: {
      alias: 'u',
      describe: 'Your Business Manager Username'
    },
    password: {
      alias: 'p',
      describe: 'Your Business Manager Password'
    },
    alias: {
      alias: 'a',
      describe: 'Instance Alias',
      default: 'sandbox'
    }
  })
  .command('list', 'List Configured SFCC Clients')
  .command('delete <client> [instance]', 'Delete Config for Client')
  .command('watch [client] [instance]', 'Watch for Changes and Push Updates', {
    log: {
      describe: 'Pipe Output to Log File ~/.sffc-cli.log',
      default: false
    },
    'errors-only': {
      describe: 'Only Show Notification for Errors',
      default: false
    }
  })
  .command('log [client] [instance]', 'Stream log files from an instance', {
    interval: {
      describe: 'Polling interval (seconds)',
      default: 2
    },
    lines: {
      describe: 'Number of lines to display',
      default: 100
    },
    include: {
      describe: 'Log levels to include',
      type: 'array',
      default: []
    },
    exclude: {
      describe: 'Log levels to exclude',
      type: 'array',
      default: []
    },
    list: {
      describe: 'Output a list of available log levels',
      default: false
    },
    dates: {
      describe: 'Output a list of available log dates',
      default: false
    },
    filter: {
      describe: 'Filter log messages by regexp',
      default: null
    },
    length: {
      describe: 'Length to truncate a log message',
      default: null
    },
    search: {
      describe: 'Search all log files',
      default: false
    },
    'no-timestamp': {
      describe: "Don't convert timestamps to local time",
      default: false
    },
    latest: {
      describe: 'Show Latest Logs Only',
      boolean: false
    }
  })
  .example('$0 delete my-client sandbox', 'Delete my-client sandbox config')
  .example('$0 watch my-client sandbox', 'Watch for my-client sandbox changes')
  .demand(1)
  .help()
  .version().argv

const command = argv._[0]

try {
  debug(`Executing ${command}`)
  require(path.join(__dirname, `../commands/${command}.js`))(argv)
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(chalk.red.bold(`\n✖ Command 'sfcc ${command}' not recognized\n`))
    console.log('Use ' + chalk.cyan('sfcc help') + ' for a list of commands\n')
  } else {
    throw err
  }
}
