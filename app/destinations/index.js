const { ConsoleDestination } = require('./console-destination')
const { SQLFileDestination, SQL_MODE } = require('./sql-file-destination')
const { CSVFileDestination } = require('./csv-file-destination')
const { PostgresDestination } = require('./postgres-destination')

module.exports = {
  ConsoleDestination,
  SQLFileDestination,
  SQL_MODE,
  CSVFileDestination,
  PostgresDestination
}
