// @ts-nocheck
const fs = require("fs")
const { Transform } = require("stream")
const { parse } = require("csv-parse")
const { stdout, stderr } = require("process")

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
            .pipe(parse({ delimiter: ",", from_line: 3 }))
            .pipe(new Transform({
                readableObjectMode: true,
                writableObjectMode: true,
                emitClose: true,
                transform(chunk, _, callback){
                    chunk["_columns"] = options.columns
                    chunk["_linecount"] = lineCount
                    lineCount +=1
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