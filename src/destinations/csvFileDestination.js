const EventEmitter = require('node:events')
const util = require('node:util')
const { Writable } = require("node:stream")
const fs = require("fs")

/**
 * 
 * @param {Object} options 
 * @param {String} options.fileName
 * @param {Boolean} options.headers
 * @param {Boolean} options.includeErrors
 * @param {Boolean} options.quotationMarks
 * @returns Writable
 */
function CSVFileDestination(options){
    EventEmitter.call(this)
    let lastChunk
    const fileName = options.fileName
    const headers = options.headers
    const includeErrors = options.includeErrors
    const quotationMarks = options.quotationMarks
    let fileHandle
    fs.open(fileName, 'w+', ((error, fd) => {
        fileHandle = fd
    }))
    let headersWritten = false
    const writable = new Writable({
        objectMode: true,
        write(chunk, _, callback){
            if(!headersWritten && headers) {
                if(quotationMarks){
                    fs.writeFileSync(fileHandle, `${chunk._columns.map(c => `"${c}"`).join(",")}\n`)
                } else {
                    fs.writeFileSync(fileHandle, `${chunk._columns.join(",")}\n`)
                }
                headersWritten = true
            }
            if(chunk.errors.length === 0 || includeErrors){
                if(quotationMarks){
                    fs.writeFileSync(fileHandle, `${chunk.map(c => `"${c}"`).join(",")}\n`)
                } else {
                    fs.writeFileSync(fileHandle, `${chunk.map(c => `"${c}"`).join(",")}\n`)
                }
            }
            // @ts-ignore
            this.tasks?.forEach(task => task.write(chunk))
            lastChunk = chunk
            callback()
        },
        final(callback){
            this.emit('result', lastChunk)
            callback()
        }
    })

    Object.assign(writable, {
        setConnection: function (connection){
            this.connection = connection
        }.bind(writable),
        getConnectionName: function (){
            return this.connection?.name
        }.bind(writable),
        setTasks: function(tasks){
            this.tasks = tasks
        }.bind(writable)
    })

    return writable
}

util.inherits(CSVFileDestination, EventEmitter)

module.exports = {
    CSVFileDestination
}
