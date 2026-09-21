/**
 *
 * @param {Object} options
 * @param {Object} options.connectionname
 * @param {Object} options.connection - the object returned by ffc-database's Database#connect()
 * @returns Connection
 */
async function providedConnection (options) {
  const connectionname = options.connectionname
  const connection = options.connection
  return {
    name: connectionname,
    db: connection ? { ...connection, query: (sql) => connection.client.raw(sql) } : connection
  }
}

module.exports = {
  ProvidedConnection: providedConnection
}
