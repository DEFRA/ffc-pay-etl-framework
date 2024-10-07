const { Etl, Loaders, Destinations, Connections } = require("ffc-pay-etl-framework")

let csvFile = `${process.cwd()}/test/fixtures/SoilType.csv`

const columns = [
    "Dist Code",
    "Year",
    "State Code",
    "State Name",
    "Dist Name",
    "SOIL TYPE PERCENT (Percent)"
]

const etl = new Etl.Etl()

etl
.connection(new Connections.PostgresDatabaseConnection({
    name: 'MyConnection',
    username: "postgres",
    password: "ppp",
    host: "localhost"
}))
.loader(Loaders.CSVLoader({path: csvFile, columns: columns}))
.destination(Destinations.PostgresDestination({ 
    table: "target",
    connection: "MyConnection",
    mapping: [
        {
            column: "Dist Code",
            targetColumn: "dist_code",
            targetType: "string"
        }
    ],
    includeErrors: false
}))
.pump()