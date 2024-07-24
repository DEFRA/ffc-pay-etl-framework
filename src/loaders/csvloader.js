// @ts-nocheck
const fs = require("fs")
const { Transform } = require("stream")
const { parse } = require("csv-parse")
const { stdout } = require("process")

/**
 * 
 * @param {Object} options 
 * @param {String} options.path
 * @returns StreamReader
 */
function CSVLoader(options){
    let csvLoader = fs.createReadStream(options.path)
    csvLoader._columns = options.columns
    csvLoader.pump = (csvLoader) => {
        return csvLoader
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .pipe(new Transform({
                readableObjectMode: true,
                writableObjectMode: true,
                transform(chunk, _, callback){
                    chunk["_columns"] = options.columns
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