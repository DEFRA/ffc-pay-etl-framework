const { Transform } = require('node:stream')

/**
 *
 * @param {Object} options
 * @param {String} options.message
 * @param {String} options.column
 * @returns Transform
 */
// sonar-ignore-next-line
function UniqueValidator (options) {
  const column = options.column
  const message = options.message || 'Expected unique value is not unique'
  const uniqueColumnRows = new Set()

  function checkIsUnique (data) {
    return !uniqueColumnRows.has(data)
  }

  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    decodeStrings: false,
    construct (callback) {
      callback()
    },
    transform (chunk, _, callback) {
      const { _columns } = chunk
      const colIndex = _columns.indexOf(column)
      const uniqueValue = chunk[colIndex]

      if (checkIsUnique(uniqueValue)) {
        uniqueColumnRows.add(uniqueValue)
      } else {
        if (!chunk.errors) {
          chunk.errors = []
        }
        chunk.errors.push(`${message} ${column}`)
      }
      callback(null, chunk)
    }
  })
}

module.exports = {
  UniqueValidator
}
