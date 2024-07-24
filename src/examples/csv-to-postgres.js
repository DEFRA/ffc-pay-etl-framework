const { Etl, Loaders, Destinations } = require("ffc-pay-etl-framework")

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
.loader(Loaders.CSVLoader({path: csvFile, columns: columns}))
.destination(Destinations.PostgresDestination({ 
    username: "postgres",
    password: "ppp",
    table: "target",
    host: "localhost",
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