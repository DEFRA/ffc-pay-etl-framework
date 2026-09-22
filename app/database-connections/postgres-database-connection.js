const { Database } = require('ffc-database')
const debug = require('debug')('connection')

/**
 *
 * @param {Object} options
 * @param {Object} options.connectionname
 * @param {Object} options.username
 * @param {Object} options.password
 * @param {Object} options.database
 * @param {Object} options.host
 * @param {Object} options.port
 * @param {Object} [options.schema]
 * @param {Object} [options.ssl]
 * @param {Object} [options.tables]
 * @param {Object} [options.pool]
 * @param {Boolean} [options.useAzureManagedIdentity]
 * @param {String} [options.azureClientId]
 * @returns Connection
 */
async function postgresDatabaseConnection (options) {
  const connectionname = options.connectionname

  const database = new Database({
    database: options.database,
    username: options.username,
    password: options.password,
    host: options.host,
    port: options.port || 5432,
    schema: options.schema,
    ssl: options.ssl,
    tables: options.tables,
    pool: options.pool,
    useAzureManagedIdentity: options.useAzureManagedIdentity,
    azureClientId: options.azureClientId
  })

  try {
    const connection = database.connect()
    await connection.client.raw('select 1')
    debug('database connection succeeded')
    return {
      name: connectionname,
      db: {
        ...connection,
        query: (sql) => connection.client.raw(sql)
      }
    }
  } catch (e) {
    debug('database connection failed')
    debug(e)
    throw e
  }
}

module.exports = {
  PostgresDatabaseConnection: postgresDatabaseConnection
}
