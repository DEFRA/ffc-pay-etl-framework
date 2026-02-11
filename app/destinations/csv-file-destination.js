const EventEmitter = require('node:events')
const util = require('node:util')
const { Writable } = require('node:stream')
const fs = require('node:fs')

/**
 *
 * @param {Object} options
 * @param {String} options.fileName
 * @param {Boolean} options.headers
 * @param {Boolean} options.includeErrors
 * @param {Boolean} options.quotationMarks
 * @returns Writable
 */
function CSVFileDestination (options) {
  EventEmitter.call(this)
  let lastChunk
  const fileName = options.fileName
  const headers = options.headers
  const includeErrors = options.includeErrors
  const quotationMarks = options.quotationMarks

  let fileHandle
  try {
    fileHandle = fs.openSync(fileName, 'w+')
  } catch (error) {
    throw new Error(`Failed to open file ${fileName}: ${error.message}`)
  }

  let headersWritten = false

  const writable = new Writable({
    objectMode: true,
    write (chunk, _, callback) {
      try {
        if (!headersWritten && headers) {
          if (quotationMarks) {
            const quotedColumns = chunk._columns.map(c => `"${c}"`).join(',')
            fs.writeSync(fileHandle, quotedColumns + '\n')
          } else {
            fs.writeSync(fileHandle, `${chunk._columns.join(',')}\n`)
          }
          headersWritten = true
        }

        const errors = Array.isArray(chunk.errors) ? chunk.errors : []

        if (errors.length === 0 || includeErrors) {
          const line = chunk.map(c => `"${c}"`).join(',') + '\n'
          fs.writeSync(fileHandle, line)
        }

        if (this.tasks && Array.isArray(this.tasks)) {
          this.tasks.forEach(task => task.write(chunk))
        }

        lastChunk = chunk
        callback()
      } catch (err) {
        callback(err)
      }
    },
    final (callback) {
      if (fileHandle) {
        fs.closeSync(fileHandle)
      }

      this.emit('result', lastChunk)
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

util.inherits(CSVFileDestination, EventEmitter)

module.exports = {
  CSVFileDestination
}
