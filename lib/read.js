const path = require('path')
const axios = require('axios')

module.exports = async (file, options) => {
  try {
    const {data} = await axios(
      Object.assign({}, options, {
        url: path.isAbsolute(file) ? file : `/${file}`,
        method: 'GET',
      })
    )

    return data
  } catch (err) {}
}
