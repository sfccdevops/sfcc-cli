const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const chokidar = require('chokidar');
const fs = require('fs');
const homedir = require('os').homedir();
const ora = require('ora');
const path = require('path');
const upload = require('../lib/upload');

module.exports = async () => {
  const configFile = path.join(homedir, '.sfcc-cli');

  let config = {};
  const client = argv['_'][1] || null;
  const instance = argv['_'][2] || null;

  if (fs.existsSync(configFile)) {
    const currentConfig = fs.readFileSync(configFile, 'utf8');
    if (currentConfig) {
      config = Object.assign({}, config, JSON.parse(currentConfig));

      if (client && instance) {
        if (
          config.hasOwnProperty(client) &&
          config[client].hasOwnProperty(instance)
        ) {
          const watching = config[client][instance];
          const watcher = chokidar.watch('dir', {
            ignored: [/[/\\]\./, '**/node_modules/**'],
            ignoreInitial: true,
            persistent: true,
            atomic: true
          });

          let text = `Watching ${client} ${instance} [Ctrl-C to Cancel]`;
          let spinner = ora(text).start();

          // Add Instance Directory to Watch List
          watcher.add(watching.d);

          // Watch for File Changes
          watcher.on('change', file => {
            upload({file, spinner, watching, client, instance});
          });
          watcher.on('add', file => {
            upload({file, spinner, watching, client, instance});
          });

          // Watch for Removing Files
          watcher.on('unlink', upload);

          // Watch for Errors
          watcher.on('error', upload);
        } else {
          console.log(
            chalk.red(
              `\n× Config does not contain client '${client}' with instance '${instance}'.\n`
            )
          );
        }
      }
    }
  } else {
    console.log(chalk.red('\n× No Clients'));
    console.log("Use 'sfcc setup' to get started.\n");
  }
};
