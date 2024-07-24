const { Transform } = require("node:stream")
const { faker } = require("@faker-js/faker")

/**
 * 
 * @param {Object} options 
 * @param {Array} options.columns { 
 *           columns: [
 *               {
 *                   name: "column-name",
 *                   faker: "company.name"
 *               }
 *           ]
 *       }
 * @returns StreamReader
 */
function FakerTransformer(options){
    let self = this
    self.columns = options.columns
    function getFaker(fakerType) {
        return fakerType.split('.').reduce((a,b) => {
            return Object.keys(a).length === 0 ? faker[b] : a[b]
        }, {})
    }
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk, _, callback){
            const { _columns } = chunk
            self.columns.forEach(column => {
                const colIndex = _columns.indexOf(column.name)
                chunk[colIndex] = getFaker(column.faker)()
            })
            callback(null, chunk)
        }
    })
}

module.exports = {
    FakerTransformer
}