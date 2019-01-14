#!/usr/bin/env node

const debug = require('debug')('cli')
const path = require('path')
const yargs = require('yargs')
const chalk = require('chalk')

const argv = yargs
  .usage('Usage: sfcc <command> <client> <instance> --switches')
  .command('setup', 'Setup SFCC Development', {
    client: {
      alias: 'c',
      describe: 'Client Name',
      type: 'string'
    },
    hostname: {
      alias: 'h',
      describe: 'Hostname for Instance',
      type: 'string'
    },
    version: {
      alias: 'v',
      describe: 'Code Version',
      type: 'string'
    },
    directory: {
      alias: 'd',
      describe: 'Absolute path to Repository',
      type: 'string'
    },
    username: {
      alias: 'u',
      describe: 'Your Business Manager Username',
      type: 'string'
    },
    password: {
      alias: 'p',
      describe: 'Your Business Manager Password',
      type: 'string'
    },
    alias: {
      alias: 'a',
      describe: 'Instance Alias',
      default: 'sandbox',
      type: 'string'
    }
  })
  .command('list', 'List Configured SFCC Clients')
  .command('delete <client> [instance]', 'Delete Config for Client')
  .command('watch [client] [instance]', 'Watch for Changes and Push Updates', {
    log: {
      describe: 'Pipe Output to ~/.sffc-cli.log',
      type: 'boolean',
      default: false
    },
    'errors-only': {
      describe: 'Only Show Notification for Errors',
      type: 'boolean',
      default: false
    }
  })
  .command('log [client] [instance]', 'Stream log files from an instance', {
    polling: {
      alias: 'p',
      describe: 'Polling Interval (seconds)',
      type: 'number',
      default: 2
    },
    lines: {
      alias: 'l',
      describe: 'Number of Lines to Display',
      type: 'number',
      default: 100
    },
    include: {
      alias: 'i',
      describe: 'Log Types to Include',
      type: 'array',
      default: []
    },
    exclude: {
      alias: 'e',
      describe: 'Log Types to Exclude',
      type: 'array',
      default: []
    },
    filter: {
      alias: 'f',
      describe: 'Filter Log Messages by RegExp',
      type: 'string',
      default: null
    },
    truncate: {
      alias: 't',
      describe: 'Length to Truncate Messages',
      type: 'number',
      default: null
    },
    list: {
      describe: 'Output List of Log Types',
      type: 'boolean',
      default: false
    },
    search: {
      describe: 'Search Logs with no Live Updates',
      type: 'boolean',
      default: false
    },
    latest: {
      describe: 'Show Latest Logs Only',
      type: 'boolean',
      default: false
    }
  })
  .command('remote [client] [instance]', 'Remote Control Sandbox Storefront', {
    'live-reload': {
      describe: 'Enable Live Reload on Code Change',
      type: 'boolean',
      default: false
    }
  })
  .example('sfcc delete my-client sandbox', 'Delete my-client sandbox config')
  .example('sfcc watch my-client sandbox', 'Watch for my-client sandbox changes')
  .example('sfcc log -i customerror --latest', 'Watch Latest Custom Error Logs')
  .example('sfcc remote --live-reload', 'Live Reload Sandbox Storefront on Changes')
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
