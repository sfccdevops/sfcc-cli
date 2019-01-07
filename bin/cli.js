#!/usr/bin/env node

const debug = require('debug')('cli');
const path = require('path');
const yargs = require('yargs');
const chalk = require('chalk');

const argv = yargs
  .usage('Usage: $0 <command> <instance> [options] --switches')
  .command('setup', 'Setup SFCC Development')
  .demand(1)
  .help()
  .version().argv;

const command = argv._[0];

try {
  debug(`Executing ${command}`);

  if (command === 'setup') {
    require(path.join(__dirname, `../commands/setup.js`))();
  } else {
    // const configured = config(argv);
    // require(path.join(__dirname, `../commands/${command}.js`))(configured);
  }
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(chalk.red(`\nThe command '${command}' is not valid.\n`));
    console.log(`Use '${argv.$0} help' for a list of commands.\n`);
  } else {
    throw err;
  }
}
