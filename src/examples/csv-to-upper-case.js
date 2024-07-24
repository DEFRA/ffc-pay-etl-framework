const { Etl, Loaders, Transformers, Destinations } = require("ffc-pay-etl-framework")

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
.transform(Transformers.ToUpperCaseTransformer({ column: "State Name" }))
.destination(Destinations.CSVFileDestination({ 
    fileName: "SoilType_Output.csv", 
    headers: true, 
    includeErrors: false, 
    quotationMarks: true
}))
.pump()
