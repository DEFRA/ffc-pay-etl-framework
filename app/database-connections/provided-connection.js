/**
 *
 * @param {Object} options
 * @param {Object} options.connectionname
 * @param {Object} options.sequelize
 * @returns Connection
 */
async function providedConnection (options) {
  const connectionname = options.connectionname
  const sequelize = options.sequelize
  return {
    name: connectionname,
    db: sequelize
  }
}

module.exports = {
  ProvidedConnection: providedConnection
}
