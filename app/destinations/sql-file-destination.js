const { Writable } = require('node:stream')
const fs = require('node:fs')

/**
 * @enum {number}
 */
const SQL_MODE = {
  INSERT_MODE: 1,
  UPDATE_MODE: 2
}

/**
 *
 * @param {Object} options
 * @param {String} options.fileName
 * @param {SQL_MODE} options.mode
 * @param {String} options.table
 * @param {Array} options.mapping
 * @param {Boolean} options.includeErrors
 * @returns Transform
 */
// sonar-ignore-next-line
function SQLFileDestination (options) {
  const fileName = options.fileName
  const sqlMode = options.mode
  const table = options.table
  const mapping = options.mapping

  function writeInsertStatement (chunk) {
    const statement = `INSERT INTO ${table} (${mapping.map(m => m.targetColumn)
        .join(',')}) VALUES (${mapping.map((m) => {
            const srcColumnIndex = chunk._columns.indexOf(m.column)
            if (m.targetType === 'string') { return `'${chunk[srcColumnIndex]}'` }
            return chunk[srcColumnIndex]
        })});\n`
    fs.writeFileSync(fileName, statement, {
      encoding: 'utf8',
      flag: 'a+'
    })
  }
  const writable = new Writable({
    objectMode: true,
    write (chunk, _, callback) {
      if (chunk.errors.length === 0 && sqlMode === SQL_MODE.INSERT_MODE) {
        writeInsertStatement(chunk)
      }
      callback()
    }
  })

  Object.assign(writable, {
    setConnection: function (connection) {
      this.connection = connection
    }.bind(writable),
    getConnectionName: function () {
      return this.connection?.name
    }.bind(writable),
    setTasks: function (tasks) {
      this.tasks = tasks
    }.bind(writable)
  })

  return writable
}

module.exports = {
  SQLFileDestination,
  SQL_MODE
}
