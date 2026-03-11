// @ts-nocheck
const fs = require('node:fs')
const { Transform } = require('node:stream')
const { parse } = require('csv-parse')

/**
 *
 * @param {Object} options
 * @param {String} [options.path]
 * @param {ReadableStream} [options.stream]
 * @param {Number} [options.startingLine]
 * @param {Boolean} [options.relax]
 * @returns StreamReader
 */
function csvLoader (options) {
  let loader
  if (options.path) {
    loader = fs.createReadStream(options.path)
  } else {
    loader = options.stream
  }
  let lineCount = 1
  const fromLine = options.startingLine ?? 2
  const relaxQuotes = options.relax ?? false
  loader._columns = options.columns
  loader.pump = () => {
    const parser = parse({ delimiter: ',', from_line: fromLine, relax_quotes: relaxQuotes })
    const transformer = new Transform({
      readableObjectMode: true,
      writableObjectMode: true,
      emitClose: true,
      transform (chunk, _, callback) {
        chunk['_columns'] = options.columns
        chunk['_linecount'] = lineCount
        lineCount += 1

        // remove non-printable characters
        options.columns.forEach((_column, index) => {
          if (chunk[index]) {
            // eslint-disable-next-line no-control-regex
            chunk[index] = chunk[index].replaceAll(/[\x00-\x1F\x7F-\x9F]/g, '')
          }
        })

        callback(null, chunk)
      }
    })
    return loader
      .pipe(parser)
      .pipe(transformer)
  }

  return loader
}

module.exports = {
  CSVLoader: csvLoader
}
