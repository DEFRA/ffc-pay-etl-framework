// @ts-nocheck
const { Transform } = require("stream")
const validator = require('validator')

/**
 * 
 * @param {Object} options 
 * @param {Array} options.columns { columns: [
 *   {
 *       name: "column-name",
 *       validator: "isAlphanumeric",
 *       args: {
 *               locale: "en-GB",
 *               options: {
 *                   ignore: "-;%/ "
 *               }
 *       }
 *   }
 *  ]
 * }
 * @returns Writable
 */
function MultiToolValidator(options){
    function getValidator(validatorType){
        return validator[validatorType]
    }
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        decodeStrings: false,
        construct(callback){
            this.columns = options.columns
            callback()
        },
        transform(chunk, _, callback){
            const { _columns } = chunk
            this.columns.forEach(column => {
                const colIndex = _columns.indexOf(column.name)
                const vtr = getValidator(column.validator)
                if(!vtr(chunk[colIndex],...Object.values(column.args)))
                    chunk.errors.push(`${column.validator} returned invalid status in column ${colIndex}`)
            })
            callback(null, chunk)
        }
    })
}

module.exports = {
    MultiToolValidator
}