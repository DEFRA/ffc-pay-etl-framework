const { Writable } = require("node:stream")

/**
 * 
 * @param {Object} options 
 * @param {String} options.includeErrors
 * @returns Writable
 */
function ConsoleDestination(options){
    const includeErrors = options.includeErrors
    return new Writable({
        objectMode: true,
        write(chunk, _, callback){
            if(chunk.errors.length === 0 || includeErrors)
                console.log(chunk)
            callback()
        }
    })
}

module.exports = {
    ConsoleDestination
}