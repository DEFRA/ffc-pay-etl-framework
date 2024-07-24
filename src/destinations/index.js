const { ConsoleDestination } = require("./consoleDestination")
const { SQLFileDestination, SQL_MODE } = require("./sqlFileDestination")
const { CSVFileDestination } = require("./csvFileDestination")
const { PostgresDestination } = require("./postgresDestination")

module.exports = {
    ConsoleDestination,
    SQLFileDestination,
    SQL_MODE,
    CSVFileDestination,
    PostgresDestination
}