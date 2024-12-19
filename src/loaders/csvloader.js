const fs = require("fs")
const { Transform } = require("stream")
const { parse } = require("csv-parse")

/**
 * @typedef {Object} CSVLoaderOptions
 * @property {string} path The path to the CSV file
 * @property {string[]} columns The columns in the CSV file
 */

/**
 * @typedef {import('stream').Readable} Readable
 */

/**
 * @typedef {Readable & {_columns?: string[], pump?: (csvLoader: Readable) => Readable}} CSVLoaderStream
 */

/**
 * 
 * @param {CSVLoaderOptions} options 
 * @returns {CSVLoaderStream}
 */
function CSVLoader(options){
    /** @type {CSVLoaderStream} */
    let csvLoader = fs.createReadStream(options.path)
    let lineCount = 1
    csvLoader._columns = options.columns
    csvLoader.pump = (csvLoader) => {
        return csvLoader
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .pipe(new Transform({
                readableObjectMode: true,
                writableObjectMode: true,
                emitClose: true,
                transform(chunk, _, callback){
                    console.log(`Processing chunk: ${JSON.stringify(chunk)}`)
                    chunk["_columns"] = options.columns
                    chunk["_linecount"] = lineCount
                    lineCount += 1

                    // remove non-printable characters
                    options.columns.forEach((_column, index) => {
                        if (chunk[index]) {
                            console.log(`Before: ${chunk[index].split('').map(char => char.charCodeAt(0)).join(', ')}`)
                            chunk[index] = chunk[index].replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                            console.log(`After: ${chunk[index].split('').map(char => char.charCodeAt(0)).join(', ')}`)
                        }
                    })

                    callback(null, chunk)
                }
            }))
    }
    return csvLoader
}

module.exports = {
    CSVLoader
}