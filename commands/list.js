const chalk = require('chalk');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

module.exports = async () => {
  const configFile = path.join(homedir, '.sfcc-cli');

  let config = {};

  if (fs.existsSync(configFile)) {
    const currentConfig = fs.readFileSync(configFile, 'utf8');
    if (currentConfig) {
      config = Object.assign({}, config, JSON.parse(currentConfig));

      console.log(chalk.green('\nSFCC CLIENTS:\n'));

      for (let client in config) {
        console.log(chalk.green('client: ' + client));

        for (let instance in config[client]) {
          console.log('  ' + chalk.cyan('instance: ' + instance));
          console.log('    hostname: ' + config[client][instance].h);
          console.log('    directory: ' + config[client][instance].d);
          console.log('    username: ' + config[client][instance].u);
          console.log(
            '    password: ' + config[client][instance].p.replace(/./g, '*')
          );
          console.log('    api_version: ' + config[client][instance].v);
        }

        console.log('');
      }
    }
  } else {
    console.log(chalk.red('\n× No Clients'));
    console.log("Use 'sfcc setup' to get started.\n");
  }
};
