const fs = require('fs-extra')
const homedir = require('os').homedir()
const path = require('path')
const truncate = require('truncate-logs')

module.exports = () => {
  const logFile = path.join(homedir, '.sfcc-cli.log')

  fs.ensureFileSync(logFile)

  const createMessage = (message) => {
    return new Date().toLocaleString('en-US', {hour12: false}).replace(', ', '-') + ': ' + message + '\n'
  }

  const log = (message, start) => {
    // Starting a new Watch, let's clean out some old junk to keep log file down
    if (start) {
      truncate([logFile], {lines: 500})
    }

    fs.appendFile(logFile, createMessage(message), function (err) {
      if (err) throw err
    })
  }

  return {
    log,
  }
}
