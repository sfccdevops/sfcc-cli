process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const argv = require('minimist')(process.argv.slice(2))
const config = require('../lib/config')()

const port = 1822
const fs = require('fs')
const https = require('https')
const express = require('express')
const app = express()
const server = https.createServer(
  {
    key: fs.readFileSync('./localhost.key'),
    cert: fs.readFileSync('./localhost.crt')
  },
  app
)

const io = require('socket.io')(server)

const doRefresh = true

app.get('/sfcc-live-reload.js', (req, res) => {
  res.set('Content-Type', 'application/javascript')
  res.send(`
    var ref = document.getElementById('sfcc-live-reload');
    var script = document.createElement('script');
    script.src = 'https://localhost:1822/socket.io/socket.io.js';
    script.onload = function() {
      console.log('test')
      var socket = io('https://localhost:1822');

      socket.on('connect', () => {
        console.log('CONNECTED');
      });

      socket.on('message', (message) => {
        console.log('message', message);
      });

      socket.on('refresh', (updated) => {
        if (updated) {
          window.location.reload(true);
        }
      });

      setInterval(function(){
        socket.emit('check-refresh', true);
      }, 10000);
    };

    ref.parentNode.insertBefore(script, ref);
  `)
})

io.on('connection', socket => {
  console.log('new connection')
  socket.emit('message', 'This is a message from the dark side.')

  socket.on('check-refresh', () => {
    console.log('check-refresh')

    if (doRefresh) {
      socket.emit('refresh', true)
    }
  })
})

server.listen(port, function() {
  console.log('server up and running at %s port', port)
})

module.exports = async options => {
  let client = argv['_'][1] || null
  let instance = argv['_'][2] || null
  let selected = null

  // Get Client & Instance, or check for Default
  if (client && instance) {
    selected = config.get(client, instance)
  } else {
    const defaultConfig = config.get(client, instance, true)

    if (defaultConfig) {
      client = defaultConfig.client
      instance = defaultConfig.instance
      selected = defaultConfig.config
    }
  }

  if (selected) {
    console.log(options)
  }
}
