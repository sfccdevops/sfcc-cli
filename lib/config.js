const chalk = require('chalk');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

module.exports = () => {
  const configFile = path.join(homedir, '.sfcc-cli');
  let config = {};

  if (fs.existsSync(configFile)) {
    const currentConfig = fs.readFileSync(configFile, 'utf8');
    if (currentConfig) {
      config = Object.assign({}, config, JSON.parse(currentConfig));
    }
  }

  const get = (client, instance) => {
    if (client && instance) {
      if (
        config.hasOwnProperty(client) &&
        config[client].hasOwnProperty(instance)
      ) {
        return config[client][instance];
      }
    } else if (client) {
      if (config.hasOwnProperty(client)) {
        return config[client];
      }
    }

    return config;
  };

  const set = (config, isUpdate) => {
    fs.writeFileSync(configFile, JSON.stringify(config), 'utf8');

    if (isUpdate) {
      console.log(chalk.green(`\n【ツ】Updated: ${configFile} \n`));
    } else {
      console.log(chalk.green(`\n【ツ】Created: ${configFile} \n`));
    }
  };

  return {
    get,
    set
  };
};
