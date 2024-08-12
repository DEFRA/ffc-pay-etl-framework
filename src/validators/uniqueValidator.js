const { Transform } = require("node:stream")

/**
 * 
 * @param {Object} options 
 * @param {String} options.message
 * @param {String} options.column
 * @returns Transform
 */
function UniqueValidator(options){
    let self = this
    self.column = options.column
    self.message = options.message ? options.message : "Expected unique value is not unique"
    self.uniqueColumnRows = []
    function checkIsUnique(data){
        return self.uniqueColumnRows.indexOf(data) === -1
    }
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        decodeStrings: false,
        construct(callback){
            callback()
        },
        transform(chunk, _, callback){
            const { _columns } = chunk
            const colIndex = _columns.indexOf(self.column)
            const uniqueValue = chunk[colIndex]
            if(checkIsUnique(uniqueValue)){
                self.uniqueColumnRows.push(uniqueValue)
            } else {
                chunk.errors.push(`${self.message} ${self.column}`)
            }
            callback(null, chunk)
        }
    })
}

module.exports = {
    UniqueValidator
}