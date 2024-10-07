// @ts-nocheck
const { PassThrough } = require("stream")
const startPosOffset = 3
const endPosOffset = 1

function getPlaceHolders(sql){
  const columnNamePlaceholderRegex = /(?<=\$\{)(.*?)(?=})/g
  const matches = Array.from(sql.matchAll(columnNamePlaceholderRegex))
  return matches.map(match => ({
    match: match[0],
    value: match[0].split('.')[1],
    collection: match[0].split('.')[0],
    startPos: match.index - startPosOffset,
    endPos: match.index + match[0].length - endPosOffset
  }))
}

function doPlaceHolderValueInterpolations(chunk, sql, placeholders){
  placeholders.forEach(placeholder => {
    sql = sql.replace(new RegExp(`\\$\{${placeholder.match}}`),
    chunk[chunk[`_${placeholder.collection}`].indexOf(placeholder.value)])
  })
  return sql
}

function PostgresSQLTask(options){
  const passthrough = new PassThrough({
    readableObjectMode: true,
    writableObjectMode: true,
    decodeStrings: false,
    construct(callback){
        this.sql = options.sql
        this.connectionname = options.connectionname
        callback()
    },
    transform(chunk, _, callback){
      const placeholders = getPlaceHolders(this.sql)
      if(placeholders.length === 0){
        this.connection.db.query(this.sql)
      }
      else {
        const interpolatedSql = doPlaceHolderValueInterpolations(chunk, this.sql, placeholders)
        this.connection.db.query(interpolatedSql)
      }
      callback(null, chunk)
    }
  })
  // Should definately split this out into a mixin
  Object.assign(passthrough, {
    setConnection: function (connection){
        this.connection = connection
    }.bind(passthrough),
    getConnectionName: function (){
        return this.connectionname
    }.bind(passthrough)
  })
  return passthrough
}

module.exports = {
  PostgresSQLTask,
  getPlaceHolders,
  doPlaceHolderValueInterpolations
}