const { Transform } = require("node:stream")

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
 * @param {String} options.locale
 * @returns StreamReader
 */
function FakerTransformer(options){
    let self = this
    self.columns = options.columns
    let faker;
    if(options.locale){
        faker = require(`@faker-js/faker/locale/${options.locale}`).faker
    } else {
        faker = require('@faker-js/faker').faker
    }
    
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