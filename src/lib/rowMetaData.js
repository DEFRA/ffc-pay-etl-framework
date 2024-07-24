// @ts-nocheck
const { Transform } = require("stream")
const util = require("util")

function RowMetaData(options) {
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        decodeStrings: false,
        construct(callback){
            this.rowId = 0
            callback()
        },
        transform(chunk, _, callback){
            chunk['_rowId'] = this.rowId
            chunk['errors'] = []
            this.rowId +=1
            callback(null, chunk)
        }
    })
}

module.exports = {
    RowMetaData
}