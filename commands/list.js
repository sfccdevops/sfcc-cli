const chalk = require('chalk');

const config = require('../lib/config')();

module.exports = async () => {
  const currentConfig = config.get();

  if (
    Object.keys(currentConfig).length > 0 &&
    currentConfig.constructor === Object
  ) {
    console.log(chalk.green('\nSFCC CLIENTS:\n'));

    for (let client in currentConfig) {
      console.log(chalk.green('client: ' + client));

      for (let instance in currentConfig[client]) {
        console.log('  ' + chalk.cyan('instance: ' + instance));
        console.log('    hostname: ' + currentConfig[client][instance].h);
        console.log('    directory: ' + currentConfig[client][instance].d);
        console.log('    username: ' + currentConfig[client][instance].u);
        console.log(
          '    password: ' +
            currentConfig[client][instance].p.replace(/./g, '*')
        );
      }

      console.log('');
    }
  } else {
    console.log(chalk.red('\n× No Clients'));
    console.log("Use 'sfcc setup' to get started.\n");
  }
};
