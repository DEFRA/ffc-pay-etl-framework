const EventEmitter = require('node:events')
const util = require('node:util')
const { Transform } = require('node:stream')
const { Sequelize } = require('sequelize')
const debug = require('debug')('destination')
const DEFAULT_PORT = 5432
/**
 * 
 * @param {Object} options 
 * @param {Object} options.table
 * @param {Object} options.username
 * @param {Object} options.password
 * @param {Object} options.database
 * @param {Object} options.host
 * @param {Object} options.port
 * @param {Object} options.mapping
 * @param {Object} options.includeErrors
 * @returns Transform
 */
function PostgresDestination(options){
    EventEmitter.call(this)
    const table = options.table
    const username = options.username
    const password = options.password
    const database = options.database
    const host = options.host
    const port = options.port || DEFAULT_PORT
    const mapping = options.mapping
    const includeErrors = options.includeErrors
    let lastChunk

    const sequelize = new Sequelize(database, username, password, {
        host: host,
        port: port,
        dialect: 'postgres',
        logging: false
    })

    try{
        sequelize.authenticate()
        debug('sequelize.authenticate succeeded')
    } catch(e){
        debug('sequelize.authenticate failed')
        debug(e)
        throw e
    }

    function getMappingForColumn(column){
        const [map] = mapping.filter(m => m.column === column)
        return map
    }
    function isKeyWord(column) {
        return ['USER'].includes(column.toUpperCase())
    }
    function writeInsertStatement(chunk){
        let statement = `INSERT INTO ${table} (${chunk._columns.map(column => {
            let mapping = getMappingForColumn(column)
            return mapping
                ?
                isKeyWord(mapping.targetColumn)
                    ? `"${mapping.targetColumn}"`
                    : mapping.targetColumn
                : isKeyWord(column)
                    ? `"${mapping.column}"`
                    : mapping.column
        })
        .join(",")}) VALUES (${chunk._columns.map((column,index) => {
            let mapping = getMappingForColumn(column)
            if(!mapping) debug('Mapping not found for column %s', column)
            if (mapping.targetType === "number" && (isNaN(chunk[index]) || chunk[index] === '')) {
                debug('Source data is not a number')
                return 0
            }
            if(mapping.targetType === "varchar" || mapping.targetType === "char")
                return `'${chunk[index]}'`
            return chunk[index] ? chunk[index] : 'null'
        })})`
        return statement
    }
    return new Transform({
        objectMode: true,
        emitClose: true,
        construct(callback){
                        // @ts-ignore
            this.sequelize = sequelize
            callback()
        },
        write(chunk, _, callback){
            let insertStatement
            // @ts-ignore
            if(chunk.errors.length === 0 | options.includeErrors){
                insertStatement = writeInsertStatement(chunk)
                debug('Insert statement: [%s]', insertStatement)
                // @ts-ignore
                this.sequelize.query(insertStatement)
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
                        callback(null, chunk)
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
}

module.exports = {
    PostgresDestination
}
