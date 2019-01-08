const fs = require('fs-extra')
const path = require('path')
const debug = require('debug')('write')
const axios = require('axios')
const followRedirects = require('follow-redirects')

followRedirects.maxBodyLength = 100 * 1024 * 1024

module.exports = (src, dest, options) => {
  try {
    debug(`Uploading ${src}`)

    const url = path.join('/', dest, path.basename(src))
    const stream = fs.createReadStream(src)

    const config = Object.assign(
      {
        url,
        method: 'put',
        validateStatus: status => status < 400,
        maxRedirects: 0
      },
      {data: stream},
      options
    )

    return axios(config).then(() => url)
  } catch (err) {}
}
