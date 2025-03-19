const EventEmitter = require('node:events')
const { Transform } = require('node:stream')
const debug = require('debug')('destination')
const DEFAULT_PORT = 5432

function isKeyWord(column) {
    return ['USER'].includes(column.toUpperCase())
}

function getMappingForColumn(mapping, column){
    if(mapping.length === 0) { return {} }
    const [map] = mapping.filter(m => m.column === column)
    return map
}

function hasReturningColumns(mapping){
    return mapping.filter(m => m.returning === true).length > 0
}

function getReturningColumns(mapping){
    return mapping.filter(m => m.returning === true).map(m => m?.targetColumn)
}

function writeInsertStatement(columnMapping, table, chunk, schema){
    let statement = `INSERT INTO ${schema ?? 'public'}."${table}" (${chunk._columns.map(column => {
        const mapping = getMappingForColumn(columnMapping, column)
        return mapping?.targetColumn ? `"${mapping.targetColumn}"` : `"${mapping?.column}"`
    })
    .join(",")}) VALUES (${chunk._columns.map((column,index) => {
        const mapping = getMappingForColumn(columnMapping, column)
        if (mapping?.targetType === "number" && (isNaN(chunk[index]) || chunk[index] === '')) {
            debug('Source data is not a number')
            return 0
        }
        if(mapping?.targetType === "varchar" || mapping?.targetType === "char"){
            return `'${chunk[index]}'`
        }
        if (mapping?.targetType === "date") {
            if (!chunk[index]) {
                return `''`
            }
            return `to_timestamp('${chunk[index]}','${mapping?.format}')`
        }
        return chunk[index] ? chunk[index] : 'null'
    })})`
    if(hasReturningColumns(columnMapping)){
        statement = statement + ` RETURNING ${getReturningColumns(columnMapping).join(',')}`
    }
    return statement
}

/**
 * 
 * @param {Object} options 
 * @param {Object} options.table
 * @param {Object} options.connectionname
 * @param {Object} options.mapping
 * @param {Object} options.includeErrors
 * @param {String} [options.schema]
 * @returns Transform
 */
function PostgresDestination(options){
    EventEmitter.call(this)
    const table = options.table
    const connectionname = options.connectionname
    const mapping = options.mapping
    const includeErrors = options.includeErrors
    const schema = options.schema
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
            if(chunk.errors.length === 0 || options.includeErrors){
                insertStatement = writeInsertStatement(mapping, table, chunk, schema)
                debug('Insert statement: [%s]', insertStatement)
                // @ts-ignore
                this.connection.db.query(insertStatement)
                    .then(result => {
                        debug('result %o', result)
                        chunk._result = result
                        lastChunk = chunk
                        // @ts-ignore
                        this.tasks?.forEach(task => task.write(chunk))
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
    Object.assign(Transform.prototype, {
        type: 'PostgresDestination',
        setConnection: function (connection){
            this.connection = connection
        }.bind(transform),
        getConnectionName: function (){
            return this.connection?.name
        }.bind(transform),
        setTasks: function(tasks){
            this.tasks = tasks
        }.bind(transform)
    })
    return transform;
}

module.exports = {
    PostgresDestination,
    writeInsertStatement,
    isKeyWord,
    getMappingForColumn,
    hasReturningColumns,
    getReturningColumns
}
