// @ts-nocheck
const { PassThrough } = require("stream")

function PostgresSQLTask(options){
  return new PassThrough({
    readableObjectMode: true,
    writableObjectMode: true,
    decodeStrings: false,
    construct(callback){
        this.sql = options.sql      
        callback()
    },
    transform(chunk, _, callback){
        console.log(chunk)
        console.log(this.sql)
        callback(null, chunk)
    }
  })
}

module.exports = {
  PostgresSQLTask
}