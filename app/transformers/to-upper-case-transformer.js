const { Transform } = require('node:stream')

/**
 *
 * @param {Object} options
 * @param {String} options.column
 * @returns Writable
 */
// sonar-ignore-next-line
function ToUpperCaseTransformer (options) {
  const column = options.column

  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform (chunk, _, callback) {
      const { _columns } = chunk
      const colIndex = _columns.indexOf(column)

      if (colIndex !== -1 && chunk[colIndex] != null) {
        chunk[colIndex] = chunk[colIndex].toUpperCase()
      }
      callback(null, chunk)
    }
  })
}

module.exports = {
  ToUpperCaseTransformer
}
