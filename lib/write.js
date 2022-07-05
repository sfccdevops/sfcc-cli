const fs = require('fs-extra')
const path = require('path')
const axios = require('axios')
const followRedirects = require('follow-redirects')

followRedirects.maxBodyLength = 100 * 1024 * 1024

module.exports = (src, dest, options) => {
  try {
    const url = path.join('/', dest, path.basename(src))
    const stream = fs.createReadStream(src)
    const config = Object.assign(
      {
        url,
        method: 'put',
        validateStatus: (status) => status < 400,
        maxRedirects: 0,
      },
      {data: stream},
      options
    )

    const request = axios(config)
      .then(() => url)
      .catch((error) => {
        console.log('error', error)
      })

    return request
  } catch (err) {}
}
