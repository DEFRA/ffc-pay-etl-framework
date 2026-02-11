const { Transform } = require('node:stream')

/**
 *
 * @param {Object} options
 * @param {String} options.column
 * @returns Writable
 */
// sonar-ignore-next-line
function StringReplaceTransformer (options) {
  const replacements = options

  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (chunk, _, callback) {
      const { _columns } = chunk
      // @ts-ignore
      replacements.forEach(r => {
        const colIndex = _columns.indexOf(r.column)
        if (colIndex === -1) {
          // column not found, skip
          return
        }
        if (r.all) {
          chunk[colIndex] = chunk[colIndex].replaceAll(r.find, r.replace)
        } else {
          chunk[colIndex] = chunk[colIndex].replace(r.find, r.replace)
        }
      })

      callback(null, chunk)
    }
  })
}

module.exports = {
  StringReplaceTransformer
}
