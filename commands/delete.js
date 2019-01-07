const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const confirm = require('prompt-confirm');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');

module.exports = async () => {
  const configFile = path.join(homedir, '.sfcc-cli');

  let config = {};
  const client = argv['_'][1] || null;
  const instance = argv['_'][2] || null;

  if (fs.existsSync(configFile)) {
    const currentConfig = fs.readFileSync(configFile, 'utf8');
    if (currentConfig) {
      let found = false;
      config = Object.assign({}, config, JSON.parse(currentConfig));

      if (client && instance) {
        if (
          config.hasOwnProperty(client) &&
          config[client].hasOwnProperty(instance)
        ) {
          found = true;
          delete config[client][instance];
        } else {
          console.log(
            chalk.red(
              `\n× Config does not contain client '${client}' with instance '${instance}'.\n`
            )
          );
        }
      } else if (client) {
        if (config.hasOwnProperty(client)) {
          found = true;
          delete config[client];
        } else {
          console.log(
            chalk.red(`\n× Config does not contain client '${client}'.\n`)
          );
        }
      }

      if (found) {
        const prompt = new confirm('Confirm Delete?');
        prompt.ask(function(confirmed) {
          if (confirmed) {
            fs.writeFileSync(configFile, JSON.stringify(config), 'utf8');
            console.log(chalk.green(`\n【ツ】Updated: ${configFile} \n`));
          }
        });
      }
    }
  } else {
    console.log(chalk.red('\n× No Clients'));
    console.log("Use 'sfcc setup' to get started.\n");
  }
};
