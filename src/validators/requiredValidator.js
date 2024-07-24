// @ts-nocheck
const { Transform } = require("stream")

/**
 * 
 * @param {Object} options 
 * @param {String} options.message
 * @param {Array} options.columns
 * @returns Transform
 */
function RequiredValidator(options){
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        decodeStrings: false,
        construct(callback){
            this.message = options.message ? options.message : "Required value is null"
            this.requiredColumns = options.columns
            callback()
        },
        transform(chunk, _, callback){
            this.requiredColumns.forEach(column => {
                let requiredVal = chunk[column]
                if(requiredVal === undefined || requiredVal === '') {
                    chunk.errors.push(`${this.message} in column ${column}`)
                }
            })
            callback(null, chunk)
        }
    })
}

module.exports = {
    RequiredValidator
}