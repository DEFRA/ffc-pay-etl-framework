// @ts-nocheck
const fs = require("fs")
const { Transform } = require("stream")
const { parse } = require("csv-parse")

/**
 * 
 * @param {Object} options 
 * @param {String} [options.path]
 * @param {ReadableStream} [options.stream]
 * @param {Number} [options.startingLine]
 * @param {Boolean} [options.relax]
 * @returns StreamReader
 */
function CSVLoader(options) {
    let csvLoader
    if (options.path) {
        csvLoader = fs.createReadStream(options.path)
    } else {
        csvLoader = options.stream
    }
    let lineCount = 1
    const fromLine = options.startingLine ?? 2
    const relaxQuotes = options.relax ?? false
    csvLoader._columns = options.columns
    csvLoader.pump = (csvLoader) => {
        const parser = parse({ delimiter: ",", from_line: fromLine, relax_quotes: relaxQuotes })
        const transformer = new Transform({
            readableObjectMode: true,
            writableObjectMode: true,
            emitClose: true,
            transform(chunk, _, callback) {
                chunk["_columns"] = options.columns
                chunk["_linecount"] = lineCount
                lineCount += 1
    
                // remove non-printable characters
                options.columns.forEach((_column, index) => {
                    if (chunk[index]) {
                        chunk[index] = chunk[index].replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                    }
                })
    
                callback(null, chunk)
            }
        })
    
        parser.on('error', (err) => csvLoader.emit('error', err))
        transformer.on('error', (err) => csvLoader.emit('error', err))
    
        return csvLoader
            .pipe(parser)
            .pipe(transformer)
    }

    return csvLoader
}

module.exports = {
    CSVLoader
}