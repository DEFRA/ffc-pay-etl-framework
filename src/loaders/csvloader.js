const fs = require("fs")
const { Transform } = require("stream")
const { parse } = require("csv-parse")

/**
 * 
 * @param {Object} options 
 * @param {String} options.path
 * @returns StreamReader
 */
function CSVLoader(options){
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
                            chunk[index] = chunk[index].replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                        }
                    })

                    callback(null, chunk)
                }
            })
        )
    }
    return csvLoader
}

module.exports = {
    CSVLoader
}