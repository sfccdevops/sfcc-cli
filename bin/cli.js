#!/usr/bin/env node

const debug = require('debug')('cli');
const path = require('path');
const yargs = require('yargs');
const chalk = require('chalk');

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
    },
    'api-version': {
      alias: 'v',
      describe: 'API Version',
      default: 'v16_6'
    }
  })
  .command('list', 'List Configured SFCC Clients')
  .command('delete <client> [instance]', 'Delete Config for Client')
  .command('watch <client> <instance>', 'Watch for Changes and Push Updates', {
    spinner: {
      describe: 'Show the watch spinner',
      default: true
    }
  })
  .example('$0 delete my-client sandbox', 'Delete my-client sandbox config')
  .example('$0 watch my-client sandbox', 'Watch for my-client sandbox changes')
  .demand(1)
  .help()
  .version().argv;

const command = argv._[0];

try {
  debug(`Executing ${command}`);
  require(path.join(__dirname, `../commands/${command}.js`))();
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(chalk.red(`\nCommand '${command}' not valid.\n`));
    console.log(`Use '${argv.$0} help' for a list of commands.\n`);
  } else {
    throw err;
  }
}
