// eslint-disable-next-line
(() => {
  var ref = document.getElementById('sfcc-cli-remote')
  var script = document.createElement('script')

  script.src = 'https://localhost:8443/socket.io/socket.io.js'
  script.onerror = err => {
    console.log('REMOTE ERROR:', err)
  }
  script.onload = () => {
    var socket = io('https://localhost:8443')

    /* Handle Socket Messages */
    socket.on('connect', () => {
      console.log('SFCC-CLI: CONNECTED')
    })

    socket.on('error', error => {
      console.error('SFCC-CLI:', error)
    })

    socket.on('connect_error', error => {
      console.error('SFCC-CLI:', error)
      socket.disconnect()
    })

    socket.on('message', message => {
      console.log('SFCC-CLI:', message)
    })

    /* --live-reload */
    socket.on('refresh', updated => {
      if (updated) {
        console.log('SFCC-CLI: Reloading ...')
        window.location.reload(true)
      }
    })
  }

  ref.parentNode.insertBefore(script, ref)
})()
