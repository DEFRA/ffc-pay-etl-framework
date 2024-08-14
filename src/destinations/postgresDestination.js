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
    
    const table = options.table
    const username = options.username
    const password = options.password
    const database = options.database
    const host = options.host
    const port = options.port || DEFAULT_PORT
    const mapping = options.mapping
    const includeErrors = options.includeErrors

    const sequelize = new Sequelize(database, username, password, {
        host: host,
        port: port,
        dialect: 'postgres',
        logging: false
    })

        sequelize.authenticate()
        debug('sequelize.authenticate succeeded')
    } catch(e){
        debug('sequelize.authenticate failed')
        debug(e)
    }

    function getMappingForColumn(column){
        const [map] = mapping.filter(m => m.column === column)
        return map
    }
    function writeInsertStatement(chunk){
        let statement = `INSERT INTO ${table} (${chunk._columns.map(column => {
            let mapping = getMappingForColumn(column)
            return mapping ? mapping.targetColumn : column
        })
        .join(",")}) VALUES (${chunk._columns.map((column,index) => {
            let mapping = getMappingForColumn(column)
            if(!mapping) debug('Mapping not found for column %s', column)
            if(mapping.targetType === "varchar" || mapping.targetType === "char")
                return `'${chunk[index]}'`
            return chunk[index]
        })})`
        return statement
    }
    return new Transform({
        objectMode: true,
        transform(chunk, _, callback){
            let insertStatement
            // @ts-ignore
            if(chunk.errors.length === 0 | options.includeErrors){
                insertStatement = writeInsertStatement(chunk)
                debug('Insert statement: [%s]', insertStatement)
                sequelize.query(insertStatement)
                    .then(result => {
                        debug('result %o', result)
                        chunk._result = result
                        callback(null, chunk)
                    }).catch(error => {
                        debug('error %o', error)
                        chunk.errors.push(error)
                        callback(null, chunk)
                    })
            }
        }
    })
}

module.exports = {
    PostgresDestination
}
