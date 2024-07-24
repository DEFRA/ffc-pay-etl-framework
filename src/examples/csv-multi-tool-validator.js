const { Etl, Loaders, Validators, Destinations } = require("ffc-pay-etl-framework")

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
.validator(Validators.MultiToolValidator( { columns: [
    {
        name: "SOIL TYPE PERCENT (Percent)",
        validator: "isAlphanumeric",
        args: {
                locale: "en-GB",
                options: {
                    ignore: "-;%/ "
                }
        }
    }
]
}))
.destination(Destinations.CSVFileDestination({ 
    fileName: "SoilType_Output.csv", 
    headers: true, 
    includeErrors: false, 
    quotationMarks: true
}))
.pump()
