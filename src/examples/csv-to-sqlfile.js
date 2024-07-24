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
.destination(Destinations.SQLFileDestination({ 
    fileName: "output.sql", 
    mode: Destinations.SQL_MODE.INSERT_MODE,
    table: "target",
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