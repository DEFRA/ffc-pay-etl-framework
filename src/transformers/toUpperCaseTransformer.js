const { Transform } = require("node:stream")

/**
 * 
 * @param {Object} options 
 * @param {String} options.column
 * @returns Writable
 */
function ToUpperCaseTransformer(options){
    let self = this
    self.column = options.column

    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk, _, callback){
            const { _columns } = chunk
            const colIndex = _columns.indexOf(self.column)
            chunk[colIndex] = chunk[colIndex].toUpperCase()
            callback(null, chunk)
        }
    })
}

module.exports = {
    ToUpperCaseTransformer
}