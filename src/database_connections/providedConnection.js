/**
 * 
 * @param {Object} options 
 * @param {Object} options.connectionname
 * @param {Object} options.sequelize
 * @returns Connection
 */
async function ProvidedConnection(options){
  const connectionname = options.connectionname
  const sequelize = options.sequelize
  return {
    name: connectionname,
    db: sequelize
  }
}

module.exports = {
  ProvidedConnection
}