const DEFAULT_PORT = 5432
const { Sequelize } = require('sequelize')
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
 * @returns Connection
 */
async function PostgresDatabaseConnection(options){
    const connectionname = options.connectionname
    const username = options.username
    const password = options.password
    const database = options.database
    const host = options.host
    const port = options.port || DEFAULT_PORT

    const sequelize = new Sequelize(database, username, password, {
      host: host,
      port: port,
      dialect: 'postgres',
      logging: false
    })

    try{
      await sequelize.authenticate()
      debug('sequelize.authenticate succeeded')
      return {
        name: connectionname,
        db: sequelize
      }
    } catch(e){
        debug('sequelize.authenticate failed')
        debug(e)
        throw e
    }
}

module.exports = {
  PostgresDatabaseConnection
}