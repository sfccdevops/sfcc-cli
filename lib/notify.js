const debounce = require('lodash/debounce')
const notifier = require('node-notifier')

module.exports = () => {
  return debounce(args => notifier.notify(args), 150)
}
