const { Transform } = require("node:stream")

/**
 * 
 * @param {Object} options 
 * @param {String} options.column
 * @returns Writable
 */
function StringReplaceTransformer(options){
    let self = this
    self.replacements = options

    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk, _, callback){
            const { _columns } = chunk
            // @ts-ignore
            self.replacements.forEach(r => {
              const colIndex = _columns.indexOf(r.column)
              if(r.all){
                chunk[colIndex] = chunk[colIndex].replaceAll(r.find, r.replace)
              }
              else {
                chunk[colIndex] = chunk[colIndex].replace(r.find, r.replace)
              }
            })
            
            callback(null, chunk)
        }
    })
}

module.exports = {
    StringReplaceTransformer
}