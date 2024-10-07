const EventEmitter = require('node:events')
const { Transform } = require('node:stream')
const { Sequelize } = require('sequelize')
const debug = require('debug')('destination')
const DEFAULT_PORT = 5432

function isKeyWord(column) {
    return ['USER'].includes(column.toUpperCase())
}

function getMappingForColumn(mapping, column){
    const [map] = mapping.filter(m => m.column === column)
    return map
}

function writeInsertStatement(columnMapping, table, chunk){
    let statement = `INSERT INTO ${table} (${chunk._columns.map(column => {
        const mapping = getMappingForColumn(columnMapping, column)
        return mapping.targetColumn
            ?
            isKeyWord(mapping.targetColumn)
                ? `"${mapping.targetColumn}"`
                : mapping.targetColumn
            : isKeyWord(column)
                ? `"${mapping.column}"`
                : mapping.column
    })
    .join(",")}) VALUES (${chunk._columns.map((column,index) => {
        const mapping = getMappingForColumn(columnMapping, column)
        if(!mapping) debug('Mapping not found for column %s', column)
        if (mapping.targetType === "number" && (isNaN(chunk[index]) || chunk[index] === '')) {
            debug('Source data is not a number')
            return 0
        }
        if(mapping.targetType === "varchar" || mapping.targetType === "char"){
            return `'${chunk[index]}'`
        }
        if(mapping.targetType === "date"){
            return `to_date('${chunk[index]}','${mapping.format}')`
        }
        return chunk[index] ? chunk[index] : 'null'
    })})`
    return statement
}

/**
 * 
 * @param {Object} options 
 * @param {Object} options.table
 * @param {Object} options.connectionname
 * @param {Object} options.mapping
 * @param {Object} options.includeErrors
 * @returns Transform
 */
function PostgresDestination(options){
    EventEmitter.call(this)
    const table = options.table
    const connectionname = options.connectionname
    const mapping = options.mapping
    const includeErrors = options.includeErrors
    let lastChunk

    const transform = new Transform({
        objectMode: true,
        emitClose: true,
        construct(callback){
            // @ts-ignore
            this.connectionname = connectionname
            callback()
        },
        write(chunk, _, callback){
            let insertStatement
            // @ts-ignore
            if(chunk.errors.length === 0 | options.includeErrors){
                insertStatement = writeInsertStatement(mapping, table, chunk)
                debug('Insert statement: [%s]', insertStatement)
                // @ts-ignore
                this.connection.db.query(insertStatement)
                    .then(result => {
                        debug('result %o', result)
                        chunk._result = result
                        lastChunk = chunk
                        // @ts-ignore
                        callback(null, chunk)
                    }).catch(error => {
                        debug('error %o', error)
                        chunk.errors.push(error)
                        lastChunk = chunk
                        // @ts-ignore
                        callback(error, chunk)
                    })
            } else {
                debug('Chunk has errors %o', chunk)
            }
        },
        final(callback){
            this.emit('result', lastChunk)
            callback()
        }
    })
    Object.assign(transform, {
        setConnection: function (connection){
            this.connection = connection
        }.bind(transform),
        getConnectionName: function (){
            return this.getConnectionName
        }.bind(transform)
    })
    return transform;
}

module.exports = {
    PostgresDestination,
    writeInsertStatement,
    isKeyWord,
    getMappingForColumn
}
